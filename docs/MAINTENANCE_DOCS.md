# MAINTENANCE_DOCS

## 1. Support Model | Mô hình hỗ trợ

| Level | Scope | Ownership | SLA |
|---|---|---|---|
| L1 | Hỗ trợ người dùng, lỗi cơ bản | Support desk | 15m acknowledge |
| L2 | Điều tra ứng dụng/cấu hình | App engineers | 4h response |
| L3 | Lỗi kiến trúc, DB, bảo mật, infra sâu | Senior/Architect/DevOps/Sec | 1h for Sev-1 |

## 2. Routine Tasks | Tác vụ định kỳ
- Backup verification: hàng ngày.
- Log cleanup/retention enforcement: hàng tuần.
- DB optimization (index stats, slow query review): hàng tuần.
- Dependency updates và vulnerability patch: hàng tháng.
- SSL/TLS certificate renewal check: hàng tháng hoặc theo chu kỳ cert.
- Capacity review (CPU/RAM/DB connections/socket count): 2 tuần/lần.

## 3. Known Issues | Vấn đề đã biết
- Security hardening chưa hoàn tất cho secret manager + DAST/SAST rollout.
- CI security gates đã có clean build/test + secret/dependency scan; chưa phủ full legacy workflows.
- Một số tính năng roadmap (OAuth/reset UX/payment) còn partial.
- Legacy notification service entrypoint đã được decommission để tránh song song 2 luồng (`/v1` legacy vs `/v2` clean).
- Legacy user module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path để ưu tiên clean `/v2` routes.
- Legacy comment module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path để giảm route overlap với clean `/v2`.
- Legacy topic module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path theo phased decommission.
- Legacy post module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path để tránh chồng chéo feed/post logic với clean `/v2`.
- Legacy following module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path để tránh overlap với clean follow/unfollow `/v2`.
- Legacy post-like module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path để tránh overlap với clean like `/v2`.
- Legacy post-save module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path để tránh overlap với clean bookmark `/v2`.
- Legacy comment-like module entrypoint trong runtime monolith cũ đã được gỡ khỏi boot path.
- Legacy conversation routes đã được gỡ khỏi monolith boot path (`src/index.ts`); nếu cần vẫn chạy qua dedicated chat service entrypoint.

## 4. Change Management | Quản lý thay đổi
1. Tạo RFC/Change Request với phạm vi và rủi ro.
2. Đánh giá impact (product, data, security, operations).
3. Approvals (Tech Lead + QA + DevOps).
4. Triển khai staged rollout.
5. Post-deploy verification + rollback readiness.
6. Cập nhật changelog và tài liệu liên quan.

## 5. Upgrade Process | Quy trình nâng cấp
1. Freeze window và snapshot backup.
2. Deploy lên staging, chạy regression + smoke + security checks.
3. Approve production rollout (canary/blue-green ưu tiên).
4. Theo dõi metrics 30-60 phút sau rollout.
5. Mở rộng traffic nếu ổn định.

### Runtime Profile Quick Guide
- Clean default profile:
  - `npm run dev`
  - `npm run start`
- Legacy fallback profile (rollback only):
  - `npm run dev:legacy`
  - `npm run start:legacy`
- Nguyên tắc: luôn ưu tiên clean profile; chỉ dùng legacy profile khi có quyết định rollback được phê duyệt.

## 6. Disaster Recovery | Khôi phục thảm họa
- **RTO mục tiêu:** <= 2 giờ.
- **RPO mục tiêu:** <= 15 phút cho dữ liệu quan trọng.
- Kịch bản:
  - DB corruption: restore full + replay incremental.
  - Service outage: failover instance/region.
  - Security incident: isolate workloads + rotate keys.
- DR drill: thực hiện theo quý, ghi nhận gap và action items.

## 7. End-of-Life Plan | Kế hoạch kết thúc vòng đời
- Xác định timeline EOL cho major version.
- Thông báo người dùng tối thiểu 90 ngày trước EOL.
- Cung cấp migration path và dữ liệu export.
- Archive logs/audit trails theo chính sách compliance.

## 8. Release Readiness Checklist (Clean v2)
- [x] `build:clean` pass.
- [x] `test:clean` pass.
- [x] Core protected routes enforce Bearer auth.
- [x] Response envelope standardized with `traceId`.
- [x] Security baseline in place (CORS allowlist, rate limit auth, security headers, audit events).
- [ ] Full secret-manager rollout across environments.
- [~] SAST/DAST mandatory gates on all long-lived branches (CodeQL + ZAP baseline workflows added; branch protection enforcement pending).
- [ ] Load/performance report attached for release candidate.

## 9. Legacy Cutover Checklist (`/v1` -> `/v2`)
1. **Scope freeze**
   - Freeze new feature changes on legacy `/v1` handlers.
   - Track all active consumers using `/v1` endpoints.
2. **Compatibility validation**
   - Compare response contracts `/v1` vs `/v2` for high-traffic paths.
   - Run regression suite with `/v2` base URL switch in staging.
3. **Progressive traffic migration**
   - Enable `/v2` behind feature flag or gateway routing rule.
   - Ramp traffic in phases (10% -> 30% -> 60% -> 100%) with monitoring gates.
4. **Rollback readiness**
   - Keep `/v1` routes deployable until `/v2` stabilization window closes.
   - Define hard rollback triggers (error rate, latency, auth failures).
5. **Decommission**
   - [x] Remove unused legacy modules from monolith boot path (`src/index.ts`) and keep only dedicated runtime entrypoints where explicitly needed.
   - [~] Update API docs and client configs to `/v2` as default (backend runtime defaults switched to clean `/v2`; client cutover rollout still in progress).
