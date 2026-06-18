# =============================================================================
# Providers — AzureRM for Neon (prod) and Zirconium (dev/stg)
# =============================================================================

terraform {
  required_version = ">= 1.12.2, < 2.0.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0.0, < 5.0.0"
    }
    azapi = {
      source  = "Azure/azapi"
      version = ">= 2.0.0, < 3.0.0"
    }
  }
}

# Primary provider — Neon subscription (production SWA + Front Door)
provider "azurerm" {
  features {}
  resource_provider_registrations = "none"
  use_oidc                        = true
  tenant_id                       = "21d8e422-7fd3-4634-8c8a-01dfde9a5502"
  subscription_id                 = "54305029-7d35-40a9-8bf9-950963b449cc" # Neon - Veradigm Tools
  client_id                       = var.mi_client_id

  # REQUIRED with shared_access_key_enabled = false on the FC1 runtime storage
  # account (storage.tf). Without it the provider's data-plane refresh defaults
  # to Shared Key and fails with 403 KeyBasedAuthenticationNotPermitted, which
  # then blocks every subsequent `terraform plan`. See agents.md.
  storage_use_azuread = true
}

# azapi provider — used for the AzureWebJobsStorage strip chain (functions.tf).
# It does NOT inherit the azurerm provider's auth, so it needs its own OIDC config;
# without it azapi falls back to Azure CLI and fails with "please run az login" on
# the runner.
provider "azapi" {
  use_oidc        = true
  tenant_id       = "21d8e422-7fd3-4634-8c8a-01dfde9a5502"
  subscription_id = "54305029-7d35-40a9-8bf9-950963b449cc"
  client_id       = var.mi_client_id
}

# Alias provider — Zirconium subscription (dev/stg SWA instances)
# Used only when deploying to non-prod environments
provider "azurerm" {
  alias = "zirconium"
  features {}
  resource_provider_registrations = "none"
  use_oidc                        = true
  tenant_id                       = "21d8e422-7fd3-4634-8c8a-01dfde9a5502"
  subscription_id                 = "ffd7017b-28ed-4e90-a2ec-4a6958578f98" # Zirconium - Veradigm Sandbox
  client_id                       = var.mi_client_id
}
