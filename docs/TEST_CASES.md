# TEST_CASES

| ID | Module | Scenario | Steps | Expected | Priority |
|---|---|---|---|---|---|
| TC-001 | Login | Đăng nhập thành công | Nhập credential hợp lệ -> submit | Điều hướng home, token/session được lưu | P0 |
| TC-002 | Login | Sai mật khẩu | Nhập username đúng + password sai -> submit | Thông báo lỗi auth, không tạo session | P0 |
| TC-003 | Register | Đăng ký thành công | Nhập form hợp lệ -> submit | Tạo user mới, chuyển login | P0 |
| TC-004 | Register | Email trùng | Đăng ký với email đã tồn tại | Báo lỗi unique constraint | P0 |
| TC-005 | CRUD-Post | Tạo bài viết text | Nhập content -> tạo post | Post hiển thị trong feed | P0 |
| TC-006 | CRUD-Post | Cập nhật bài viết | Chủ sở hữu sửa content | Post cập nhật đúng dữ liệu | P1 |
| TC-007 | CRUD-Post | Xóa bài viết | Chủ sở hữu xóa post | Post biến mất khỏi feed/detail | P0 |
| TC-008 | Permission | User thường xóa post người khác | Dùng account khác gọi delete | API trả 403/deny | P0 |
| TC-009 | Validation | Upload file không hợp lệ | Upload file sai mime/size | Reject request với message rõ ràng | P0 |
| TC-010 | Comment | Tạo comment và reply | Comment post -> reply comment | Cây comment hiển thị đúng cấp | P1 |
| TC-011 | Follow | Follow/unfollow user | Click follow rồi unfollow | Counter và trạng thái theo dõi cập nhật | P1 |
| TC-012 | Notification | Đọc 1 thông báo | Mở noti -> mark read | trạng thái `isRead=true` | P1 |
| TC-013 | Notification | Đọc tất cả | Gọi mark-all-read | Toàn bộ notification chuyển read | P1 |
| TC-014 | Messaging | Gửi tin nhắn text realtime | Mở room -> gửi tin | Người nhận thấy message realtime | P0 |
| TC-015 | Messaging | Gửi file đính kèm | Upload file trong chat | Tin nhắn chứa URL hợp lệ | P1 |
| TC-016 | Messaging | Reaction message | Thêm emoji reaction | Reaction hiển thị cho participant | P2 |
| TC-017 | Search | Tìm post theo keyword | Nhập từ khóa ở explore | Trả về danh sách đã lọc | P1 |
| TC-018 | Pagination | Phân trang feed | Scroll/load trang tiếp theo | Không trùng item, thứ tự đúng | P1 |
| TC-019 | Error Handling | API lỗi 500 | Mô phỏng lỗi backend | UI hiển thị fallback, không crash | P0 |
| TC-020 | Security | Access protected route không token | Gọi API protected | 401 Unauthorized | P0 |
| TC-021 | Security | Token giả mạo | Dùng JWT invalid signature | Từ chối request/socket handshake | P0 |
| TC-022 | Security | XSS payload trong content | Gửi script payload vào post/comment | Payload bị sanitize/escape | P0 |
| TC-023 | Security | CSRF check (if cookie mode enabled) | Gọi state-changing request cross-site | Request bị chặn khi policy bật | P1 |
| TC-024 | Performance Smoke | Feed load baseline | 100 concurrent users đọc feed 5 phút | P95 < 400ms, error rate < 1% | P1 |
| TC-025 | Performance Smoke | Message send baseline | 200 concurrent message/min | Độ trễ push realtime trong ngưỡng SLA | P1 |

## Traceability Snapshot
- FR-001..FR-004 -> TC-001..TC-004, TC-020, TC-021.
- FR-008..FR-013 -> TC-005..TC-012, TC-022.
- FR-014..FR-020 -> TC-012..TC-019, TC-025.
- NFR-001/NFR-002 -> TC-024/TC-025.

## Clean Backend Coverage (Current)
- Auth register/login/introspect + Bearer guard: covered by clean tests (`auth.usecases`, `security-validation`).
- Post/comment ownership and admin override: covered by clean tests (`post-comment.usecases`).
- Messaging core use cases (list/send/delete): covered by clean tests (`messaging.usecases`).
- Bookmark/profile/media core use cases: covered by clean tests (`profile-bookmark.usecases`, `media.usecase`).
