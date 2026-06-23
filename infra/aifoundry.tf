# =============================================================================
# Azure AI Foundry (Azure OpenAI) — powers the AI Test Generator
#
# Architecture:
#   - One Cognitive Account (kind=OpenAI) per site, Entra-only (local_auth_enabled=false)
#   - Single gpt-4o deployment on DataZoneStandard SKU (data-zone requirement — do NOT
#     use GlobalStandard; see § quota note below)
#   - Function App MI is granted "Cognitive Services OpenAI User" to call the model
#     over Entra — no API key path exists (local_auth_enabled=false enforces this)
#
# Quota note (first apply):
#   Confirm gpt-4o DataZoneStandard quota is available in East US 2 before applying.
#   If not present, request DataZoneStandard quota — do NOT fall back to GlobalStandard.
#   The deployment will fail to apply if quota is insufficient.
#
# CloudOps pre-auth:
#   The site's deploy identity (var.mi_client_id) is pre-authorized by CloudOps to
#   grant the Function App MI "Cognitive Services OpenAI User" at Foundry scope.
#   No additional ABAC condition expansion is needed for this role.
# =============================================================================

resource "azurerm_cognitive_account" "aif" {
  name                          = "aif-${var.site_name}-prd"
  resource_group_name           = data.azurerm_resource_group.swa.name
  location                      = var.regions.primary
  kind                          = "OpenAI"
  sku_name                      = "S0"
  custom_subdomain_name         = "aif-${var.site_name}-prd"
  local_auth_enabled            = false   # Entra-only — no API key path
  public_network_access_enabled = true

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

resource "azurerm_cognitive_deployment" "model" {
  name                 = "gpt-4o"
  cognitive_account_id = azurerm_cognitive_account.aif.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o"
    version = "2024-11-20"
  }

  sku {
    name     = "DataZoneStandard"   # REQUIRED — do not change to GlobalStandard
    capacity = 50                   # 1 K-TPM units; tune after measuring usage
  }

  version_upgrade_option = "OnceNewDefaultVersionAvailable"
}

# Grant the Function App's MI permission to call the model.
# Scoped to the Cognitive Account (not subscription-wide).
resource "azurerm_role_assignment" "func_aif_openai_user" {
  scope                = azurerm_cognitive_account.aif.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_function_app_flex_consumption.app.identity[0].principal_id
}

# ── Outputs ──

output "aif_endpoint" {
  description = "Azure AI Foundry endpoint — set as AIF_ENDPOINT in Function App app_settings"
  value       = azurerm_cognitive_account.aif.endpoint
}

output "aif_deployment_name" {
  description = "Model deployment name — set as AIF_DEPLOYMENT_NAME in Function App app_settings"
  value       = azurerm_cognitive_deployment.model.name
}
