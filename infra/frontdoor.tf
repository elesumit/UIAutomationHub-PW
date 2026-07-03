# =============================================================================
# Front Door — Per-Site Configuration
# Arch doc: "Per-site endpoints, origin groups, routes, custom domains, and WAF
# associations are created by each site's template repo Terraform — keeping the
# Neon parent repo stable while allowing new sites to self-register on Front Door."
#
# Each site creates: endpoint, origin group, origins, custom domain, route,
# DNS records, and WAF security policy association.
#
# NOTE: Front Door profile + shared WAF policy are managed in the Neon parent
# repo (CloudOps/Alex responsibility). This file only creates per-site resources.
# =============================================================================

# ── Reference existing shared Front Door profile (Neon) ──
data "azurerm_cdn_frontdoor_profile" "shared" {
  name                = var.frontdoor_profile_name
  resource_group_name = var.frontdoor_resource_group
}

# ── Endpoint — per-site ep-<siteName> ──
resource "azurerm_cdn_frontdoor_endpoint" "site" {
  name                     = "ep-${var.site_name}"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared.id
}

# ── Origin Group — og-<siteName> ──
resource "azurerm_cdn_frontdoor_origin_group" "site" {
  name                     = "og-${var.site_name}"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared.id
  session_affinity_enabled = false

  health_probe {
    path                = "/"
    protocol            = "Https"
    interval_in_seconds = 30
    request_type        = "HEAD"
  }

  load_balancing {
    sample_size                        = 4
    successful_samples_required        = 2
    additional_latency_in_milliseconds = 0
  }
}

# ── Origin — Primary SWA (East US 2, priority 1) ──
resource "azurerm_cdn_frontdoor_origin" "primary" {
  name                          = "swa-${var.site_name}-ue2"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.site.id
  enabled                       = true

  host_name                      = azurerm_static_web_app.primary.default_host_name
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = azurerm_static_web_app.primary.default_host_name
  certificate_name_check_enabled = true
  priority                       = 1
  weight                         = 1000
}

# ── Origin — DR SWA (Central US, priority 2) ──
resource "azurerm_cdn_frontdoor_origin" "dr" {
  name                          = "swa-${var.site_name}-uc1"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.site.id
  enabled                       = true

  host_name                      = azurerm_static_web_app.dr.default_host_name
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = azurerm_static_web_app.dr.default_host_name
  certificate_name_check_enabled = true
  priority                       = 2
  weight                         = 1000
}

# ── Custom Domain — <siteName>.com ──
resource "azurerm_cdn_frontdoor_custom_domain" "site" {
  name                     = replace(var.custom_domain, ".", "-")
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared.id
  host_name                = var.custom_domain

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

# ── Route — <siteName>.com → og-<siteName> ──
resource "azurerm_cdn_frontdoor_route" "site" {
  name                          = "route-${var.site_name}"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.site.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.site.id
  cdn_frontdoor_origin_ids = [
    azurerm_cdn_frontdoor_origin.primary.id,
    azurerm_cdn_frontdoor_origin.dr.id,
  ]
  cdn_frontdoor_custom_domain_ids = [
    azurerm_cdn_frontdoor_custom_domain.site.id,
  ]

  supported_protocols    = ["Https"]
  https_redirect_enabled = false
  patterns_to_match      = ["/*"]
  forwarding_protocol    = "HttpsOnly"

  link_to_default_domain = false
}

# ── Associate custom domain with route ──
resource "azurerm_cdn_frontdoor_custom_domain_association" "site" {
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.site.id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.site.id]
}

# =============================================================================
# DNS Records — automated in the internal.com Azure DNS zone
# =============================================================================

data "azurerm_dns_zone" "internal" {
  name                = var.dns_zone_name
  resource_group_name = var.dns_zone_resource_group
}

# CNAME: <siteName>.com → Front Door endpoint
resource "azurerm_dns_cname_record" "site" {
  name                = var.site_name
  zone_name           = data.azurerm_dns_zone.internal.name
  resource_group_name = data.azurerm_dns_zone.internal.resource_group_name
  ttl                 = 3600
  record              = azurerm_cdn_frontdoor_endpoint.site.host_name
}

# TXT: _dnsauth.<siteName>.com — Front Door domain validation
resource "azurerm_dns_txt_record" "validation" {
  name                = "_dnsauth.${var.site_name}"
  zone_name           = data.azurerm_dns_zone.internal.name
  resource_group_name = data.azurerm_dns_zone.internal.resource_group_name
  ttl                 = 3600

  record {
    value = azurerm_cdn_frontdoor_custom_domain.site.validation_token
  }
}

# =============================================================================
# WAF Security Policy — managed in Neon parent repo (Ue1NePrdFrontDoorSecPolicy)
# Azure Front Door allows only ONE security policy per WAF policy per profile.
# The Neon parent repo attaches the shared WAF policy to the profile; new custom
# domains are automatically covered. Do NOT create per-site security policies.
# =============================================================================
