# BRD - Business Requirements Document

## 1. Executive Summary | Tóm tắt điều hành

### Project Overview | Tổng quan dự án
- **VI:** 500 Bros Social Network là nền tảng mạng xã hội web-first cho người dùng tạo nội dung, tương tác cộng đồng và nhắn tin realtime.
- **EN:** 500 Bros Social Network is a web-first social platform enabling content creation, community engagement, and real-time messaging.
- **As-Is:** Frontend Next.js + backend Express + MySQL/Prisma + Redis/Socket.IO + Cloudinary.

### Business Opportunity | Cơ hội kinh doanh
- **VI:** Tạo cộng đồng ngách có tỷ lệ giữ chân cao dựa trên nội dung ngắn, tương tác nhanh (like/comment/follow), và chat trực tiếp.
- **EN:** Build a high-retention niche community driven by short-form content, rapid engagement (like/comment/follow), and direct chat.

### Problem Statement | Bài toán
- **VI:** Người dùng thiếu một nền tảng nhẹ, phản hồi nhanh, tập trung vào tương tác xã hội thực dụng thay vì thuật toán phức tạp.
- **EN:** Users lack a lightweight, responsive platform focused on practical social interactions over heavy algorithmic complexity.

## 2. Goals | Mục tiêu

### Short-term (0-6 months) | Ngắn hạn
- Đạt product-market fit cho luồng cốt lõi: đăng ký, đăng nhập, feed, tương tác bài viết, chat.
- Tăng tỷ lệ kích hoạt ngày đầu (D1 activation) >= 45%.
- Giảm lỗi nghiêm trọng production (Sev-1/Sev-2) xuống < 2 lỗi/tháng.

### Long-term (6-24 months) | Dài hạn
- Mở rộng lên multi-region và 10x user base.
- Bổ sung monetization (quảng cáo, premium features, creator tools).
- Hoàn thiện governance/security theo chuẩn enterprise (OWASP ASVS mức cơ bản).

## 3. Stakeholders | Các bên liên quan

| Stakeholder | Vai trò chính | Mục tiêu |
|---|---|---|
| Client/Sponsor | Chủ đầu tư sản phẩm | Tăng trưởng người dùng, doanh thu |
| End Users | Người dùng cuối | Trải nghiệm mượt, an toàn, dễ dùng |
| Admin/Moderation | Quản trị vận hành | Quản lý cộng đồng, xử lý vi phạm |
| Product Team | PM/BA/Designer | Định nghĩa roadmap và UX |
| Engineering Team | FE/BE/QA/DevOps | Phát triển, kiểm thử, vận hành |
| Security/Compliance | Security lead | Kiểm soát rủi ro và tuân thủ |

## 4. Scope | Phạm vi

### In Scope | Trong phạm vi
- Xác thực người dùng (register/login, token session).
- Feed bài viết, CRUD post, like/save, comment/reply.
- Follow/follower, profile và chỉnh sửa hồ sơ.
- Notifications (like, follow, reply), read/read-all.
- Realtime messaging (text/file), reaction, delete message/room.
- Explore + topic filtering, bookmark, media upload.

### Out of Scope | Ngoài phạm vi
- Native mobile app (iOS/Android).
- Thanh toán production-ready (chưa có payment module hoàn chỉnh).
- Multi-tenant B2B enterprise controls.
- ML recommendation engine nâng cao.

## 5. KPIs | Chỉ số thành công

| Nhóm KPI | Metric | Công thức/Định nghĩa | Mục tiêu 2 quý |
|---|---|---|---|
| Growth | DAU/MAU | DAU chia MAU | >= 0.30 |
| Growth | Activation Rate | User hoàn tất login + 1 tương tác trong 24h | >= 45% |
| Revenue (future) | ARPU | Doanh thu tháng / MAU trả phí | TBD sau phase monetization |
| Usage | Avg Sessions/User/Day | Tổng sessions / DAU | >= 2.0 |
| Usage | Message Send Rate | Tổng tin nhắn gửi / DAU | >= 8 |
| Operational | API P95 Latency | P95 cho endpoint chính | < 400ms |
| Operational | Uptime | SLA backend + DB | >= 99.9% |
| Operational | Defect Leakage | Bug prod / tổng bug | < 10% |

## 6. Risks | Rủi ro
- **Security:** CORS wildcard, secret hygiene và một số route nhạy cảm cần harden.
- **Scalability:** Chat realtime và feed query có thể nghẽn khi tăng tải đột biến.
- **Delivery:** Thiếu quality gates mạnh trong CI/CD (test/security scan chưa đầy đủ).
- **Product:** Một số feature mới chỉ partial (ví dụ social login/reset UX).
- **Data Integrity:** Chiến lược migration hiện tại có rủi ro mất dữ liệu nếu không kiểm soát.

## 7. Assumptions | Giả định
- Người dùng chính truy cập web trên desktop/mobile browser.
- MySQL + Redis tiếp tục là nền tảng dữ liệu ngắn hạn.
- Token-based auth giữ vai trò chính trong 12 tháng tới.
- Team có khả năng vận hành GitHub Actions + Docker + cloud PaaS.

## 8. Constraints | Ràng buộc
- Ngân sách hạ tầng giai đoạn đầu ưu tiên tối ưu chi phí.
- Legacy code và tài liệu chưa đồng đều giữa các module.
- Không gián đoạn sản phẩm đang chạy khi hardening bảo mật.
- Cần cải tiến dần theo sprint, tránh big-bang rewrite.
