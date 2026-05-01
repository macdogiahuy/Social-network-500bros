# SECURITY_DOCS

## 1. Threat Model | Mô hình đe dọa

| Threat | Attack Vector | Impact | Current Posture | Target Control |
|---|---|---|---|---|
| Auth abuse | Brute force, token replay | Account takeover | Token + middleware exists | MFA + login throttling + device heuristics |
| Injection | Malicious input to APIs/queries | Data corruption/leak | Prisma reduces SQL injection risk | Strict schema validation, output encoding |
| XSS | Script payload in content/profile | Session theft, defacement | Chưa thấy hard guarantee đầy đủ | Sanitize/escape rich content at render/store |
| CSRF | Cross-site state-changing calls | Unauthorized actions | Token-in-header giảm rủi ro | CSRF token nếu chuyển cookie auth |
| SSRF | Server-side URL fetch abuse | Internal network exposure | Chưa thấy URL fetch core flow | Egress policy + URL allowlist |
| Credential leaks | Secrets in code/scripts | Full environment compromise | Có dấu hiệu secret hygiene yếu | Secret manager + scanning + rotation |
| Broken access control | Missing owner/role checks | Privilege escalation | Có RBAC cơ bản | Central policy middleware + audit tests |

## 2. Security Controls | Kiểm soát bảo mật

### JWT / Session
- Access token validation ở HTTP middleware và socket handshake.
- Target: short-lived access + refresh rotation + token revocation list cho high-risk actions.

### MFA
- As-Is: chưa bật.
- Target: optional MFA cho admin và account nhạy cảm.

### RBAC
- As-Is: có role `user/admin`.
- Target: policy-based authorization cho action-level permissions.

### Encryption at Rest
- DB storage encryption + backup encryption (KMS-managed keys).

### TLS
- Bắt buộc HTTPS end-to-end, HSTS ở production.

### Input Validation
- Zod/schema validation trên request body/query/path.
- Reject unknown fields để giảm mass assignment.

### Rate Limiting
- IP + account-based throttling cho auth, messaging, upload.

## 3. Security Checklist
- [x] CORS không dùng wildcard ở production (clean backend v2 uses allowlist env `CORS_ALLOWED_ORIGINS`).
- [ ] Secrets không hardcode, toàn bộ qua secret manager.
- [x] Security headers chuẩn (CSP, HSTS, X-Content-Type-Options) in clean backend v2 entrypoint.
- [x] Audit log cho auth failure, admin actions, privilege changes (clean v2 audit events for auth failure + forbidden ownership actions).
- [x] Upload scanning + MIME/size whitelist baseline for clean media upload.
- [x] Dependency scan ở CI và patch cadence hàng tháng (dependency audit gate added in backend workflow).
- [x] SAST/DAST baseline có thể chạy trong CI (`CodeQL` + `DAST Baseline` using OWASP ZAP when staging URL secret is configured).
- [ ] Pen-test trước major release.

Current progress notes:
- Backend CI includes gitleaks secret scan and dependency audit gate.
- Clean backend v2 logs auth failure and forbidden ownership actions in structured audit events.

## 4. Incident Response
1. Detect: alert từ SIEM/APM/monitoring.
2. Triage: phân loại severity, phạm vi ảnh hưởng.
3. Contain: khóa token/session, chặn endpoint/IP, isolate workloads.
4. Eradicate: vá lỗ hổng, rotate secrets.
5. Recover: khôi phục dịch vụ, giám sát tăng cường.
6. Postmortem: RCA + action items có owner/deadline.

## 5. Vulnerability Management
- Intake từ scanner + bug bounty + internal reports.
- SLA:
  - Critical: fix <= 24h.
  - High: fix <= 7 ngày.
  - Medium: fix <= 30 ngày.
  - Low: theo backlog kế hoạch.
- Bắt buộc retest và đóng lỗ hổng bằng evidence.

## 6. Compliance Notes
- **GDPR:** data minimization, right-to-delete/export, breach notification process.
- **OWASP Top 10:** mapping controls vào secure SDLC checklist.
- **PCI DSS (if payment):** tách vùng cardholder data, tokenization, không lưu PAN thô.
