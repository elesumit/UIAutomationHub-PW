# =============================================================================
# Runtime Storage — FC1 Function App host storage (api/* backend)
#
# FC1 Flex Consumption requires ONE storage account for the host (deployment
# package + runtime state). This backend is STATELESS — it persists nothing of
# its own (all state lives in GitHub/Jira/Xray) — so this is the ONLY storage
# account and there are NO data tables. No azurerm_storage_table, no giovanni
# gotcha (see agents.md).
#
# Standard: public endpoint reachable, but Entra-only — shared keys disabled,
# auth is the gate (agents.md "public + Entra-only + MI"). Requires
# storage_use_azuread = true in providers.tf and CloudOps pre-flight items #1/#3
# in docs/cloudops-preflight-CLPASD-44.md.
# =============================================================================

locals {
  # 3-24 chars, lowercase alphanumeric only. "st" + alnum(site) + 6-char hash.
  func_sa_prefix = substr("st${replace(var.site_name, "-", "")}", 0, 18)
  func_sa_name   = "${local.func_sa_prefix}${substr(sha1(var.site_name), 0, 6)}"
}

resource "azurerm_storage_account" "func_runtime" {
  name                     = local.func_sa_name
  resource_group_name      = data.azurerm_resource_group.swa.name
  location                 = var.regions.primary
  account_tier             = "Standard"
  account_replication_type = "LRS" # runtime/scratch — LRS is sufficient
  account_kind             = "StorageV2"

  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = false

  # NON-NEGOTIABLE: keys off, Entra-only (agents.md).
  shared_access_key_enabled = false

  # Public endpoint reachable; firewall opens to internet, auth is the gate.
  public_network_access_enabled = true

  network_rules {
    default_action = "Allow"
    bypass         = ["AzureServices"]
  }

  tags = var.tags
}

# FC1 deployment package container. Created over the DATA plane via AAD
# (storage_use_azuread = true), so the TF runner MI needs Storage Blob Data
# Contributor on this SA. That grant is pre-created OUT OF BAND by CloudOps
# (pre-flight item #3) because the per-site runner MI's principal id cannot be
# resolved reliably in TF, and the data-plane read happens during refresh before
# any TF-managed grant could propagate.
resource "azurerm_storage_container" "deployments" {
  name                  = "deployments"
  storage_account_id    = azurerm_storage_account.func_runtime.id
  container_access_type = "private"
}

output "func_runtime_sa_name" {
  description = "Name of the FC1 runtime storage account (referenced in the CloudOps pre-flight doc)"
  value       = azurerm_storage_account.func_runtime.name
}
