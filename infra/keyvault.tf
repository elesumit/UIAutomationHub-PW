# =============================================================================
# Per-Site Key Vault — holds the AAD client secret for SWA OIDC sign-in.
#
# Architecture: one KV per site, in the site's per-site RG. The KV holds the
# `aad-client-secret` referenced by SWA app_settings as `@Microsoft.KeyVault(SecretUri=...)`.
# Both SWAs (primary + DR) get their system-assigned MI granted Secrets User
# scoped to that single secret — read-only, single-secret access, can't see
# anything else in the vault.
#
# Naming: deterministic `kv-{site[:14]}-{6-char-sha1}` so the bootstrap MI's
# RBAC (Key Vault Secrets Officer at RG scope, granted in Phase 2c) covers
# the KV without needing to know its name in advance. KV names are 24-char
# max + globally unique; truncating site_name to 14 + appending a SHA1 prefix
# keeps both invariants.
# =============================================================================

data "azurerm_client_config" "current" {}

locals {
  # 24 = 3 ("kv-") + 14 (site_name truncated) + 1 ("-") + 6 (hash)
  # Trim a trailing hyphen if truncation leaves one (would violate KV naming).
  kv_prefix = trimsuffix(substr(var.site_name, 0, 14), "-")
  kv_hash   = substr(sha1(var.site_name), 0, 6)
  kv_name   = "kv-${local.kv_prefix}-${local.kv_hash}"
}

resource "azurerm_key_vault" "site" {
  name                       = local.kv_name
  resource_group_name        = data.azurerm_resource_group.swa.name
  location                   = var.regions.primary
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  soft_delete_retention_days = 90
  purge_protection_enabled   = true

  public_network_access_enabled = true
  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }

  tags = var.tags
}

# Holds the AAD client secret. Value comes from var.aad_client_secret on first
# apply and on rotations. The TF runner (per-site MI) needs `Key Vault Secrets
# Officer` on the parent RG to write here — granted by the bootstrap in Phase 2c.
resource "azurerm_key_vault_secret" "aad_client_secret" {
  name         = "aad-client-secret"
  value        = var.aad_client_secret
  key_vault_id = azurerm_key_vault.site.id

  tags = var.tags
}

# Each SWA's system-assigned MI gets Secrets User scoped to ONLY this secret.
# Read-only, no list, no other secrets. The MI can't even see other secrets'
# names exist.
resource "azurerm_role_assignment" "swa_primary_kv_read" {
  scope                = azurerm_key_vault_secret.aad_client_secret.resource_versionless_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_static_web_app.primary.identity[0].principal_id
}

resource "azurerm_role_assignment" "swa_dr_kv_read" {
  scope                = azurerm_key_vault_secret.aad_client_secret.resource_versionless_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_static_web_app.dr.identity[0].principal_id
}

output "kv_name" {
  description = "Per-site Key Vault name"
  value       = azurerm_key_vault.site.name
}

output "kv_secret_uri" {
  description = "Versionless URI of the AAD client secret (referenced by SWA app_settings)"
  value       = azurerm_key_vault_secret.aad_client_secret.versionless_id
}
