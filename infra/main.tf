# =============================================================================
# Azure Static Web App Resources — Dual-Region (Primary + DR)
# Arch doc: "Azure Static Web Apps (Standard Tier) — 2 instances per site"
# =============================================================================

data "azurerm_resource_group" "swa" {
  name = var.resource_group
}

# ── Primary SWA — East US 2 ──
resource "azurerm_static_web_app" "primary" {
  name                = var.swa_name_primary
  resource_group_name = data.azurerm_resource_group.swa.name
  location            = var.regions.primary
  sku_tier            = "Standard"
  sku_size            = "Standard"

  # System-assigned MI is the SWA's default identity for resolving
  # @Microsoft.KeyVault(...) references in app_settings. The role assignment
  # for this identity on the KV secret is created via null_resource in
  # keyvault.tf (TF can't reference identity[0].principal_id at plan time
  # for in-place SWA updates).
  identity {
    type = "SystemAssigned"
  }

  # AAD_CLIENT_SECRET below: trailing slash on the SecretUri is REQUIRED for
  # SWA's KV-reference resolver to treat this as "latest version" — without
  # it SWA stores the raw string as the literal secret value and the AAD auth
  # provider fails to register at startup (/.auth/login/aad returns 404).
  # Verified on cloudops-sandbox 2026-04-30.
  app_settings = {
    AAD_CLIENT_ID     = var.aad_client_id
    AAD_CLIENT_SECRET = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.aad_client_secret.versionless_id}/)"
  }

  tags = var.tags
}

# ── DR SWA — Central US ──
resource "azurerm_static_web_app" "dr" {
  name                = var.swa_name_dr
  resource_group_name = data.azurerm_resource_group.swa.name
  location            = var.regions.dr
  sku_tier            = "Standard"
  sku_size            = "Standard"

  identity {
    type = "SystemAssigned"
  }

  # AAD_CLIENT_SECRET below: trailing slash on the SecretUri is REQUIRED for
  # SWA's KV-reference resolver to treat this as "latest version" — without
  # it SWA stores the raw string as the literal secret value and the AAD auth
  # provider fails to register at startup (/.auth/login/aad returns 404).
  # Verified on cloudops-sandbox 2026-04-30.
  app_settings = {
    AAD_CLIENT_ID     = var.aad_client_id
    AAD_CLIENT_SECRET = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.aad_client_secret.versionless_id}/)"
  }

  tags = var.tags
}

# ── Outputs ──
output "site_name" {
  description = "Site identifier used for naming resources"
  value       = var.site_name
}

output "swa_primary_url" {
  description = "Default hostname of the primary SWA instance"
  value       = azurerm_static_web_app.primary.default_host_name
}

output "swa_dr_url" {
  description = "Default hostname of the DR SWA instance"
  value       = azurerm_static_web_app.dr.default_host_name
}

output "swa_primary_id" {
  description = "Resource ID of the primary SWA instance"
  value       = azurerm_static_web_app.primary.id
}

output "swa_dr_id" {
  description = "Resource ID of the DR SWA instance"
  value       = azurerm_static_web_app.dr.id
}

output "swa_primary_api_key" {
  description = "API key for deploying to primary SWA (use as GH secret)"
  value       = azurerm_static_web_app.primary.api_key
  sensitive   = true
}

output "swa_dr_api_key" {
  description = "API key for deploying to DR SWA (use as GH secret)"
  value       = azurerm_static_web_app.dr.api_key
  sensitive   = true
}
