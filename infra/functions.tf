# =============================================================================
# Function App — Automation Hub backend (/api/*)
#
# FC1 Flex Consumption, Node runtime, SystemAssigned MI, public + Entra-gated.
# Registered as the primary SWA's linked backend so /api/* is served under the
# same Entra auth and custom domain — no separate Front Door route. Follows the
# Veradigm standard in agents.md "Adding a Function App and Storage Account".
#
# Stateless: talks only to GitHub / Jira / Xray. Secrets come from the per-site
# Key Vault as @Microsoft.KeyVault(...) references (keyvault.tf), never plain.
# =============================================================================

resource "azurerm_service_plan" "functions" {
  name                = "asp-${var.site_name}-fn"
  resource_group_name = data.azurerm_resource_group.swa.name
  location            = var.regions.primary
  os_type             = "Linux"
  sku_name            = "FC1" # Flex Consumption — supports MI runtime-storage auth
  tags                = var.tags
}

resource "azurerm_function_app_flex_consumption" "app" {
  name                = "func-${var.site_name}-prd"
  resource_group_name = data.azurerm_resource_group.swa.name
  location            = var.regions.primary
  service_plan_id     = azurerm_service_plan.functions.id

  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "${azurerm_storage_account.func_runtime.primary_blob_endpoint}${azurerm_storage_container.deployments.name}"
  storage_authentication_type = "SystemAssignedIdentity" # NOT a connection string

  runtime_name    = "node"
  runtime_version = var.function_runtime_version

  https_only                    = true
  public_network_access_enabled = true # public + Entra-gated

  # Do NOT set virtual_network_subnet_id — FC1 VNet integration leaves a
  # legionservicelink that needs Owner-level manual cleanup to destroy (agents.md).

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_insights_connection_string = azurerm_application_insights.site.connection_string
    minimum_tls_version                    = "1.2"
  }

  app_settings = {
    # Runtime storage via MI. Do NOT also set the plain AzureWebJobsStorage
    # connection string — Azure sometimes injects it with an empty AccountKey
    # and that overrides the MI path with AuthenticationFailed (agents.md).
    AzureWebJobsStorage__accountName = azurerm_storage_account.func_runtime.name
    AzureWebJobsStorage__credential  = "managedidentity"

    # Backend config (non-secret)
    GITHUB_OWNER         = var.github_owner
    GITHUB_REPO          = var.github_repo
    GITHUB_TARGET_BRANCH = var.github_target_branch
    JIRA_BASE_URL        = var.jira_base_url

    # Secrets — KV references (trailing slash on SecretUri = "latest version").
    GITHUB_COPILOT_TOKEN = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.github_token.versionless_id}/)"
    GITHUB_TOKEN         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.github_token.versionless_id}/)"
    JIRA_USER            = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.jira_user.versionless_id}/)"
    JIRA_API_TOKEN       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.jira_api_token.versionless_id}/)"
    XRAY_CLIENT_ID       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.xray_client_id.versionless_id}/)"
    XRAY_CLIENT_SECRET   = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.xray_client_secret.versionless_id}/)"
  }

  auth_settings_v2 {
    auth_enabled           = true
    require_authentication = true
    unauthenticated_action = "Return401" # NOT RedirectToLoginPage — leaks intent
    excluded_paths         = ["/api/health"]

    azure_static_web_app_v2 {
      client_id = azurerm_static_web_app.primary.default_host_name
    }

    login {
      token_store_enabled = false # schema requires at least one login{} block
    }
  }

  tags = var.tags
}

# ── FC1 host MI grants on the runtime SA ──
# Required or the host hangs in FunctionsHostNotRunning on cold start (agents.md).
resource "azurerm_role_assignment" "func_runtime_blob" {
  scope                = azurerm_storage_account.func_runtime.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.app.identity[0].principal_id
}

resource "azurerm_role_assignment" "func_runtime_queue" {
  scope                = azurerm_storage_account.func_runtime.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.app.identity[0].principal_id
}

resource "azurerm_role_assignment" "func_runtime_table" {
  scope                = azurerm_storage_account.func_runtime.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.app.identity[0].principal_id
}

# ── Strip the platform-injected keyless AzureWebJobsStorage (fleet standard) ──
# The FC1 host authenticates to runtime storage via MI
# (AzureWebJobsStorage__accountName + __credential=managedidentity). Azure injects a
# plain AzureWebJobsStorage connection string with an empty AccountKey that overrides
# the MI path with AuthenticationFailed (agents.md). This read-then-strip chain re-writes
# the app settings on every apply with that one key removed — preserving everything else
# (APPLICATIONINSIGHTS_CONNECTION_STRING, the __accountName/__credential pair, etc.).
# Matches the template's infra/functions.tf.
resource "azapi_resource_action" "read_app_settings" {
  type                   = "Microsoft.Web/sites@2024-04-01"
  resource_id            = azurerm_function_app_flex_consumption.app.id
  action                 = "config/appsettings/list"
  method                 = "POST"
  response_export_values = ["properties"]
  lifecycle {
    replace_triggered_by = [azurerm_function_app_flex_consumption.app]
  }
}

resource "azapi_update_resource" "strip_webjobs_storage" {
  type        = "Microsoft.Web/sites/config@2024-04-01"
  resource_id = "${azurerm_function_app_flex_consumption.app.id}/config/appsettings"
  body = {
    properties = {
      for k, v in azapi_resource_action.read_app_settings.output.properties :
      k => v if k != "AzureWebJobsStorage"
    }
  }
  depends_on = [
    azurerm_role_assignment.func_runtime_blob,
    azurerm_role_assignment.func_runtime_queue,
    azurerm_role_assignment.func_runtime_table,
  ]
  lifecycle {
    replace_triggered_by = [azapi_resource_action.read_app_settings]
  }
}

# ── Link the Function App as the primary SWA's backend (serves /api/*) ──
# Routes /api/* through the SWA under the existing Entra auth + custom domain.
# Single-region (primary). DR SWA serves static content only on failover; API
# DR is a separate follow-up if needed.
resource "azurerm_static_web_app_function_app_registration" "primary" {
  static_web_app_id = azurerm_static_web_app.primary.id
  function_app_id   = azurerm_function_app_flex_consumption.app.id
}

output "function_app_name" {
  description = "Name of the Automation Hub backend Function App"
  value       = azurerm_function_app_flex_consumption.app.name
}

output "function_app_default_hostname" {
  description = "Default hostname of the backend Function App"
  value       = azurerm_function_app_flex_consumption.app.default_hostname
}
