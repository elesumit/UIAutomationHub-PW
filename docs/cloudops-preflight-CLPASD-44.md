# CloudOps Pre-Flight — `automation-pw` 

**Owner:** sumit.ggg@gmail.com 

> **Why this exists:** The `automation-pw` site is adding a backend (`/api/*`) as an
> Azure **Function App (FC1 Flex Consumption)**, per `agents.md → Adding a Function App
> and Storage Account`. FC1 requires one *runtime* storage account, and our Entra-only
> storage standard (`shared_access_key_enabled = false`, `default_action = Allow`) trips
> three things the per-site runner MI cannot self-serve. **These must be completed before
> the infra PR is merged** — otherwise `terraform apply` 403s and the apply must be re-run.
>
> **Scope note:** This backend is **stateless** — it persists nothing to Azure (all state
> lives in GitHub/Jira/Xray). So there is **one storage account, runtime-only** — no data
> tables, no `azurerm_storage_table`, no giovanni gotcha. The asks below are limited to
> that single runtime SA.

---

## Context / identifiers

| Item | Value |
|---|---|
| Subscription | Neon — ScriptlessIQ Tools — `c4b21de8-bb1c-4efb-b4ec-9431dc344558` |
| Tenant | `21f2717a-4fc6-4665-b7ad-b490a46167e3` |
| Resource group | `my-automation-rg` |
| Per-site runner MI (client id) | `c990a453-711f-44d9-9285-8d4caa179d30` |
| Runtime storage account (created by TF) | `st<...>` — see `infra/storage.tf` `local.func_sa_name` |
| Region | East US 2 (`eastus2`) |

---

## The three asks

### 1. Policy exemption — public network access on the runtime SA
Tenant policy *"Storage accounts should disable public network access"* blocks our standard
(`public_network_access_enabled = true` + `network_rules.default_action = Allow`, gated by
Entra at the credential layer, keys disabled).

- **Action:** Register a policy exemption scoped to **`my-automation-rg`** (or
  to the specific SA once its name is known) for the deny policy assignment that enforces
  storage public-access disablement.
- **Same pattern previously granted for:** `media-curation`, `campaign-planning-tool`.

### 2. Runner-MI ABAC condition expansion
The runner MI (`adfdfd01-…`) holds **Role Based Access Control Administrator** on the
per-site RG with an ABAC condition that allowlists specific role-definition GUIDs it may
grant. Today it covers only **Key Vault Secrets User**. It must also be allowed to grant the
three Storage data roles (needed so Terraform can create the Function App MI's role
assignments on the runtime SA).

- **Action:** Expand the ABAC condition on the runner MI's RBAC-Administrator assignment to
  include these role-definition IDs:

| Role | Role definition GUID |
|---|---|
| Storage Blob Data Contributor | `ba92f5b4-2d11-453d-a403-e96b0029c9fe` |
| Storage Queue Data Contributor | `974c5e8b-45b9-4653-ba55-5f855dd0fb88` |
| Storage Table Data Contributor | `0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3` |
| Key Vault Secrets User *(already allowlisted — listed for completeness)* | `4633458b-17de-408a-b874-0445c86b69e6` |

### 3. Pre-grant runner-MI data roles on the runtime SA
Chicken-and-egg: with shared keys disabled, Terraform creates the FC1 **deployment blob
container** over the data plane using AAD, so the runner MI needs Storage data roles on the
SA *before the first plan/apply refresh*. (The `time_sleep` in `infra/storage.tf` only covers
RBAC propagation lag, not the initial absence of the grant.)

- **Action (run once the SA exists, or pre-create against the planned name):**

```bash
RUNNER_MI=c990a453-711f-44d9-9285-8d4caa179d30
SA_ID=/subscriptions/c4b21de8-bb1c-4efb-b4ec-9431dc344558/resourceGroups/my-automation-rg/providers/Microsoft.Storage/storageAccounts/<func_sa_name>
for ROLE in "Storage Blob Data Contributor" "Storage Queue Data Contributor" "Storage Table Data Contributor"; do
  az role assignment create --assignee "$RUNNER_MI" --role "$ROLE" --scope "$SA_ID"
done
```

---

## Confirmation checklist (gates the infra PR merge)

- [ ] **#1** Policy exemption registered for `my-automation-rg`
- [ ] **#2** Runner-MI ABAC condition expanded with the three Storage data-role GUIDs
- [ ] **#3** Runner MI granted Blob/Queue/Table Data Contributor on the runtime SA
- [ ] CloudOps (Sai) confirmed in the PR thread

> Per `agents.md`, CloudOps confirms these **once per repo** at infra-bootstrap time — not
> per PR. Once done for `automation-pw`, future backend changes don't need to re-request.

---

## Jira ticket body (copy-paste)

> **Summary:** CloudOps pre-flight for `automation-pw` Function App backend
>
> **Description:**
> Adding an FC1 Function App backend to the `automation-pw` static-web site (RG
> `my-automation-rg`, Neon sub `c4b21de8-bb1c-4efb-b4ec-9431dc344558`).
> Per the static-web Function App standard, please complete before we merge the
> infra PR:
> 1. Policy exemption for storage public-network-access on the RG.
> 2. Expand runner MI (`c990a453-711f-44d9-9285-8d4caa179d30`) ABAC to allow granting
>    Storage Blob/Queue/Table Data Contributor (`ba92f5b4-…`, `974c5e8b-…`, `0a9a7e1f-…`).
> 3. Pre-grant the runner MI those three Storage data roles on the new runtime storage
>    account (name in `infra/storage.tf`).
>
> Stateless backend → runtime storage only, no data tables. Same pattern as
> `media-curation` / `campaign-planning-tool`.
