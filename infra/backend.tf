# =============================================================================
# Terraform State Backend — Azure Storage
# =============================================================================
# Each site repo stores its state in a unique key under a shared storage account.
# The key is derived from the site name to avoid collisions.

terraform {
  backend "azurerm" {
    resource_group_name  = "Ue2NeSwPrdTerraformRG"
    storage_account_name = "ue2neswprdtfsa"
    container_name       = "tfstate"
    key                  = "staticweb/SITE_NAME.tfstate"
    use_oidc             = true
    tenant_id            = "21d8e422-7fd3-4634-8c8a-01dfde9a5502"
    subscription_id      = "54305029-7d35-40a9-8bf9-950963b449cc"
    client_id            = "MI_CLIENT_ID"
  }
}
