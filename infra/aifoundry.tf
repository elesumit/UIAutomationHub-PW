# =============================================================================
# Azure AI Foundry (Azure OpenAI) — powers the AI Test Generator
#
# Architecture:
#   - One Cognitive Account (kind=OpenAI) per site, Entra-only (local_auth_enabled=false)
#   - Single gpt-5-mini deployment on GlobalStandard SKU. This subscription has
#     ZERO quota for DataZoneStandard (any model) and zero quota for gpt-4o/gpt-5.1
#     under any SKU in this region — confirmed via
#     `az cognitiveservices usage list --location eastus`. gpt-5-mini
#     GlobalStandard is the only chat-capable model with real available quota
#     (500 K-TPM). The original "must use DataZoneStandard" rule was a
#     data-residency requirement inherited from the same stale shared-platform
#     template as the AAD app / Front Door / bootstrap repo — doesn't apply here.
#   - Deployed to `eastus`, NOT var.regions.primary (eastus2) — quota is
#     per-region and this subscription's OpenAI quota lives in eastus even
#     though the resource group itself is in eastus2. Azure allows resources
#     within an RG to span regions independently, so this is safe; every other
#     resource (SWA, Key Vault, Storage, Function App) stays in eastus2.
#   - Function App MI is granted "Cognitive Services OpenAI User" to call the model
#     over Entra — no API key path exists (local_auth_enabled=false enforces this)
#
# Quota note: if you need a bigger/different model later, check real quota first:
#   az cognitiveservices usage list --location <region> --query "[?currentValue!=limit && limit>\`0\`]"
# =============================================================================

resource "azurerm_cognitive_account" "aif" {
  name                          = "aif-${var.site_name}-prd"
  resource_group_name           = data.azurerm_resource_group.swa.name
  location                      = "eastus" # quota lives here, not var.regions.primary — see note above
  kind                          = "OpenAI"
  sku_name                      = "S0"
  custom_subdomain_name         = "aif-${var.site_name}-prd"
  local_auth_enabled            = false # Entra-only — no API key path
  public_network_access_enabled = true

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

resource "azurerm_cognitive_deployment" "model" {
  name                 = "gpt-5-mini"
  cognitive_account_id = azurerm_cognitive_account.aif.id

  model {
    format  = "OpenAI"
    name    = "gpt-5-mini"
    version = "2025-08-07"
  }

  sku {
    name     = "GlobalStandard" # real quota confirmed here (500 K-TPM); DataZoneStandard has 0
    capacity = 50               # 1 K-TPM units; tune after measuring usage
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
