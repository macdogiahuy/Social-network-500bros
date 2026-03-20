# Tóm tắt Issue và Kế hoạch thực hiện (PLAN.md)

Dự án hiện tại có các issue sau trên GitHub Repository:

1. **Issue #1: Missing search functionality for topics** (Backend - API)
   - *Chi tiết:* Không thể tìm kiếm topic theo tên. Cần tạo endpoint `/v1/topics/search`, update `TopicRepository` để search case-insensitive, thêm validation.
2. **Issue #2: Add user profile update functionality** (Backend - API)
   - *Chi tiết:* Người dùng không thể update thông tin cá nhân. Cần tạo endpoint cho `update profile` (firstName, lastName), upload avatar, auth check.
3. **Issue #3: Implement password reset functionality** (Backend - Auth/API)
   - *Chi tiết:* Thiếu tính năng quên mật khẩu. Tạo luồng gửi email token (`/forgot-password`), token verification, cập nhật mật khẩu mới (`/reset-password`).
4. **Issue #4: Summary of Implemented Functionality** (Tài liệu/Review)
   - *Chi tiết:* Bản tóm tắt cho thấy 1, 2, 3 đã có khung (hoặc được ai đó commit nhưng chưa hoàn chỉnh). Cần kiểm tra lại Db update, Prisma generate và test.
5. **Issue #5: Theme and Settings Functionality Not Working** (Frontend - UI/UX)
   - *Chi tiết:* Chuyển đổi theme Light/Dark/Auto và color accent trên UI không có tác dụng. Cần tạo ThemeProvider context, lưu localStorage và áp CSS root.

## Kế hoạch hành động
- **Bước 1:** Kiểm tra tiến độ thực tế trong source code (của cả Express backend và NextJS frontend) xem Issue #1, #2, #3 đã được code đến đâu dựa theo thông tin của Issue #4.
- **Bước 2 (Fix số 1 - Backend & Database):** Sinh Prisma Client mới, hoàn thiện (hoặc sửa lỗi) cho /topics/search, /profile, /forgot-password.
- **Bước 3 (Fix số 2 - Frontend):** Triển khai ThemeProvider cho NextJS app, giải quyết Issue #5.
- **Bước 4 (Phản hồi từ Rabbit Code):** Dựa trên check-list của phía người dùng sau mỗi lần fix để cải thiện mã nguồn. Mọi thay đổi đều được test trước.
