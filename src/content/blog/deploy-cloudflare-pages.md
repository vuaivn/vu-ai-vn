---
title: 'Deploy website lên Cloudflare Pages: Hướng dẫn miễn phí từ A-Z'
description: 'Hướng dẫn deploy website lên Cloudflare Pages miễn phí: kết nối GitHub, cấu hình build và đưa trang web lên internet nhanh chóng.'
pubDate: 2026-06-03
category: 'cong-nghe'
lang: 'vi'
---

**Cloudflare Pages** là nền tảng miễn phí giúp bạn deploy website tĩnh chỉ trong vài phút, với CDN toàn cầu và HTTPS tự động. Chỉ cần kết nối repo GitHub, cấu hình lệnh build, và mỗi lần bạn push code, trang web sẽ tự động cập nhật. Đây là lựa chọn lý tưởng cho blog, portfolio và landing page.

## Cloudflare Pages là gì?

Cloudflare Pages là dịch vụ hosting cho trang web tĩnh và ứng dụng frontend, chạy trên mạng lưới CDN của Cloudflare. Website của bạn được phân phối từ hàng trăm điểm trên thế giới, giúp tải nhanh ở mọi nơi.

### Vì sao chọn Cloudflare Pages?

- **Miễn phí hào phóng:** băng thông không giới hạn cho nhu cầu cá nhân.
- **CDN toàn cầu:** tốc độ tải nhanh khắp thế giới.
- **HTTPS tự động:** chứng chỉ SSL miễn phí.
- **CI/CD tích hợp:** tự build và deploy mỗi khi push git.

## Các bước deploy website lên Cloudflare Pages

Dưới đây là quy trình cơ bản với một dự án như Astro:

1. **Đưa code lên GitHub:** tạo repo và push mã nguồn.
2. **Đăng nhập Cloudflare** và vào mục Workers & Pages.
3. **Tạo project mới:** chọn "Connect to Git" và chọn repo của bạn.
4. **Cấu hình build:** điền lệnh build và thư mục xuất.
5. **Deploy:** nhấn nút và chờ vài phút.

### Cấu hình build mẫu cho Astro

```
Build command:   npm run build
Output directory: dist
```

Với các framework khác, chỉ cần thay lệnh và thư mục output tương ứng. Cloudflare tự nhận diện nhiều framework phổ biến.

## Tự động hóa deploy với Git

Sức mạnh lớn nhất là quy trình tự động: mỗi lần bạn `git push` lên nhánh chính, Cloudflare Pages tự động build lại và cập nhật website. Bạn cũng có thể xem bản preview cho mỗi nhánh trước khi merge.

### Thêm tên miền riêng

Sau khi deploy, bạn có thể gắn tên miền riêng (ví dụ vu.ai.vn) trong mục Custom Domains. Cloudflare sẽ hướng dẫn cấu hình DNS và tự cấp SSL cho tên miền của bạn.

## Câu hỏi thường gặp (FAQ)

**Cloudflare Pages có thực sự miễn phí không?**
Có. Gói miễn phí đủ cho hầu hết dự án cá nhân, với băng thông không giới hạn và số lượng build hào phóng mỗi tháng.

**Tôi cần biết DevOps để deploy không?**
Không. Giao diện đơn giản, chỉ cần kết nối GitHub và điền vài thông số build là xong.

**Deploy mất bao lâu?**
Thường chỉ vài phút cho mỗi lần build, tùy kích thước dự án.

**Có hỗ trợ tên miền tùy chỉnh không?**
Có. Bạn có thể gắn tên miền riêng miễn phí và Cloudflare tự động cấp chứng chỉ HTTPS.

## Kết luận

Cloudflare Pages giúp đưa website lên internet nhanh, miễn phí và chuyên nghiệp. Nếu bạn đã có một dự án web, hãy thử kết nối nó với Cloudflare Pages ngay hôm nay để trải nghiệm quy trình deploy tự động mượt mà.
