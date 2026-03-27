# Project Plan & Issue Tracker

This document tracks the current open issues in the Social Network 500Bros repository and provides a detailed implementation plan for resolving them on the `long-dev` branch.

## 1. Issue 1: Missing search functionality for topics
**Component:** Backend - API
* Không thể tìm kiếm topic theo tên. Cần tạo endpoint `/v1/topics/search`, update `TopicRepository` để search case-insensitive, thêm validation.

### Implementation Steps
- **Route:** Add `/v1/topics/search` endpoint in `bento-microservices-express/src/modules/topic/topic.routes.ts`.
- **Controller:** Create `searchTopics` function in `TopicController` parsing `req.query.q`.
- **Repository:** Extend `TopicRepository` with a case-insensitive Prisma search query (`contains`, `mode: 'insensitive'`).
- **Validation:** Use Zod to ensure the query parameter is a valid string.
- **Frontend Integration:** Hook up a React Query `useQuery` inside the frontend search bar component to fetch results dynamically.

## 2. Issue 2: Add user profile update functionality
**Component:** Backend - API
* Người dùng không thể update thông tin cá nhân. Cần tạo endpoint cho `update profile` (firstName, lastName), upload avatar, auth check.

### Implementation Steps
- **Route:** Add `PUT /v1/users/profile` in the user module.
- **Service Layer:** Implement `updateProfile` method handling avatar file uploads via `multer` and `sharp` image optimization.
- **Repository:** Create the corresponding Prisma update step for the `User` model.
- **Frontend Integration:** Tie the settings form in the `bento-social-next` app utilizing `react-hook-form` and `zod` to submit the updated data.

## 3. Issue 3: Implement password reset functionality
**Component:** Backend - Auth / API
* Thiếu tính năng quên mật khẩu. Tạo luồng gửi email token (`/forgot-password`), token verification, cập nhật mật khẩu mới (`/reset-password`).

### Implementation Steps
- **Storage Configuration:** Setup a Mailer service (e.g., Nodemailer transport or an external API).
- **Endpoints:**
  1. `POST /v1/auth/forgot-password`: Generates a reset token, caches it in Redis (with a TTL), and dispatches a reset link email.
  2. `POST /v1/auth/reset-password`: Validates the token against Redis, hashes the new password via Bcrypt, and updates the DB.
- **Frontend Integration:** Build out the missing "Forgot Password" and "Set New Password" UI sub-pages inside `src/app/login`.

## 4. Issue 4: Summary of Implemented Functionality
**Component:** Backend - Database / Prisma
* Bản tóm tắt cho thấy 1, 2, 3 đã có khung (hoặc được ai đó commit nhưng chưa hoàn chỉnh). Cần kiểm tra lại Db update, Prisma generate và test.

### Implementation Steps
- **Audit Steps:** Trace existing schema inside `prisma/schema.prisma` to verify tracking fields. If missing, generate new migrations (`npx prisma migrate dev`).
- **Testing:** Start the local Docker Compose cluster, run manual integration tests using Postman (using the collections found in the root), and ensure all API routes respond correctly.

## 5. Issue 5: Theme and Settings Functionality Not Working
**Component:** Frontend - UI / UX
* Chuyển đổi theme Light/Dark/Auto và color accent trên UI không có tác dụng. Cần tạo ThemeProvider context, lưu localStorage và áp CSS root.

### Implementation Steps
- **Context:** Implement a global `<ThemeProvider />` utility component to wrap the Next.js `layout.tsx`.
- **State Mgmt:** Use local browser storage (or `next-themes`) to detect and persist users' layout preferences (Light / Dark / Auto-system).
- **CSS:** Define and toggle correct CSS root variables in `globals.css` which Tailwind relies on.
- **UI Binding:** Attach toggle functionality directly to the Switch control in the user application app-bar settings dropdown.
