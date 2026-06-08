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
