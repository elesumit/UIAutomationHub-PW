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
  tenant_id                       = "21f2717a-4fc6-4665-b7ad-b490a46167e3"
  subscription_id                 = "c4b21de8-bb1c-4efb-b4ec-9431dc344558" 
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
  tenant_id       = "21f2717a-4fc6-4665-b7ad-b490a46167e3"
  subscription_id = "c4b21de8-bb1c-4efb-b4ec-9431dc344558"
  client_id       = var.mi_client_id
}

# Alias provider — subscription (dev/stg SWA instances)
# Used only when deploying to non-prod environments
provider "azurerm" {
  alias = "zirconium"
  features {}
  resource_provider_registrations = "none"
  use_oidc                        = true
  tenant_id                       = "21f2717a-4fc6-4665-b7ad-b490a46167e3"
  subscription_id                 = "c4b21de8-bb1c-4efb-b4ec-9431dc344558" # Zirconium - Sandbox
  client_id                       = var.mi_client_id
}
