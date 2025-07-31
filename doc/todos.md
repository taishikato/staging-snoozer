## Iteration 0 – Validate Existing Web App
- [x] Run `apps/web` locally and confirm shadcn UI loads
- [x] Deploy current `apps/web` to Railway (baseline "Hello" check)
- [x] Add `.env.example` (only for keys you already use today)

---

## Iteration 1 – Add GraphQL (inside apps/web first)
- [x] Add `graphql-codegen` config & script in `apps/web`
- [x] Implement minimal `lib/gql/fetchGraphQL.ts` (auth header, error handling)
- [x] Run introspection & generate types locally (ready - needs API token)
- [x] **Deploy & Smoke Test**: call a harmless query (`viewer { id }`) server-side and log

---

## ~~Iteration 2 – Token Handling~~ (Moved to Future Extensions)
~~- [ ] Token page (paste + validate via test query)~~
~~- [ ] Store token in `localStorage` (env fallback allowed)~~
~~- [ ] Global header injection based on stored token~~
~~- [ ] Handle invalid token redirect~~
~~- [ ] **Deploy & Smoke Test**: token flow works on Railway~~

> **Note**: Skipped for MVP. App will use `RAILWAY_API_TOKEN` from environment variables for single-user deployment.

---

## Iteration 3 – Project/Environment Selector
- [x] Query projects/environments
- [x] Selector UI + persist default in localStorage
- [x] Loading & empty states
- [x] **Deploy & Smoke Test**: switch envs, data updates

---

## Iteration 4 – Service List (Read-only)
- [x] Query services + latest deployment status
- [x] Render table with status & last deploy time
- [x] Skeleton & error toasts
- [x] **Deploy & Smoke Test**: list renders with real data

---

## Iteration 5 – Spin Up (Manual)
- [x] SpinUp modal (name, source, optional TTL field—no backend yet)
- [x] Call `serviceCreate` → `serviceInstanceDeployV2`
- [x] Poll deployment status or refetch after short delay
- [x] **Deploy & Smoke Test**: real service created & visible in Railway

---

## Iteration 6 – Immediate Spin Down
- [x] Action menu: Stop (`deploymentStop`) / Delete (`serviceDelete`)
- [x] Confirm dialogs for destructive ops
- [x] Refetch list post-action
- [ ] **Deploy & Smoke Test**: stop/delete work

---

## Iteration 7 – Introduce Persistence for Rules (Create DB when needed)
> First time you need a DB → add Drizzle now.

- [ ] Add Drizzle to `apps/web` (or a small server route) with `rules` table
- [ ] Set up drizzle-kit migration; run locally & on Railway
- [ ] API routes for rules CRUD (create/list/update/delete)
- [ ] Rules page (table with status/executeAt/action)
- [ ] Schedule modal to create a rule
- [ ] **Deploy & Smoke Test**: create rule, verify DB entry

---

## Iteration 8 – Extract Shared DB/GQL Only If Needed
> Once the scheduler needs the same code, extract:

- [ ] Create `packages/db` (move Drizzle schema & client)
- [ ] Create `packages/gql` (move gql client & typed docs)
- [ ] Update pnpm workspaces only now
- [ ] **Deploy & Smoke Test**: web app still builds & works

---

## Iteration 9 – Scheduler Service (introduce apps/scheduler now)
- [ ] Create `apps/scheduler` (Node script with node-cron */5 min)
- [ ] Use shared `packages/db` & `packages/gql`
- [ ] Fetch pending rules, execute mutations, update status
- [ ] Basic retry/backoff or mark FAILED
- [ ] **Deploy & Smoke Test**: rule fires on schedule

---

## Iteration 10 – TTL UX Polish
- [ ] Show TTL countdown in service list
- [ ] “Extend TTL” action (update rule)
- [ ] Prevent conflicting duplicate rules
- [ ] **Deploy & Smoke Test**: extend rule, scheduler respects change

---

## Iteration 11 – GitHub Webhook Skeleton
- [ ] Add `/api/webhooks/github` route (return 200 OK)
- [ ] Config page: show webhook URL & secret
- [ ] Store delivery IDs to avoid dupes
- [ ] **Deploy & Smoke Test**: GitHub ping succeeds

---

## Iteration 12 – Webhook Logic
- [ ] Verify `X-Hub-Signature-256`
- [ ] Map PR `opened` → spin up (default TTL)
- [ ] Map PR `closed/merged` → spin down (delete/stop)
- [ ] Idempotency checks
- [ ] **Deploy & Smoke Test**: open/merge PR triggers actions

---

## Iteration 13 – Error Handling & Observability
- [ ] Global error boundary & toast polish
- [ ] Log scheduler failures; simple logs page or download
- [ ] (Optional) Dry-run mode for batch ops
- [ ] **Deploy & Smoke Test**: simulate failure, confirm UX

---

## Iteration 14 – Docs & Demo
- [ ] Finalize README (problem, defs, arch, setup)
- [ ] Add architecture diagram (Mermaid/ASCII/image)
- [ ] Record short demo video/gif
- [ ] **Deploy & Smoke Test**: fresh clone → setup works

---

## Iteration 15 – Interview Polish
- [ ] Prepare code walk-through notes (key files)
- [ ] Draft talking points (trade-offs, future work)
- [ ] Prepare fallback screenshots/gif

---

## Optional Backlog / Stretch
- [ ] Multi-tenant token handling (UI for token input, localStorage, validation)
- [ ] Batch ops via tags
- [ ] Rough cost estimation view
- [ ] Undo/Rollback button (`deploymentRedeploy`/`rollback`)
- [ ] Template-based multi-service spin up
- [ ] OAuth/RBAC multi-tenant auth
- [ ] Temporal/queue-based scheduler refactor