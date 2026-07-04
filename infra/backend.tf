# =============================================================================
# Terraform State Backend — Azure Storage
# =============================================================================
# Each site repo stores its state in a unique key under a shared storage account.
# The key is derived from the site name to avoid collisions.

terraform {
  backend "azurerm" {
    resource_group_name  = "my-automation-rg"
    storage_account_name = "myautomationtfstate"
    container_name       = "tfstate"
    key                  = "automation-pw.tfstate"
    use_oidc             = true
    tenant_id            = "21f2717a-4fc6-4665-b7ad-b490a46167e3"
    subscription_id      = "c4b21de8-bb1c-4efb-b4ec-9431dc344558"
    client_id            = "c990a453-711f-44d9-9285-8d4caa179d30"
  }
}
