# SDD - Software Design Document

## 1. Architecture Style | Kiểu kiến trúc

- **As-Is:** Modular monolith (domain-based modules) với thành phần realtime/event-driven.
- **Target:** Giữ modular monolith ngắn hạn, chuẩn hóa boundaries để tách microservices theo nhu cầu tải cao (chat/notification/media).
- **Design principles:** SOLID, separation of concerns, API-first, backward-compatible schema evolution.

## 2. High-Level Components | Thành phần cấp cao

| Component | Responsibility | Tech |
|---|---|---|
| Frontend | UI, session state, API orchestration, realtime client | Next.js, React Query, Axios |
| API Backend | Business rules, REST APIs, auth/authorization | Express, TypeScript |
| Database | Transactional data store | MySQL, Prisma |
| Queue/Event Bus | Async domain events | Redis Pub/Sub |
| Cache | Session-like hot data, transient event support | Redis |
| File Storage | Media object storage/CDN delivery | Cloudinary |

## 3. Design Decisions | Quyết định thiết kế

1. **Next.js cho frontend**
   - Tối ưu SSR/CSR hybrid, routing linh hoạt, ecosystem mạnh.
2. **Express + TypeScript cho backend**
   - Tốc độ phát triển nhanh, dễ module hóa theo domain.
3. **Prisma + MySQL**
   - Type-safe query, schema quản trị tốt, dễ migration.
4. **Redis + Socket.IO**
   - Đáp ứng realtime chat/notifications với độ trễ thấp.
5. **Cloudinary cho media**
   - Giảm tải tự vận hành object storage + transform ảnh/video.

## 4. Module Design | Thiết kế module

| Module | Responsibility | Inputs | Outputs | Dependencies |
|---|---|---|---|---|
| Auth/User | Register, login, profile, role checks | credentials/profile updates | tokens, user profiles | DB, JWT, middleware |
| Post | CRUD post, feed query | content, filters | post entities, feed | DB, topic, media |
| Comment | comments/replies lifecycle | postId/commentId/content | comment tree | DB, post |
| Follow | social graph operations | userId targets | follow status/lists | DB, user |
| Notification | async notification lifecycle | domain events | notification list/read states | Redis, DB, socket |
| Conversation | rooms/messages/reactions | room/message payload | message streams | DB, Redis, socket |
| Media | upload and file validation | multipart files | signed/public URLs | Cloudinary, multer |
| Topic | taxonomy/search/caching | keyword/topic ops | topic lists | DB, cache |

## 5. Error Handling Strategy | Chiến lược xử lý lỗi

- Chuẩn hóa response envelope: `code`, `message`, `details`, `traceId`.
- Phân loại lỗi: validation (4xx), authz/authn (401/403), business conflicts (409), system (5xx).
- Không trả stacktrace cho client ngoài môi trường development.
- Realtime errors emit theo event chuẩn (`error` channel) để UI hiển thị fallback rõ ràng.

## 6. Logging Strategy | Chiến lược logging

- **Application logs:** structured JSON, có `traceId`, `userId`, `module`, `latencyMs`.
- **Access logs:** request/response summary cho API gateway.
- **Security logs:** login failures, permission denials, suspicious traffic patterns.
- **Retention:** 30 ngày hot + archive 90 ngày; masking PII.

## 7. Scalability Strategy | Chiến lược mở rộng

### Horizontal scale
- Backend stateless, scale qua container replicas.
- Socket sticky sessions hoặc shared adapter khi multi-instance.

### Data scale
- Tối ưu indexes feed/chat/reply; partition theo thời gian khi volume tăng.
- Read-replica cho read-heavy workloads.

### Event scale
- Chuẩn hóa event schema versioning.
- Idempotent consumers cho notification/counter updates.

### Progressive decomposition
- Tách `conversation` và `notification` thành service độc lập khi:
  - CPU/socket saturation > 70% kéo dài.
  - Release cadence bị chậm do coupling.
