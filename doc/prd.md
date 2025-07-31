# Staging Snoozer – Product Requirements Document (PRD)

## 0. One‑liner / TL;DR

A lightweight dashboard that **spins up ephemeral staging services on Railway for PR review, then automatically spins them down (stop/delete) on merge or after a TTL** to save cost and reduce manual ops.

---

## 1. Background & Context

* Teams (and solo devs) often keep a `staging` environment running 24/7 even though it is only needed before a pull request (PR) is merged.
* Railway’s dashboard makes manual Start/Stop/Delete easy, but **there is no built‑in scheduling or PR‑driven automation**.
* The technical interview prompt (“spin up/down a container using our GQL API”) is open‑ended; this product interprets it as an opportunity to demonstrate product thinking around cost optimization and ephemeral environments.

---

## 2. Problem Statement

"Staging environments are left running when they are no longer needed, wasting compute cost and cluttering projects. Developers need a simple way to create staging instances for PR review and ensure they are automatically decommissioned afterward."

---

## 3. Goals & Success Metrics

### 3.1 Goals

1. Provide a **self‑serve UI** to create (spin up) and stop/delete (spin down) Railway services.
2. Allow users to **schedule** spin down actions (TTL or specific datetime) without manual intervention.
3. Integrate with **GitHub PR events** to automate lifecycle: PR opened → spin up, PR merged/closed → spin down.
4. Showcase thoughtful engineering choices (typed GraphQL, scheduling strategy, safe token handling) and provoke discussion in the interview.

### 3.2 Success Metrics (qualitative)

* Interviewers engage in deep discussion about trade‑offs (token security, cron vs. workflow engines, delete vs. stop).
* The demo shows end‑to‑end flows (create → review → auto stop) working on Railway.
* Codebase readability and documentation quality are praised.

(If this were a real product:

* % reduction in staging runtime hours.
* # of auto spin downs vs. manual ones.
* Time-to-preview for new PRs.)

---

## 4. Personas & Use Cases

### 4.1 Personas

* **Indie Dev / Small Startup Engineer**: Needs to keep costs low; wants easy PR preview environments.
* **DevOps‑leaning Engineer**: Manages multiple microservices; wants batch operations and automation hooks.
* **Railway Interviewer**: Wants to see product mindset, extensibility, and code quality.

### 4.2 Key Use Cases

1. **Create ephemeral staging for a new PR** via UI or GitHub webhook.
2. **Schedule automatic stop/delete** of a service after N hours/days or on a specific datetime.
3. **Manually stop/delete** a running service from a dashboard.
4. **View & manage rules** (TTL schedules) and override/extend them.
5. **(Optional)** Batch operate on tagged services.

---

## 5. Scope

### In Scope (MVP)

* Next.js UI (token input, project/environment selector, service list).
* Spin up: `serviceCreate` + `serviceInstanceDeployV2` mutations.
* Spin down: choose between `deploymentStop` (soft) or `serviceDelete` (hard).
* TTL scheduling with a cron worker (node‑cron) running on Railway.
* GitHub webhook (PR events) → auto create & auto stop/delete.
* Basic DB (Drizzle) to store scheduling rules.

### Out of Scope (MVP)

* Multi‑tenant auth / team RBAC.
* Token input UI and client-side token storage.
* Cost analytics using real billing data.
* Full template builder UI (only basic template/deploy support, if any).
* Complex workflow engines (Temporal) — only discussed as future work.

---

## 6. Functional Requirements

### 6.1 Token Handling

* Single-user setup: Railway API token configured via `RAILWAY_API_TOKEN` environment variable.
* No token input UI needed for MVP (moved to future extensions).

### 6.2 Project & Environment Selection

* Fetch and display the user’s Railway projects and environments.
* Persist a “default” selection for faster future use.

### 6.3 Service Lifecycle Operations

* **List services** for the selected project/environment with status and latest deployment info.
* **Spin up** modal: Name, Source (GitHub repo URL / Docker image / Template), optional TTL.
* **Spin down** actions per service: Stop or Delete immediately.

### 6.4 Scheduling (Rules)

* Create a rule: { serviceId, action: STOP|DELETE, executeAt, note? }.
* View all rules and their status (PENDING / DONE / FAILED).
* Edit/cancel pending rules; extend TTL.
* Cron worker checks rules every X minutes and executes due actions.

### 6.5 GitHub Integration

* Provide setup instructions (Webhook URL, secret).
* Receive PR `opened` → spin up with default TTL.
* Receive PR `closed/merged` → spin down (delete or stop).
* Handle retries and ignore duplicate events (idempotency).

### 6.6 Error Handling & UX

* Show clear toasts/dialogs for success/failure of GQL calls.
* Confirm destructive actions in the UI.

---

## 7. Non‑Functional Requirements

* **Deployed on Railway** (both UI and scheduler worker).
* **Typed GraphQL operations** via codegen (type‑safety & DX).
* **Minimal latency** for UI operations (<1s for most queries).
* **Resilience**: scheduler retries failed rules; webhook handler validates signatures.
* **Security**: keep tokens out of the repo; sign GitHub webhook requests.

---

## 8. User Flows (High Level)

### 8.1 Manual Flow

1. User visits app → enters token.
2. Select project/environment.
3. Click “Spin Up”, fill form, set TTL.
4. Service is created & deployed; appears in list with TTL.
5. Cron worker stops/deletes it at executeAt.

### 8.2 GitHub Flow

1. Dev opens PR → GitHub sends webhook.
2. App validates signature, spins up service, sets default TTL.
3. Dev reviews; when PR merges, webhook triggers stop/delete.
4. Rule marked DONE; service gone or stopped.

---

## 9. Data Model (Drizzle)

```ts
// rules table (simplified)
{
  id: string,
  serviceId: string,
  action: 'STOP' | 'DELETE',
  executeAt: Date,
  status: 'PENDING' | 'DONE' | 'FAILED',
  executedAt?: Date,
  note?: string
}
```

Additional tables (optional): GitHub repo ↔ service mapping, user preferences.

---

## 10. External APIs / Integrations

* **Railway GraphQL API** (`serviceCreate`, `serviceInstanceDeployV2`, `deploymentStop`, `serviceDelete`, queries for services/deployments).
* **GitHub Webhooks**: `pull_request` events; HMAC SHA‑256 (`X-Hub-Signature-256`).

---

## 11. System Architecture (MVP)

```
Railway Project
 ├─ Service: web (Next.js UI)
 │   ├─ /api/* (Route handlers)
 │   └─ /api/webhooks/github (PR events)
 │
 ├─ Service: scheduler (Node script)
 │   └─ node-cron every 5 mins → check DB → call Railway GQL
 │
 └─ Postgres/SQLite (Drizzle ORM)
```

---

## 12. Risks & Mitigations

| Risk                                | Mitigation                                                       |
| ----------------------------------- | ---------------------------------------------------------------- |
| Cron worker sleeps or crashes       | Separate worker service on Railway + health checks               |
| Token leaks                         | Store locally, document security caveats, allow env var override |
| Destructive ops (delete) by mistake | Confirmation dialogs, default to STOP not DELETE                 |
| Duplicate GitHub events             | Store processed delivery IDs; check idempotently                 |
| GraphQL schema changes              | Use codegen; handle errors gracefully                            |

---

## 13. Milestones & Timeline (example)

* **Day 1**: Core UI + basic mutations working.
* **Day 2**: Scheduling (rules + cron worker) complete.
* **Day 3**: GitHub webhook integration + polish.
* **Day 4**: Deploy, README/diagram finalize, rehearsal.

---

## 14. Future Extensions

* Token input UI for multi-tenant support (paste token, validate, store in localStorage).
* Cost estimation charts (approximate usage vs. saved hours).
* Multi‑tenant auth (Railway OAuth or custom) & team RBAC.
* Batch ops, tagging, template library.
* Advanced workflow engine (Temporal) for robust retries and audit trails.
* Logs/metrics surface (Observability Dashboard APIs).

---

## 15. Open Questions

* Should we support “scale to zero” via resource limits instead of full stop/delete?
* Is there an official Railway OAuth we could leverage for multi‑user scenarios?
* Are there GraphQL subscriptions or webhooks for deployment status to avoid polling?

---

## 16. Appendix

* GraphQL mutations list (subset): `serviceCreate`, `serviceInstanceDeployV2`, `deploymentStop`, `deploymentRemove`, `serviceDelete`, `serviceInstanceRedeploy`, `deploymentRedeploy`.
* Libraries: Next.js, React, TypeScript, Shadcn UI, Drizzle ORM, node-cron, graphql-codegen.
* Repo structure: monorepo (`apps/web`, `apps/scheduler`, `packages/*`).

---

**End of PRD**