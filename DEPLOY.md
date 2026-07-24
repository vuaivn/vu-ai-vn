# Hướng dẫn deploy vu.ai.vn lên Cloudflare Pages

Repo: https://github.com/vuaivn/vu-ai-vn

## Cách A — Deploy qua Dashboard (không cần token, khuyên dùng)

1. Vào https://dash.cloudflare.com → chọn account của anh.
2. Menu trái: **Workers & Pages** → **Create** → tab **Pages** → **Connect to Git**.
3. Chọn repo **vuaivn/vu-ai-vn** (bấm *Install & Authorize* GitHub nếu được hỏi).
4. Cấu hình build:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** để mặc định (hoặc thêm biến `NODE_VERSION=20`)
5. Bấm **Save and Deploy** → chờ ~1–2 phút, site lên ở `vu-ai-vn.pages.dev`.

### Trỏ domain vu.ai.vn
6. Trong project vừa tạo → tab **Custom domains** → **Set up a custom domain**.
7. Nhập `vu.ai.vn` → **Continue** → **Activate domain**.
8. Vì `ai.vn` đã ở Cloudflare, bản ghi CNAME sẽ tự thêm. Chờ vài phút để SSL cấp xong.

Xong! Từ giờ mỗi lần push lên `main`, Cloudflare tự build & deploy lại.

## Cách B — Deploy qua Wrangler CLI (cần API token đủ quyền)

Token cần 3 quyền:
- **Account → Cloudflare Pages → Edit**
- **Zone → DNS → Edit** (zone `ai.vn`)
- **Zone → Zone → Read**

```powershell
$env:CLOUDFLARE_API_TOKEN="<token>"
cd projects/vu-ai-vn
npm run build
npx wrangler pages project create vu-ai-vn --production-branch main
npx wrangler pages deploy dist --project-name vu-ai-vn
```

Sau đó thêm custom domain `vu.ai.vn` trong dashboard (Custom domains) hoặc qua API.

## Ghi chú
- Sitemap: https://vu.ai.vn/sitemap.xml
- RSS: https://vu.ai.vn/rss.xml
- Bản EN: https://vu.ai.vn/en/
