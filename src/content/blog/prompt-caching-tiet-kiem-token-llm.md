---
title: "Prompt Caching: Tiết Kiệm 90% Chi Phí Token Khi Dùng LLM"
description: "Prompt Caching giúp bạn tiết kiệm tới 90% chi phí token khi dùng LLM bằng cách tái sử dụng phần prompt lặp lại. Hướng dẫn chi tiết cách dùng trên Claude, GPT-4."
pubDate: 2026-10-11
category: cong-nghe
lang: vi
cover: /images/posts/hero-prompt-caching-tiet-kiem-token-llm.webp
draft: false
---

**Prompt Caching là kỹ thuật cho phép LLM "nhớ" và tái sử dụng các phần prompt đã xử lý trước đó.**

Kết quả? Giảm tới 90% chi phí token. Tăng tốc độ phản hồi gấp đôi. Đặc biệt hữu ích khi bạn làm việc với document dài, system prompt lớn, hoặc các tác vụ lặp lại trên cùng một ngữ cảnh.

Thay vì gửi toàn bộ prompt (bao gồm cả phần context dài dòng) cho mỗi request, prompt caching lưu lại phần context đó ở phía server. Chỉ tính phí "cache read" (thường rẻ hơn 10 lần) cho những lần sau. Bạn tiết kiệm token, tiết kiệm tiền, nhận câu trả lời nhanh hơn.

## Prompt Caching Hoạt Động Thế Nào?

Cơ chế? Đơn giản.

LLM chia prompt thành hai phần — **static prefix** (phần ít thay đổi) và **dynamic suffix** (phần thay đổi mỗi request). Lần đầu tiên, LLM xử lý toàn bộ prompt như bình thường, đồng thời lưu static prefix vào cache. Các lần sau, LLM chỉ đọc lại static prefix từ cache (tính phí rẻ hơn 90%) và xử lý phần dynamic suffix mới.

Ví dụ thực tế: bạn đang xây chatbot phân tích báo cáo tài chính 50 trang. Mỗi câu hỏi của user cần gửi kèm toàn bộ báo cáo đó làm context. Không có caching, mỗi câu hỏi = ~100,000 input tokens. Với caching, lần đầu 100K tokens, các lần sau chỉ mất ~10K tokens (câu hỏi) + phí cache read rẻ.

### Điều Kiện Để Prompt Caching Hoạt Động

Không phải prompt nào cũng được cache hiệu quả. Bạn cần:

1. **Static prefix đủ lớn**: Thường ≥1,024 tokens (tùy provider). Prefix ngắn hơn không được cache hoặc cache nhưng không đáng kể.
2. **Prefix giống hệt 100%**: Một ký tự khác biệt = cache miss = tính phí đầy đủ lại.
3. **Request liên tiếp trong cửa sổ thời gian**: Cache có TTL (5-10 phút tùy provider). Quá lâu không dùng → cache hết hạn.

### So Sánh Chi Phí: Có Cache vs Không Cache

Giả sử giá input token = $3/1M tokens, cache read = $0.30/1M tokens.

| Kịch bản | Lần 1 | Lần 2-10 | Tổng (10 requests) |
|----------|-------|----------|---------------------|
| **Không cache** | $0.30 | $0.30 × 9 = $2.70 | **$3.00** |
| **Có cache** | $0.30 | $0.03 × 9 = $0.27 | **$0.57** |

→ Tiết kiệm **81%** chỉ với 10 requests. Càng nhiều request, tỷ lệ tiết kiệm càng cao (tiệm cận 90%).

## Prompt Caching Trên Claude (Anthropic)

Claude là provider đầu tiên triển khai Prompt Caching thương mại (từ tháng 8/2024). 

Anthropic gọi là **Prompt Caching** chính thức. Không có tên khác.

### Cách Bật Prompt Caching Trên Claude

Khi gọi API, thêm `cache_control` vào **cuối** các block bạn muốn cache (system, user, assistant messages hoặc tool definitions).

**Ví dụ Python SDK**:

```python
import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

# System prompt dài (document 50 trang)
long_document = """[50 trang content...]"""

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "Bạn là trợ lý phân tích tài chính chuyên nghiệp."
        },
        {
            "type": "text",
            "text": long_document,
            "cache_control": {"type": "ephemeral"}  # ← Cache block này
        }
    ],
    messages=[
        {"role": "user", "content": "Tóm tắt báo cáo Q3 2026?"}
    ]
)

print(response.usage)
# Lần đầu: input_tokens: 100500, cache_creation_input_tokens: 100000
# Lần sau: input_tokens: 500, cache_read_input_tokens: 100000
```

**Quy tắc**:
- Chỉ cache được block **≥1,024 tokens**.
- Tối đa **4 breakpoints** (4 vị trí cache khác nhau trong một prompt).
- Cache TTL: **5 phút**. Không dùng trong 5 phút → hết hạn.

### Giá Prompt Caching Trên Claude

| Model | Input Token | Cache Write | Cache Read |
|-------|-------------|-------------|------------|
| Claude 3.5 Sonnet | $3/1M | $3.75/1M | $0.30/1M |
| Claude 3.5 Haiku | $0.80/1M | $1/1M | $0.08/1M |

→ Cache read **rẻ hơn 10 lần** so với input bình thường.

## Prompt Caching Trên OpenAI (GPT-4)

OpenAI không gọi là "Prompt Caching". 

Họ gọi là **Cached Context** hoặc **Automatic Caching** — cơ chế tự động, bạn không cần config gì. Tiện, nhưng mất quyền kiểm soát.

### Cách Hoạt Động Trên OpenAI

Từ tháng 10/2023, GPT-4 Turbo và GPT-4o **tự động cache** phần prefix của prompt nếu:
- Prefix giống hệt request trước đó.
- Request trong vòng **~10 phút**.
- Prefix ≥1,024 tokens.

**Bạn không cần làm gì** — OpenAI tự phát hiện và giảm giá. Bạn chỉ thấy khoản giảm trong billing.

**Hạn chế**: bạn không kiểm soát được phần nào được cache (khác với Claude cho phép chỉ định `cache_control` rõ ràng).

### Giá Cached Context Trên OpenAI

| Model | Input | Cached Input (giảm 50%) |
|-------|-------|-------------------------|
| GPT-4o | $2.50/1M | $1.25/1M |
| GPT-4o-mini | $0.15/1M | $0.075/1M |

→ Giảm **50%** (không cao bằng Claude 90%, nhưng tự động).

## Khi Nào Nên Dùng Prompt Caching?

✅ **Nên dùng khi**:

Làm việc với document/context dài (≥10K tokens) lặp lại nhiều lần. Ví dụ: phân tích PDF, chatbot tra cứu sách hướng dẫn, code review với codebase lớn. System prompt phức tạp (≥2K tokens) — agent có nhiều tool, instruction dài. Multi-turn conversation — user hỏi nhiều câu liên tiếp trên cùng ngữ cảnh. Batch processing — xử lý nhiều item với cùng template.

Đây là những trường hợp bạn muốn tiết kiệm thật.

❌ **Không cần dùng khi**:

Prompt ngắn (<1K tokens) — cache overhead không đáng. Prompt thay đổi liên tục — cache miss cao, phí tốn hơn. One-off request — chỉ gọi 1 lần, cache không dùng lại.

Đừng lạm dụng. Caching không phải ma thuật.

## Mẹo Tối Ưu Prompt Caching

### 1. Đặt Phần Ít Thay Đổi Lên Đầu

Cache chỉ hoạt động với **prefix** — phần đầu prompt. Sắp xếp lại thứ tự để phần static (system instruction, document, tool definitions) nằm trước, phần dynamic (user query) nằm sau.

**Sai** (không cache được):
```python
messages = [
    {"role": "user", "content": f"Ngày {date}: {user_query}"},  # ← Thay đổi mỗi lần
    {"role": "system", "content": long_document}  # ← Static nhưng nằm sau
]
```

**Đúng**:
```python
system = [
    {"type": "text", "text": long_document, "cache_control": {"type": "ephemeral"}}
]
messages = [
    {"role": "user", "content": user_query}  # ← Dynamic nằm sau
]
```

### 2. Gộp Context Dài Vào System, Không Phải User Message

Claude cache hiệu quả hơn khi context nằm trong `system` array thay vì `user` message đầu tiên.

### 3. Giữ Nguyên Prefix 100% Giống Nhau

Một khoảng trắng khác biệt = cache miss. Nếu bạn tự build prompt từ nhiều phần, dùng template cố định, tránh concat động.

### 4. Kết Hợp Với Batching

Nếu bạn có 100 request cùng context, gửi chúng liên tiếp trong cửa sổ 5 phút để tận dụng cache. Batch 10 request/lần, đợi kết quả, rồi batch tiếp.

## So Sánh Prompt Caching vs Semantic Caching

Nhiều người nhầm lẫn giữa **Prompt Caching** và **[Semantic Caching](/blog/semantic-caching-trong-llm/)** — hai kỹ thuật khác nhau:

| | Prompt Caching | Semantic Caching |
|-|----------------|------------------|
| **Cache cái gì?** | Prefix của prompt (phần input) | Cả input query + output response |
| **Điều kiện cache hit** | Prefix khớp 100% ký tự | Query tương tự về nghĩa (dùng embeddings) |
| **Ai quản lý?** | Provider (Claude, OpenAI) | Bạn tự triển khai (Redis, PostgreSQL) |
| **Tốc độ tăng** | Gấp đôi (vẫn phải chạy model) | Gấp 100x (không chạy model) |
| **Tiết kiệm chi phí** | 90% | 100% (cache hit = free) |

→ Kết hợp cả hai để tối ưu tối đa: Semantic caching bọc ngoài (cache hit = trả ngay), cache miss → gọi LLM với Prompt Caching.

## Giám Sát Cache Performance

### Claude (Anthropic)

Response trả về `usage` object chi tiết:

```json
{
  "input_tokens": 500,
  "cache_creation_input_tokens": 100000,  // ← Lần đầu tạo cache
  "cache_read_input_tokens": 100000,      // ← Lần sau đọc cache
  "output_tokens": 200
}
```

Tính **cache hit rate**: `cache_read_tokens / (cache_read_tokens + input_tokens)`.

### OpenAI

OpenAI không expose cache metrics trong API response. Bạn chỉ thấy khoản giảm giá trong usage dashboard sau vài giờ.

**Workaround**: log timestamp + prefix hash của mỗi request, so sánh giá thực tế với giá niêm yết để suy ngược.

## Hạn Chế Của Prompt Caching

**TTL ngắn** (5-10 phút). Không phù hợp với use case cần cache lâu — dùng vector database + RAG thay thế.

**Không hoạt động với streaming** trên một số provider. Bạn phải chọn: caching hoặc streaming, không thể cả hai.

**Tăng độ phức tạp code**. Phải quản lý thứ tự prompt, theo dõi cache metrics. Không còn đơn giản như một request API nữa.

**Provider lock-in**. Mỗi provider có cú pháp riêng. Migrate từ Claude sang OpenAI? Viết lại code caching.

## Tương Lai Của Prompt Caching

Xu hướng 2026-2027:

- **Longer TTL**: Anthropic và OpenAI đang thử nghiệm cache giữ lâu hơn (lên tới 1 giờ).
- **Cross-session caching**: Cache chia sẻ giữa nhiều user (với consent) để giảm chi phí hệ thống.
- **Semantic-aware caching**: Thay vì khớp 100% ký tự, cache sẽ nhận biết "gần giống" về nghĩa.

**Đọc thêm:**
- [Semantic Caching Trong LLM: Tiết Kiệm 90% Chi Phí API AI](/blog/semantic-caching-trong-llm/) — Kỹ thuật bổ sung giúp cache cả output, tăng tốc gấp 100 lần và tiết kiệm 100% chi phí cho query tương tự.
- [AI Gateway & Model Router: Quản Lý Nhiều LLM Thông Minh 2026](/blog/ai-gateway-model-router-quan-ly-llm-2026/) — Hạ tầng trung gian giúp bạn tích hợp prompt caching vào workflow multi-model một cách tự động.
- [Streaming AI Responses: Trải Nghiệm Realtime Với LLM 2026](/blog/streaming-ai-responses-realtime-llm-2026/) — Cách kết hợp prompt caching với streaming để vừa tiết kiệm chi phí, vừa giữ trải nghiệm realtime mượt mà cho user.
