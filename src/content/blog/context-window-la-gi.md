---
title: "Context window là gì? 'Trí nhớ ngắn hạn' của AI"
description: "Context window là lượng thông tin tối đa mà mô hình AI có thể 'nhìn thấy' cùng lúc khi trả lời. Giải thích dễ hiểu về token, giới hạn và mẹo dùng hiệu quả."
pubDate: 2026-07-11
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/cover-context-window-la-gi.webp"
---

**Context window** (cửa sổ ngữ cảnh) là lượng thông tin tối đa mà một mô hình AI có thể "nhìn thấy" và xử lý **cùng một lúc** khi tạo câu trả lời. Có thể ví nó như **trí nhớ ngắn hạn** của AI: mọi thứ nằm trong cửa sổ này thì AI nhớ và dùng được, vượt ra ngoài thì nó "quên".

![Sơ đồ cửa sổ ngữ cảnh của AI với các token nằm trong và ngoài vùng ghi nhớ](/images/posts/cover-context-window-la-gi.webp)

## Token — đơn vị đo của context window

AI không đọc theo chữ hay câu, mà theo **token** — những mảnh nhỏ của văn bản (một từ tiếng Anh thường là 1 token, tiếng Việt có thể nhiều hơn). Context window được đo bằng số token.

Ví dụ một mô hình có cửa sổ **128.000 token** nghĩa là nó có thể ôm khoảng vài trăm trang sách trong một lần xử lý. Con số này gồm **cả câu hỏi của bạn lẫn câu trả lời của AI** — cả hai cùng "ăn" vào ngân sách token.

## Vì sao context window quan trọng?

- **Tài liệu dài:** muốn AI tóm tắt một hợp đồng 200 trang, cả tài liệu phải lọt vào cửa sổ, nếu không AI chỉ thấy một phần.
- **Hội thoại dài:** trong một cuộc trò chuyện kéo dài, những gì nói ở đầu có thể bị "trôi" ra khỏi cửa sổ và AI quên mất.
- **Độ chính xác:** khi context quá đầy, AI dễ bỏ sót chi tiết ở giữa (hiện tượng "lost in the middle").

## Context window lớn hơn có phải luôn tốt hơn?

Không hẳn. Cửa sổ lớn giúp ôm nhiều thông tin, nhưng:

- **Tốn chi phí và chậm hơn** — càng nhiều token, càng tốn tính toán.
- **Nhiễu thông tin** — nhồi quá nhiều thứ không liên quan khiến AI kém tập trung.

Đây chính là lý do các kỹ thuật như **RAG** ra đời: thay vì nhồi tất cả vào cửa sổ, ta chỉ đưa vào những đoạn thật sự liên quan. Đối với AI agent, việc quản lý khéo context window còn quan trọng hơn — liên quan mật thiết đến cách [AI agent](/blog/ai-agent-la-gi) và [MCP](/blog/mcp-la-gi) chọn lọc thông tin để đưa cho mô hình.

## Mẹo dùng context window hiệu quả

1. **Đưa thông tin quan trọng lên đầu hoặc cuối** — vùng giữa dễ bị bỏ sót.
2. **Gọn và đúng trọng tâm** — bỏ phần thừa để AI tập trung.
3. **Chia nhỏ tác vụ lớn** — thay vì nhồi một lần, xử lý từng phần.
4. **Bắt đầu hội thoại mới** khi chủ đề đã đổi hẳn, để tránh nhiễu từ ngữ cảnh cũ.

## Kết

Hiểu context window giúp bạn dùng AI thông minh hơn: biết vì sao AI đôi khi "quên", vì sao tài liệu quá dài bị cắt, và cách sắp xếp thông tin để nhận câu trả lời tốt nhất. Đây là một trong những khái niệm nền tảng nhất khi làm việc với AI hiện đại. Muốn đi tiếp, đọc thêm [MCP là gì](/blog/mcp-la-gi) và [AI Agent là gì](/blog/ai-agent-la-gi).
