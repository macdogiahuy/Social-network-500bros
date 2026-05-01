# TEST_PLAN

## 1. Testing Scope | Phạm vi kiểm thử
- Unit Testing: service/usecase/helpers.
- Integration Testing: API + DB + Redis interactions.
- API Testing: contract, status codes, authz/authn.
- UI Testing: critical user journeys trên web app.
- Security Testing: OWASP top issues, auth/session abuse.
- Load Testing: feed, auth, messaging endpoints.
- Regression Testing: smoke + risk-based suite mỗi release.
- UAT: business acceptance theo kịch bản thực tế.

## 2. Strategy | Chiến lược
- **Shift-left:** lint + type check + unit tests ở pull request.
- **Risk-based priority:** auth, data integrity, realtime flows là P0.
- **Test pyramid:** Unit (70%) - Integration (20%) - E2E/UI (10%).
- **Automation first:** chạy tự động ở CI cho nhánh `develop` và `main`.

## 3. Environment | Môi trường

| Environment | Purpose | Data | Tools |
|---|---|---|---|
| Local | Dev fast feedback | Synthetic/local seed | Docker Compose, Postman |
| Dev | Continuous integration validation | Masked + synthetic | GitHub Actions |
| Staging | Pre-production validation | Production-like anonymized | Load/Security scanners |
| Production | Live monitoring + canary checks | Real data | APM, logs, alerts |

## 4. Entry Criteria | Điều kiện vào test
- Build success, lint pass, no blocking merge conflicts.
- Test data scripts/fixtures sẵn sàng.
- API schema changes đã được version/tag.
- Security-critical changes có checklist bắt buộc.

## 5. Exit Criteria | Điều kiện kết thúc test
- 100% test cases P0 pass.
- Tỷ lệ pass tổng regression >= 95%.
- Không còn defect Sev-1/Sev-2 open.
- Performance smoke đạt ngưỡng baseline.
- Security scan không còn lỗ hổng Critical/High chưa có mitigation.

## 6. Roles | Vai trò
- **QA Lead:** test strategy, release sign-off.
- **QA Engineer:** author/execute tests, report defects.
- **Dev Team:** fix defects, add unit/integration tests.
- **DevOps:** CI runtime, test infra reliability.
- **Product Owner:** UAT acceptance.

## 7. Defect Workflow | Luồng lỗi
1. Raise defect (title, severity, reproducibility, evidence).
2. Triage (QA + Dev + PM): xác nhận severity/priority.
3. Assign owner + target sprint/hotfix window.
4. Fix + peer review + deploy to test env.
5. Retest + regression impact check.
6. Close or reopen with evidence.

Severity model:
- Sev-1: outage/data loss/security breach.
- Sev-2: core flow blocked.
- Sev-3: partial degradation/workaround exists.
- Sev-4: cosmetic/minor UX.

## 8. Metrics | Chỉ số
- Test case execution rate (%).
- Pass/fail rate per suite.
- Defect density per module.
- Defect leakage to production.
- Mean time to detect (MTTD), mean time to resolve (MTTR).
- Automation coverage (% critical flows automated).

## 9. Clean Backend Test Gates (Current)
- `build:clean` must pass before merge.
- `test:clean` must pass before merge.
- Current automated suites include:
  - Auth use cases + security validation (invalid credentials, unknown fields, missing token).
  - Ownership and admin override checks for post/comment update-delete.
  - Messaging core use cases (list/send/delete).
  - Bookmark/profile/media use cases.
  - HTTP contract tests for `/v2/auth/register`, protected `/v2/feed`, `/v2/bookmarks`, `/v2/users/profile`, `/v2/notifications`, `/v2/messages`, and notification read endpoints.

## 10. Runtime Switch Smoke Checklist (Clean <-> Legacy)

Use this checklist immediately after any runtime profile switch (`npm run start`/`dev` <-> `start:legacy`/`dev:legacy`):

1. **Health + startup**
   - Verify service startup logs do not contain fatal boot errors.
   - Check `/health` returns success.
2. **Auth + protected access**
   - Login/register flow returns expected envelope.
   - Call one protected endpoint without token -> must return `UNAUTHORIZED`.
3. **Core API smoke**
   - Feed read endpoint responds with valid envelope.
   - Post create/list, comment create/list, like/bookmark basic path responds successfully.
4. **Messaging + notifications**
   - Send message flow returns valid payload.
   - Notification list and mark-read endpoints respond successfully.
5. **Rollback guardrail**
   - If 2 or more critical checks fail (auth/feed/messaging), stop rollout and switch to fallback profile.
   - Capture failure evidence (traceId, endpoint, payload, timestamp) for incident log.
