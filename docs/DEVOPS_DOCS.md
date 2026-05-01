# DEVOPS_DOCS

## 1. Environments | Môi trường

| Environment | Branch Source | Purpose | Controls |
|---|---|---|---|
| Local | feature/* | Development và debug | Docker compose, seed data |
| Dev | develop | Tích hợp liên tục | Auto deploy, synthetic tests |
| Staging | release/* | Pre-prod validation | Approval gates, perf/security checks |
| Production | main | Live service | Change window, rollback protocol |

## 2. CI/CD Pipeline

### Build
- Install dependencies (lockfile enforced).
- Type check + compile frontend/backend.
- Backend runtime defaults to clean entrypoint (`src/main.ts` / `dist-clean/main.js`); legacy runtime kept as fallback via dedicated legacy scripts.

### Test
- Unit/integration tests.
- API contract tests.

### Lint
- ESLint/TS checks fail-fast.

### Security Scan
- SAST (CodeQL/Semgrep), dependency scan (Snyk/Trivy), secrets scan (gitleaks).
- Current backend CI gates include:
  - clean build + clean tests
  - secrets scan via gitleaks
  - dependency audit with high-severity threshold

### Deploy
- Dev: auto on merge `develop`.
- Staging: manual approval after green pipeline.
- Prod: manual approval + canary deployment.

## 3. Branching Model
- `main`: production-ready only.
- `develop`: integration branch.
- `feature/*`: isolated feature development.
- `hotfix/*`: urgent production fixes.

Policy:
- PR required, minimum 1-2 approvals.
- Status checks bắt buộc trước merge.
- Conventional commits + changelog automation.

## 4. Docker Setup
- Backend dùng multi-stage Dockerfile (build/runtime separation).
- Compose local gồm: `mysql`, `redis`, `api`.
- Khuyến nghị thêm healthchecks và resource limits cho compose + k8s manifests.

## 5. Secrets Management
- Không commit secrets vào repo.
- Dùng secret manager theo môi trường (GitHub Secrets + cloud secret service).
- Rotate định kỳ: JWT keys, DB password, API keys.
- Mask secrets trong logs.

## 6. Backup Strategy
- DB full backup mỗi ngày + binlog incremental mỗi 15 phút.
- Redis snapshot theo mục đích (nếu dùng persistent cache/session).
- Media metadata backup + disaster export plan.
- Kiểm tra restore drill hàng tháng.

## 7. Monitoring

### Logs
- Centralized structured logs, traceable theo `traceId`.

### Metrics
- API latency/error rate, DB connections, Redis health, socket connection count.

### Alerts
- P95 latency spike, error rate > threshold, pod/container restart abnormal, disk pressure.

## 8. Rollback Plan
1. Xác định bản phát hành gây lỗi (release tag).
2. Chuyển traffic về bản stable gần nhất.
3. Revert migration an toàn (forward-fix nếu non-reversible).
4. Chạy smoke test sau rollback.
5. Tổng kết postmortem và corrective actions trong 24-48h.

## 9. CI Status Snapshot (Current)
- Backend workflow:
  - `quality-gates`: clean build + clean tests.
  - `security-gates`: gitleaks + dependency audit (high threshold).
  - `docker-build`: runs only after quality/security gates pass.
- Frontend workflow:
  - install + build gate on frontend paths.
- Security workflow:
  - `CodeQL` (SAST) on push/PR for `main` + `develop` and weekly scheduled scan.
  - `DAST Baseline` (OWASP ZAP) on schedule/manual run when `STAGING_BASE_URL` secret is configured.

## 10. Runtime Runbook (Clean Default / Legacy Fallback)

### Default (Clean `/v2`)
- Local dev: `npm run dev`
- Production runtime: `npm run start`
- Explicit clean aliases (same target): `npm run dev:clean`, `npm run start:clean`

### Legacy fallback (rollback window only)
- Local legacy dev: `npm run dev:legacy`
- Legacy runtime: `npm run start:legacy`
- Use only when a rollback trigger is hit and rollback approval is completed.

### Rollback execution checklist
1. Confirm rollback trigger (error-rate/latency/auth regression) from monitoring.
2. Switch runtime profile to legacy (`start:legacy` / `dev:legacy`) and redeploy.
3. Run smoke checks on auth, feed, post, messaging, notification critical paths.
4. Open incident note with start/end time, root cause hypothesis, and follow-up action.
