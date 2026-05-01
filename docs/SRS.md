# SRS - Software Requirements Specification

## 1. Functional Requirements | Yêu cầu chức năng

### 1.1 Authentication Module

| ID | Title | Description | Input | Output | Validation | Priority |
|---|---|---|---|---|---|---|
| FR-001 | Register User | Tạo tài khoản mới | name, username, email, password | user profile tối thiểu | email unique, password policy, required fields | High |
| FR-002 | Login User | Xác thực và cấp access token | username/email, password | token + profile | credential đúng, account status active | High |
| FR-003 | Token Validation | Kiểm tra token ở middleware và socket handshake | Bearer token | allow/deny access | token signature + expiry + subject | High |
| FR-004 | Logout Client | Xóa session token phía client | user action | cleared session state | token removed from storage | Medium |

### 1.2 Dashboard/Feed Module

| ID | Title | Description | Input | Output | Validation | Priority |
|---|---|---|---|---|---|---|
| FR-005 | Home Feed | Hiển thị danh sách bài viết | page, limit, filter | paginated posts | query params hợp lệ | High |
| FR-006 | Explore Feed | Khám phá theo keyword/topic/media | str, topicId, type | filtered post list | sanitize keyword, valid topic | Medium |
| FR-007 | Post Detail | Xem chi tiết post + comments | postId | post object + related data | post tồn tại | High |

### 1.3 CRUD Module (Post/Comment/Profile)

| ID | Title | Description | Input | Output | Validation | Priority |
|---|---|---|---|---|---|---|
| FR-008 | Create Post | Tạo bài viết mới | content, media, topic | created post | content length, media type, auth required | High |
| FR-009 | Update Post | Chỉnh sửa bài viết của chủ sở hữu | postId, content | updated post | ownership + schema check | High |
| FR-010 | Delete Post | Xóa bài viết | postId | success status | ownership/admin check | High |
| FR-011 | Add Comment | Bình luận bài viết | postId, content, parentId(optional) | created comment | post tồn tại, content hợp lệ | High |
| FR-012 | Update/Delete Comment | Sửa/xóa comment | commentId | updated/deleted status | ownership/admin check | High |
| FR-013 | Update Profile | Cập nhật hồ sơ người dùng | name, bio, avatar, cover | updated profile | file constraints, field constraints | Medium |

### 1.4 Notifications Module

| ID | Title | Description | Input | Output | Validation | Priority |
|---|---|---|---|---|---|---|
| FR-014 | Notification List | Lấy danh sách thông báo | page, limit, action filter | paginated notifications | auth required | High |
| FR-015 | Mark As Read | Đánh dấu 1 thông báo đã đọc | notificationId | updated state | ownership check | Medium |
| FR-016 | Mark All Read | Đánh dấu toàn bộ đã đọc | user action | updated counters | auth required | Medium |

### 1.5 Messaging & Realtime Module

| ID | Title | Description | Input | Output | Validation | Priority |
|---|---|---|---|---|---|---|
| FR-017 | Conversation List | Lấy danh sách hội thoại | page/limit | room summaries | auth required | High |
| FR-018 | Send Message | Gửi tin nhắn text/file và push realtime | roomId, content, attachment | message object + event | member check, payload validation | High |
| FR-019 | Message Reactions | Thêm/xóa reaction emoji | messageId, emoji | reaction state | member check | Medium |
| FR-020 | Delete Message/Room | Xóa tin nhắn/phòng hội thoại | targetId | deletion status | permission check | Medium |

### 1.6 Integrations Module

| ID | Title | Description | Input | Output | Validation | Priority |
|---|---|---|---|---|---|---|
| FR-021 | Media Upload | Upload media lên cloud storage | multipart file | URL + metadata | mime/size whitelist | High |
| FR-022 | Redis Event Sync | Đồng bộ side-effects qua event bus | domain event | notification/counter updates | event schema | Medium |
| FR-023 | External OAuth (Baseline) | Đăng nhập OAuth provider (Google/GitHub baseline) | provider + access token | local session token | provider token verify | Low |

## 2. Non-Functional Requirements | Yêu cầu phi chức năng

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | API critical endpoints P95 < 400ms dưới tải chuẩn |
| NFR-002 | Scalability | Scale ngang backend stateless; Redis + DB tune theo partition/index |
| NFR-003 | Availability | Uptime mục tiêu >= 99.9%, có health check và restart policy |
| NFR-004 | Security | Bảo vệ theo OWASP Top 10, RBAC, token hardening, secure secrets |
| NFR-005 | Reliability | Retry/backoff cho external dependency; graceful degradation |
| NFR-006 | Accessibility | UI tuân thủ WCAG mức cơ bản (focus states, contrast, keyboard) |
| NFR-007 | Localization | Thiết kế i18n-ready (vi/en), tách text resources |
| NFR-008 | Maintainability | Module boundaries rõ, logging chuẩn, code review + lint gates |

## 3. External Interfaces | Giao diện ngoài

### APIs
- RESTful JSON APIs tại `/v1/*`.
- Auth qua `Authorization: Bearer <token>`.
- Realtime qua Socket.IO event channels.

### Payment
- **As-Is:** Chưa có payment production flow.
- **Target:** Stripe/PayPal abstraction layer, webhook signature validation.

### Email
- **As-Is:** Email service reset password đang ở mức mock/log.
- **Target:** SMTP/transactional provider (SES/SendGrid) với template và tracking.

### SMS
- **As-Is:** Chưa triển khai.
- **Target:** Twilio/Vonage cho OTP, alerts.

### OAuth
- **As-Is:** UI có placeholder social login.
- **Target:** Google/GitHub OAuth2 + account linking + anti-abuse checks.

## 4. Traceability Matrix (Clean Backend v2)

| Requirement | Clean Endpoint(s) | Automated Evidence |
|---|---|---|
| FR-001 Register User | `POST /v2/auth/register` | `auth.usecases.test`, `http-contract.test` |
| FR-002 Login User | `POST /v2/auth/login` | `auth.usecases.test` |
| FR-003 Token Validation | Auth middleware on protected `/v2/*` routes | `security-validation.test`, `http-contract.test` |
| FR-005 Home Feed | `GET /v2/feed` | `http-contract.test` (auth + envelope) |
| FR-006 Explore Feed | `GET /v2/explore/posts` | build + typed route coverage |
| FR-007 Post Detail | `GET /v2/posts/:postId` | build + typed route coverage |
| FR-008 Create Post | `POST /v2/posts` | validation + usecase tests |
| FR-009 Update Post | `PATCH /v2/posts/:postId` | `post-comment.usecases.test` |
| FR-010 Delete Post | `DELETE /v2/posts/:postId` | `post-comment.usecases.test` |
| FR-011 Add Comment | `POST /v2/posts/:postId/comments` | build + typed route coverage |
| FR-012 Update/Delete Comment | `PATCH/DELETE /v2/comments/:commentId` | `post-comment.usecases.test` |
| FR-013 Profile Management | `GET /v2/users/profile`, `PATCH /v2/users/profile` | `profile-bookmark.usecases.test`, `http-contract.test` |
| FR-014 Notification List | `GET /v2/notifications` | `http-contract.test`, `notification.usecases.test` |
| FR-015 Mark As Read | `PATCH /v2/notifications/:id/read` | build + typed route coverage |
| FR-016 Mark All Read | `PATCH /v2/notifications/read-all` | build + typed route coverage |
| FR-017 Conversation List | `GET /v2/conversations` | `messaging.usecases.test` |
| FR-018 Send Message | `POST /v2/messages` | `messaging.usecases.test`, `http-contract.test` validation branch |
| FR-019 Message Reactions | `PATCH /v2/messages/reactions` | build + typed route coverage |
| FR-020 Delete Message/Room | `DELETE /v2/messages/:messageId`, `DELETE /v2/conversations/:roomId` | `messaging.usecases.test` |
| FR-021 Media Upload | `POST /v2/media/upload` | `media.usecase.test` |
| FR-022 Redis Event Sync | `post.created`, `user.followed`, `post.liked`, `comment.created`, `message.sent` | event projector wiring in container + build |
| FR-023 External OAuth | `POST /v2/auth/oauth` | `auth.usecases.test`, `http-contract.test` |

## 5. NFR Status Snapshot (Clean Backend v2)

| NFR | Status | Evidence |
|---|---|---|
| NFR-001 Performance | Partial | Feed fan-out + Redis feed cache implemented; load benchmark report not attached yet. |
| NFR-002 Scalability | Partial | Stateless clean API modules + event/caching strategy; formal capacity/load report pending. |
| NFR-003 Availability | Partial | Health endpoint and modular boot present; full production SLO evidence pending. |
| NFR-004 Security | Partial | Bearer auth, RBAC baseline, CORS allowlist, rate limiting, security headers, audit logs, SAST (CodeQL) and DAST baseline (ZAP workflow); full secret manager + branch protection enforcement pending. |
| NFR-005 Reliability | Partial | Error middleware and standardized envelope in place; retry/backoff policy coverage pending for all integrations. |
| NFR-008 Maintainability | Done | Clean architecture boundaries, strict typing, test gates (`build:clean`, `test:clean`) and CI quality/security gates added. |
