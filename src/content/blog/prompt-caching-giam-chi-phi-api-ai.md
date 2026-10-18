---
title: "Prompt Caching: Giảm 90% Chi Phí API Khi Dùng AI Nhiều Lần"
description: "Prompt Caching giúp giảm 90% cost API AI khi gọi lặp đi lặp lại với context dài. Anthropic, OpenAI, Google đều hỗ trợ. Hướng dẫn thực chiến + case study."
pubDate: 2026-10-18
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-prompt-caching-giam-chi-phi-api-ai.webp"
draft: false
---

**Prompt caching là kỹ thuật LLM provider lưu tạm phần context lặp lại của request, giúp bạn trả 1/10 giá cho lần gọi sau — từ $3/triệu token xuống $0.30. Anthropic, OpenAI và Google AI Studio đều hỗ trợ, nhưng bạn phải cấu trúc prompt đúng cách: phần tĩnh lên đầu, phần động xuống cuối.**

Bài này mổ xẻ cách hoạt động, khi nào nên dùng, và cách setup thực tế trên 3 nền tảng chính.

## Prompt Caching Là Gì và Tại Sao Nó Quan Trọng?

Prompt caching (đôi khi gọi là context caching hay KV cache reuse) là tính năng cho phép LLM API "ghi nhớ" phần context bạn gửi lần trước — thường là system prompt dài, tài liệu tham khảo, hoặc lịch sử chat — và tái sử dụng nó trong các lần gọi sau mà không cần xử lý lại từ đầu.

**Tại sao quan trọng?** Vì chi phí API LLM tính theo token. Nếu bạn gửi 100,000 token context giống nhau cho 1,000 request (ví dụ: bot customer support với knowledge base dài), bạn đang trả tiền cho 100 triệu token. Với prompt caching, bạn chỉ trả đầy đủ cho lần đầu, các lần sau giảm 90% — từ $300 xuống còn ~$30 cho ví dụ trên (giá Anthropic Claude).

Đây là đòn bẩy lớn nhất để giảm cost trong production — quan trọng hơn cả việc chọn model rẻ hơn, bởi nó không hy sinh chất lượng output.

## Cơ Chế Hoạt Động: Cache Ở Đâu và Lưu Bao Lâu?

LLM xử lý text bằng cách tính toán một cấu trúc gọi là **KV cache** (key-value cache từ lớp attention) cho mỗi token input. Bình thường, KV cache này bị xóa ngay sau khi request xong. Prompt caching giữ lại KV cache của phần context được đánh dấu, lưu trên RAM của server trong 5–10 phút (Anthropic: 5 phút, OpenAI/Google: tùy model).

**Flow thực tế:**

1. Lần đầu gọi API với `cache_control` (Anthropic) hoặc `cached_content` (Google) → provider tính toán KV cache bình thường, đồng thời lưu snapshot vào một bộ nhớ tạm.
2. Lần sau (trong 5 phút), nếu prefix context khớp 100% → provider bỏ qua bước tính toán KV cache cho phần đó, chỉ tính phần mới.
3. Bạn bị tính **cache write cost** (100% giá input) lần đầu, **cache read cost** (~10% giá input) các lần sau.

**Điều kiện khớp cache (quan trọng!):**

- Text phải giống **tuyệt đối** (1 ký tự sai = cache miss).
- Thứ tự messages phải giữ nguyên.
- Phần cache phải ở **đầu** conversation (Anthropic) hoặc được khai báo riêng (Google).

Nếu bạn chèn một câu mới vào giữa system prompt, cache bị vỡ toàn bộ.

## Khi Nào Nên Dùng Prompt Caching?

**Dùng khi:**

- **Context dài, lặp đi lặp lại**: chatbot có knowledge base 50k+ token, code assistant với codebase lớn, RAG app với nhiều document chunks giống nhau.
- **Số lượng request cao**: chạy hàng trăm/hàng nghìn query với cùng phần đầu.
- **Đổi ít ở cuối**: chỉ câu hỏi user thay đổi, phần system instructions + examples + docs giữ nguyên.

**Không cần dùng khi:**

- Context ngắn (<5,000 token).
- Request thưa thớt (vài chục lần/ngày) — cache hết hạn trước khi tái dùng.
- Context thay đổi mỗi request (mỗi user một bộ tài liệu khác nhau).

**Breakeven point thực tế:** với Anthropic Claude 3.5 Sonnet, nếu bạn gửi 50,000 token context, cache write $0.30, cache read $0.03. Bạn hòa vốn sau **2 lần gọi**, tiết kiệm ròng từ lần thứ 3 trở đi.

## Cách Setup Trên Anthropic Claude (Messages API)

Anthropic là nền tảng có hỗ trợ prompt caching mạnh nhất hiện tại, với control chi tiết qua thuộc tính `cache_control`.

**Nguyên tắc:** đánh dấu breakpoint cuối mỗi khối muốn cache bằng `{"type": "ephemeral", "cache_control": {...}}`.

**Code mẫu (Python):**

```python
import anthropic

client = anthropic.Anthropic(api_key="...")
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "Bạn là chuyên gia tư vấn kỹ thuật AI..."
        },
        {
            "type": "text",
            "text": "[50,000 token knowledge base ở đây]",
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[
        {"role": "user", "content": "Prompt caching hoạt động thế nào?"}
    ]
)

print(response.usage)
# Lần đầu: input_tokens=50500, cache_creation_input_tokens=50000
# Lần 2-N: input_tokens=500, cache_read_input_tokens=50000
```

**Lưu ý:**

- Chỉ **4 breakpoint cache** tối đa/request.
- Phần cache phải **≥1024 token** (dưới đó không cache được).
- Cache chỉ giữ **5 phút** kể từ lần dùng cuối.

Chi tiết đầy đủ: [Anthropic Docs - Prompt Caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

## Cách Setup Trên OpenAI (Prompt Caching Tự Động)

OpenAI không yêu cầu bạn đánh dấu thủ công — nó tự cache **tiền tố giống nhau** của messages array nếu ≥1024 token.

**Code mẫu (Python):**

```python
from openai import OpenAI
client = OpenAI(api_key="...")

completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "[50k token knowledge base]"},
        {"role": "user", "content": "Hướng dẫn tôi dùng prompt caching"}
    ]
)

print(completion.usage)
# cached_tokens sẽ > 0 từ lần gọi thứ 2 nếu prefix khớp
```

**Hạn chế:** bạn không kiểm soát được breakpoint, và OpenAI **không công khai cache TTL** (ước tính 5–10 phút dựa trên quan sát).

Tham khảo: [OpenAI Docs - Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching)

## Cách Setup Trên Google AI Studio (Context Caching API)

Google có API riêng để tạo cached content trước, sau đó tái sử dụng qua `cachedContent` name.

**Workflow:**

1. Tạo cache với `cachedContents.create` (POST) — trả về `name` (ID).
2. Gọi `generateContent` với tham số `cachedContent=<name>`.
3. Cache sống 1 giờ (có thể gia hạn lên 24h bằng `ttl` parameter).

**Code mẫu (Python):**

```python
import google.generativeai as genai

genai.configure(api_key="...")

# Bước 1: tạo cache
cache = genai.caching.CachedContent.create(
    model="gemini-1.5-flash-001",
    system_instruction="Bạn là chuyên gia AI...",
    contents=["[50k token knowledge base]"],
    ttl="3600s"
)

# Bước 2: dùng cache
model = genai.GenerativeModel.from_cached_content(cache)
response = model.generate_content("Prompt caching hoạt động ra sao?")

print(response.usage_metadata)
# cached_content_token_count sẽ hiện số token đã cache
```

Google cho phép cache lên tới **1 triệu token** (lớn nhất trong 3 nhà) và giữ lâu hơn, nhưng setup phức tạp hơn.

Chi tiết: [Google AI - Context Caching](https://ai.google.dev/gemini-api/docs/caching)

## Case Study Thực Tế: Chatbot Support Với 100k Token Docs

**Bối cảnh:** Một startup SaaS cần chatbot trả lời câu hỏi từ 100,000 token documentation. Trung bình 10,000 request/tháng.

**Không có caching:**

- Claude 3.5 Sonnet input: $3/MTok
- 100k token × 10k request = 1 tỷ token input
- Chi phí: **$3,000/tháng**

**Có caching (cache hit rate 95%):**

- Lần đầu (500 request): 100k × 500 × $3/MTok = $150
- 9,500 lần sau: 100k × 9,500 × $0.30/MTok = $285
- User query trung bình 100 token × 10k = 1M token × $3 = $3
- Tổng: **~$438/tháng** (giảm **85%**)

Cache hit rate thực tế phụ thuộc vào phân bố request — nếu user quay lại trong 5 phút, hit rate cao; nếu thưa, thấp hơn.

## Những Sai Lầm Thường Gặp Khi Dùng Prompt Caching

1. **Đặt phần động lên đầu:** ví dụ timestamp `[2026-10-18 14:32]` ở đầu system prompt → mỗi phút cache miss. Giải pháp: bỏ timestamp, hoặc để xuống cuối.

2. **Không đủ 1024 token tối thiểu:** Anthropic/OpenAI yêu cầu ≥1024 token mới cache. Phần context 500 token không được cache, bạn vẫn trả đầy đủ.

3. **Quên rằng cache hết hạn sau 5 phút:** nếu traffic thưa (1 request/10 phút), bạn không tiết kiệm gì. Cân nhắc batch request hoặc dùng Google (TTL dài hơn).

4. **Thay đổi nhỏ trong system prompt làm vỡ cache:** sửa 1 từ trong knowledge base → cache rebuild toàn bộ. Version prompt cẩn thận.

5. **Không track cache hit rate:** mù quáng tin là đang tiết kiệm, nhưng thực tế hit rate 20% do cấu trúc prompt sai. Monitor `cache_read_input_tokens` (Anthropic) để biết.

## So Sánh Chi Phí Prompt Caching Giữa Các Nhà Cung Cấp

| Provider | Cache Write | Cache Read | Cache TTL | Min Tokens | Max Cache Size |
|----------|------------|-----------|-----------|------------|----------------|
| **Anthropic Claude** | 100% input | ~10% input | 5 phút | 1024 | ~200k (model-dependent) |
| **OpenAI GPT-4/4o** | 100% input | 50% input | Không công khai | 1024 | Không công khai |
| **Google Gemini** | 100% input | 25% input | 1h (gia hạn 24h) | Không rõ | 1M token |

**Nhận xét:**

- **Anthropic** rẻ nhất cho cache read (10% so với 50% OpenAI), tốt nhất cho high-traffic app.
- **Google** cache lâu nhất + lớn nhất, phù hợp với low-traffic nhưng context cực dài (vd: tra cứu sách 500k token).
- **OpenAI** tiện nhất (tự động), nhưng đắt hơn và không kiểm soát breakpoint.

Lựa chọn tùy use case: traffic cao + context vừa → Anthropic; context khổng lồ + traffic thấp → Google.

## Kết Hợp Prompt Caching Với Semantic Caching Để Tối Ưu Hơn

Prompt caching chỉ giúp khi context giống **tuyệt đối**. Nếu user hỏi "Prompt caching là gì?" và "Caching prompt hoạt động thế nào?" — hai câu khác nhau → 2 lần tính toán riêng.

[Semantic caching](/blog/semantic-caching-trong-llm/) giải quyết vấn đề này bằng cách lưu **cặp (embedding câu hỏi, output)** vào vector database. Nếu câu hỏi mới có embedding similarity >0.95 với câu cũ, trả kết quả cũ luôn — **0 cost API**.

**Strategy kết hợp:**

1. **Layer 1 — Semantic cache (Redis + embeddings)**: kiểm tra xem câu hỏi đã được trả lời chưa. Hit → return ngay (0 cost).
2. **Layer 2 — Prompt caching**: nếu miss, gọi LLM với cached context (giảm 90% cost input).
3. **Layer 3 — Full API call**: nếu cache hết hạn hoặc context mới.

Kết hợp 2 layer này có thể giảm cost **95–99%** cho chatbot production. Chi tiết về semantic caching, xem [bài chuyên sâu tại đây](/blog/semantic-caching-trong-llm/).

## Công Cụ và Thư Viện Hỗ Trợ Prompt Caching

**1. LangChain (Python/JS):**

LangChain hỗ trợ prompt caching tự động khi dùng Anthropic provider:

```python
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    enable_prompt_caching=True
)
```

**2. LiteLLM (proxy đa provider):**

LiteLLM cho phép bật caching trên nhiều provider cùng lúc, với fallback tự động:

```python
from litellm import completion

response = completion(
    model="claude-3-5-sonnet-20241022",
    messages=[...],
    caching=True
)
```

**3. Helicone (monitoring):**

Helicone tracking cả cache hit rate và cost breakdown — giúp debug khi cache không hoạt động như mong đợi. Tích hợp 1 dòng header `Helicone-Auth`.

**4. Custom solution với Redis:**

Nếu bạn muốn kiểm soát hoàn toàn, có thể tự implement: hash system prompt → lưu vào Redis với TTL 5 phút → check trước khi gọi API. Nhưng provider caching đã tối ưu hardware (KV cache trên GPU RAM), tự làm thường chậm hơn.

## Tương Lai Của Prompt Caching: Persistent Cache và Cross-User Sharing?

Hiện tại prompt caching chỉ là **ephemeral** (5 phút – 1 giờ). Nhiều nhà cung cấp đang nghiên cứu **persistent cache** (lưu vài ngày/tuần) và **cross-user cache sharing** (nhiều user dùng chung một knowledge base → cache dùng chung).

Anthropic đã thử nghiệm tính năng "preload public knowledge" — cache sẵn Wikipedia/arxiv trên server, mọi user dùng miễn phí phần đó. Nếu triển khai rộng, chi phí RAG app có thể giảm thêm **10–50 lần**.

Một hướng khác là **model-level caching**: thay vì cache theo user, cache theo model weights — nếu 10,000 user đều hỏi về Python documentation, model cache phần "hiểu Python docs" một lần, tái dùng cho mọi người. Nhưng vẫn còn nhiều thách thức về privacy và correctness.

Theo dõi blog này hoặc [AI Gateway model router](/blog/ai-gateway-model-router-quan-ly-llm-2026/) để cập nhật khi các tính năng này ra mắt.

## Kết Luận: Khi Nào Bạn Nên Triển Khai Prompt Caching?

Prompt caching **không phải silver bullet** — nó chỉ hiệu quả khi bạn có context lặp lại nhiều lần. Nếu mỗi request đều có context khác nhau (ví dụ: tóm tắt email cá nhân), bạn không tiết kiệm được gì.

**Checklist quyết định:**

- [ ] Context ≥10,000 token
- [ ] Số request ≥100/ngày
- [ ] Phần context lặp lại chiếm ≥70% tổng input
- [ ] Có khả năng cấu trúc prompt: static lên đầu, dynamic xuống cuối

Nếu đánh dấu ít nhất 3/4 → triển khai ngay, ROI rõ ràng trong tháng đầu.

Nếu không → ưu tiên [semantic caching](/blog/semantic-caching-trong-llm/) trước (dễ implement hơn, hiệu quả với mọi dạng query), sau đó quay lại prompt caching khi scale lớn.

**Đọc thêm:**

- [Semantic Caching Trong LLM: Tiết Kiệm 90% Chi Phí API AI](/blog/semantic-caching-trong-llm/) — layer cache bổ sung, bắt cả câu hỏi tương tự, không cần context giống tuyệt đối.
- [AI Gateway & Model Router: Quản Lý Nhiều LLM Thông Minh 2026](/blog/ai-gateway-model-router-quan-ly-llm-2026/) — setup gateway với fallback, load balancing và cache layer tập trung cho nhiều model.
- [AI Model Serving & Deployment: Đưa AI Vào Production 2026](/blog/ai-model-serving-deployment-production-2026/) — cách triển khai LLM production với monitoring cost, latency và quality, bao gồm cả caching strategy.
