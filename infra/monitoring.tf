# =============================================================================
# Monitoring — Application Insights + Availability Tests + Alerts
# Arch doc: "Application Insights (appi-<siteName>-prd, workspace-based)"
#
# NOTE: the original template pointed at a shared "Neon" platform Log Analytics
# workspace (ue1neprdresourcegroup) that doesn't exist in this subscription —
# same stale-template pattern as the AAD app / Front Door / bootstrap repo
# found earlier. This site provisions its own dedicated workspace instead.
# =============================================================================

resource "azurerm_log_analytics_workspace" "site" {
  name                = "law-${var.site_name}-prd"
  resource_group_name = data.azurerm_resource_group.swa.name
  location            = var.regions.primary
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

# ── Application Insights — workspace-based ──
resource "azurerm_application_insights" "site" {
  name                = "appi-${var.site_name}-prd"
  resource_group_name = data.azurerm_resource_group.swa.name
  location            = var.regions.primary
  workspace_id        = azurerm_log_analytics_workspace.site.id
  application_type    = "web"

  tags = var.tags
}

# ── Standard Availability Test ──
# Arch doc: "targets https://<siteName>.com, 5 Azure regions,
# every 5 min, HTTP 200 within 10s timeout"
resource "azurerm_application_insights_standard_web_test" "site" {
  name                    = "availtest-${var.site_name}"
  resource_group_name     = data.azurerm_resource_group.swa.name
  location                = var.regions.primary
  application_insights_id = azurerm_application_insights.site.id
  frequency               = 300 # every 5 minutes
  timeout                 = 10  # 10-second timeout
  enabled                 = true

  geo_locations = var.availability_test_locations

  request {
    url = "https://${azurerm_static_web_app.primary.default_host_name}"

    header {
      name  = "Accept"
      value = "text/html"
    }
  }

  validation_rules {
    expected_status_code = 200
  }

  tags = var.tags
}

# ── Metric Alert — Availability ──
# Arch doc: "≥2 consecutive failures from ≥2 locations (reduces noise from transient failures)"
# The availability test runs from 5 locations every 5 min. With a 15-min window,
# each location produces ~3 results. We alert when availability drops below the
# threshold that implies failures from multiple locations (2+ of 5 locations failing
# = availability ≤ 60%). Using 90% as threshold to catch ≥2 location failures
# while allowing 1 transient failure.
resource "azurerm_monitor_metric_alert" "availability" {
  count               = can(regex("^/subscriptions/[0-9a-f-]+/", var.action_group_id)) ? 1 : 0
  name                = "alert-avail-${var.site_name}"
  resource_group_name = data.azurerm_resource_group.swa.name
  scopes              = [azurerm_application_insights.site.id]
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "availabilityResults/availabilityPercentage"
    aggregation      = "Average"
    operator         = "LessThan"
    threshold        = 90
  }

  action {
    action_group_id = var.action_group_id
  }

  tags = var.tags
}

# ── Outputs ──
output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = azurerm_application_insights.site.connection_string
  sensitive   = true
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = azurerm_application_insights.site.instrumentation_key
  sensitive   = true
}
