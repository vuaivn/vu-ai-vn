---
title: "Structured Output & JSON Mode: Lập Trình AI Đáng Tin Cậy 2026"
description: "Structured output và JSON mode giúp AI trả lời đúng format 100%, không hallucination JSON. Hướng dẫn chi tiết cho lập trình viên."
pubDate: 2026-09-16
category: cong-nghe
lang: vi
cover: /images/posts/hero-structured-output-json-mode-llm-2026.webp
draft: false
---

**Structured Output & JSON Mode giúp LLM trả về dữ liệu đúng định dạng 100%** — không còn JSON hỏng, không cần retry, không hallucination syntax.

Các nhà cung cấp như OpenAI, Anthropic, Google đều hỗ trợ native. Đây là bước tiến lớn từ "AI trả lời văn bản" sang "AI là API component đáng tin cậy". Nếu bạn từng đau đầu với JSON parse error lúc 3 giờ sáng, tính năng này sẽ là tin vui.

## Structured Output Trong LLM Là Gì?

Structured Output là khả năng của LLM **đảm bảo output tuân thủ 100% một schema định trước** — thường là JSON với các field cụ thể, kiểu dữ liệu xác định, và ràng buộc logic.

Trước đây, developer phải:
1. Viết prompt cầu kỳ yêu cầu AI trả JSON
2. Parse output (thường vỡ vì AI thêm chữ ngoài `{}`)
3. Retry khi JSON invalid
4. Validate từng field (AI có thể bịa key)

Vòng lặp này tốn thời gian, tốn token, và làm code phình to.

**Ví dụ cách cũ (prompt engineering):**

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "Extract product info to JSON: { name, price, category }. Product: iPhone 15 Pro, 999 USD, smartphone"
  }]
});

// Output KHÔNG đảm bảo:
// "Sure! Here's the JSON: { "name": "iPhone 15 Pro", "price": "999 USD", "category": "smartphone" }"
// → parse fail do có chữ "Sure!"
// → price là string "999 USD" thay vì number
```

**Cách mới (structured output):**

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Product: iPhone 15 Pro, 999 USD, smartphone" }],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "product_info",
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "number" },
          category: { type: "string" }
        },
        required: ["name", "price", "category"],
        additionalProperties: false
      }
    }
  }
});

// Output LUÔN đúng:
// { "name": "iPhone 15 Pro", "price": 999, "category": "smartphone" }
// → parse 100%, price là number, không có field thừa
```

Model **guarantee** syntax đúng, type đúng, required fields có đủ.

## JSON Mode Hoạt Động Thế Nào?

JSON Mode là tính năng native ở API layer — **model tự điều chỉnh token generation** để output luôn là valid JSON.

**Cơ chế kỹ thuật:**
- Model dùng **constrained decoding** — mỗi token sinh ra phải theo syntax tree của JSON
- Nếu đang trong string, chỉ cho phép ký tự hợp lệ (escape `"` thành `\"`)
- Nếu đang sau key, bắt buộc có `:` rồi value
- Khi đóng object, không cho phép token nào ngoài `}`

**OpenAI JSON Mode:**

```javascript
response_format: { type: "json_object" }
// → guarantee valid JSON, nhưng KHÔNG ràng buộc schema
```

**OpenAI Structured Output (chặt hơn):**

```javascript
response_format: {
  type: "json_schema",
  json_schema: { ... }
}
// → guarantee đúng schema
```

**Anthropic (Claude 3.5+):**

```javascript
// Dùng tools với input_schema
tools: [{
  name: "extract_product",
  input_schema: {
    type: "object",
    properties: { name: { type: "string" }, ... }
  }
}]
// Claude gọi tool → output là JSON đúng schema
```

**Google (Gemini 1.5+):**

```javascript
generationConfig: {
  responseMimeType: "application/json",
  responseSchema: { ... }
}
```

## Tại Sao Cần Structured Output?

### 1. **Độ tin cậy trong production**

AI trả lời tự do → 5–15% response vỡ JSON (theo kinh nghiệm thực tế). Với traffic lớn, đó là hàng nghìn lỗi/ngày.

Structured output → **0% JSON invalid**. Code không cần try-catch parse, không retry.

### 2. **Giảm latency**

Không cần vòng lặp retry → response nhanh hơn 30–50% (đặc biệt với prompt dài).

### 3. **Tích hợp API/database dễ dàng**

Output đúng type → insert trực tiếp vào database, không cần sanitize thủ công.

```javascript
// Trước: phải validate + convert type
const data = JSON.parse(response);
if (typeof data.price !== 'number') data.price = parseFloat(data.price);

// Sau: dùng luôn
await db.products.insert(response); // price đã là number
```

### 4. **Giảm hallucination trong JSON**

AI không thể bịa field ngoài schema → ít confabulation hơn.

Ví dụ: schema chỉ cho phép `{ name, price, category }` → AI không thể tự thêm `"discount": 20%` khi prompt không đề cập.

## Cách Sử Dụng Structured Output

### OpenAI (gpt-4o, gpt-4o-mini)

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role": "user", "content": "Extract: MacBook Air M3, 1199 USD, laptop"}],
  response_format={
    "type": "json_schema",
    "json_schema": {
      "name": "product",
      "strict": True,  # enforce 100%
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "price": {"type": "number"},
          "category": {"type": "string", "enum": ["smartphone", "laptop", "tablet"]}
        },
        "required": ["name", "price", "category"],
        "additionalProperties": False
      }
    }
  }
)

data = json.loads(response.choices[0].message.content)
# { "name": "MacBook Air M3", "price": 1199, "category": "laptop" }
```

**Lưu ý:**
- `strict: True` bắt buộc từ 2024-08 (trước đó là best-effort)
- `additionalProperties: False` ngăn AI thêm field không khai báo
- `enum` hữu ích cho category/status có giá trị cố định

### Anthropic (Claude 3.5 Sonnet)

```python
import anthropic
client = anthropic.Anthropic()

response = client.messages.create(
  model="claude-3-5-sonnet-20241022",
  max_tokens=1024,
  tools=[{
    "name": "extract_product",
    "description": "Extract product information",
    "input_schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "price": {"type": "number"},
        "category": {"type": "string"}
      },
      "required": ["name", "price", "category"]
    }
  }],
  tool_choice={"type": "tool", "name": "extract_product"},
  messages=[{"role": "user", "content": "Product: iPad Pro 11, 799 USD, tablet"}]
)

# Claude gọi tool → lấy input từ tool_use block
data = response.content[0].input
# { "name": "iPad Pro 11", "price": 799, "category": "tablet" }
```

**Pattern:**
- Dùng `tool_choice` force gọi tool cụ thể
- Output nằm trong `tool_use.input` (không phải `.content`)

### Google Gemini (1.5 Pro/Flash)

```python
import google.generativeai as genai

genai.configure(api_key="...")
model = genai.GenerativeModel("gemini-1.5-flash")

response = model.generate_content(
  "Extract: Galaxy S24, 899 USD, smartphone",
  generation_config={
    "response_mime_type": "application/json",
    "response_schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "price": {"type": "number"},
        "category": {"type": "string"}
      },
      "required": ["name", "price", "category"]
    }
  }
)

data = json.loads(response.text)
# { "name": "Galaxy S24", "price": 899, "category": "smartphone" }
```

## So Sánh JSON Mode vs Prompt Engineering

| Tiêu chí | Prompt Engineering | JSON Mode | Structured Output |
|----------|-------------------|-----------|-------------------|
| **Độ tin cậy** | 85–95% (thường vỡ) | ~98% (valid JSON, sai schema) | 100% (đúng schema) |
| **Retry cần thiết** | Có (5–15% response) | Hiếm (~2%) | Không |
| **Latency** | Cao (do retry) | Trung bình | Thấp nhất |
| **Type safety** | Không (string vs number) | Không | Có |
| **Hallucination** | Cao (AI tự thêm field) | Trung bình | Thấp (schema chặt) |
| **Hỗ trợ model** | Mọi LLM | GPT-4+, Claude 3+, Gemini 1.5+ | GPT-4o+, Claude 3.5+, Gemini 1.5+ |

**Khi nào dùng prompt engineering?**
- Model cũ không hỗ trợ JSON mode (GPT-3.5 turbo, Claude 2)
- Output tự do, không cần schema cứng
- Prototyping nhanh

Thẳng thắn: prompt engineering cho JSON là giải pháp tạm. Năm 2026, nếu model hỗ trợ structured output mà bạn vẫn dùng prompt, bạn đang làm khó mình.

**Khi nào dùng structured output?**
- Production app cần độ tin cậy cao
- Tích hợp database/API
- Output có nhiều field nested/complex

## Best Practices Khi Dùng Structured Output

### 1. **Dùng `enum` cho category/status**

```json
{
  "status": {
    "type": "string",
    "enum": ["pending", "approved", "rejected"]
  }
}
```

→ AI không thể trả `"in_progress"` khi schema không cho phép.

### 2. **Set `additionalProperties: false`**

```json
{
  "type": "object",
  "properties": { "name": {...}, "price": {...} },
  "additionalProperties": false
}
```

→ Ngăn AI thêm field như `"discount"`, `"stock"` khi không khai báo.

### 3. **Dùng `description` để guide AI**

```json
{
  "price": {
    "type": "number",
    "description": "Price in USD, numeric only (no currency symbol)"
  }
}
```

→ AI hiểu rõ hơn field nào cần extract thế nào.

### 4. **Validate schema trước khi deploy**

Dùng tool như [JSON Schema Validator](https://www.jsonschemavalidator.net/) test schema có hợp lệ không.

### 5. **Handle edge case với `anyOf` / `oneOf`**

```json
{
  "price": {
    "oneOf": [
      {"type": "number"},
      {"type": "null"}
    ]
  }
}
```

→ Cho phép `price: null` khi không tìm thấy.

### 6. **Nested object cho data phức tạp**

```json
{
  "type": "object",
  "properties": {
    "product": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "specs": {
          "type": "object",
          "properties": {
            "ram": {"type": "string"},
            "storage": {"type": "string"}
          }
        }
      }
    }
  }
}
```

→ Output: `{ "product": { "name": "...", "specs": { "ram": "16GB", "storage": "512GB" } } }`

### 7. **Monitor token usage**

Structured output tốn thêm ~5–10% token (do schema trong prompt). Với traffic lớn, cân nhắc giữa cost và reliability.

## FAQ — Câu Hỏi Thường Gặp

### Structured output có tốn thêm tiền không?

**Không.** API pricing vẫn tính theo token input/output. Schema trong request tốn vài chục token thêm (thường <100), nhưng tiết kiệm được token retry → tổng thể rẻ hơn.

### Model nào hỗ trợ structured output?

- **OpenAI:** gpt-4o, gpt-4o-mini (từ 2024-08)
- **Anthropic:** Claude 3.5 Sonnet, Claude 3 Opus (qua tools)
- **Google:** Gemini 1.5 Pro, Gemini 1.5 Flash
- **Local:** llama.cpp hỗ trợ JSON grammar (constrained sampling)

GPT-3.5, Claude 2, Gemini 1.0 **không** hỗ trợ (phải dùng prompt engineering).

### Có thể dùng với streaming không?

**Có** (OpenAI, Google). Response vẫn stream từng token, nhưng đảm bảo khi kết thúc là valid JSON.

```javascript
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [...],
  response_format: { type: "json_schema", ... },
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
// Output cuối cùng vẫn đúng schema
```

### Schema phức tạp có bị limit không?

**Có giới hạn.** OpenAI cho phép schema ≤5 levels nested, ≤100 properties tổng. Google Gemini ≤10 levels. Schema quá sâu → model có thể refuse.

**Giải pháp:** Chia nhỏ task — extract từng phần, sau đó merge.

### Structured output có chậm hơn không?

**Không đáng kể.** Constrained decoding thêm ~2–5% overhead, nhưng bù lại bằng việc loại bỏ retry → nhanh hơn tổng thể.

### Có thể dùng cho non-JSON format không?

**Hiện tại không native.** Structured output chỉ support JSON. Nếu cần XML/YAML/CSV, vẫn phải dùng prompt engineering + parse thủ công.

Một số tool như LangChain hỗ trợ convert schema → prompt text cho format khác, nhưng không guarantee syntax.

## Tương Lai Của Structured Output

### 1. **Mở rộng sang format khác**

YAML, TOML, Protobuf có thể được hỗ trợ native trong 1–2 năm tới (theo roadmap của OpenAI).

### 2. **Schema learning**

AI tự infer schema từ ví dụ thay vì dev phải viết JSON Schema thủ công.

```javascript
// Tương lai có thể:
response_format: {
  type: "inferred",
  examples: [
    { name: "iPhone", price: 999, category: "smartphone" },
    { name: "MacBook", price: 1999, category: "laptop" }
  ]
}
```

### 3. **Function calling → structured output merge**

Anthropic và OpenAI đang hợp nhất 2 pattern này — tool/function sẽ chỉ là syntax sugar của structured output.

### 4. **Local model support**

llama.cpp, vLLM, HuggingFace TGI đã support JSON grammar. Năm 2026–2027, mọi local model runner sẽ có tính năng này.

Điều đáng mừng: không cần đợi provider lớn. Kỹ thuật constrained decoding là open — bạn chạy Llama 3 local vẫn có JSON mode.

---

**Kết luận:** Structured Output & JSON Mode là **game changer cho production AI apps**. Code ngắn hơn, ít bug hơn, nhanh hơn.

Nếu bạn đang dùng prompt engineering để parse JSON, đây là lúc upgrade. Một lần thiết lập schema, sau đó quên luôn vấn đề parse error.

**Đọc thêm:**

- [Function Calling & Tool Use: Khi AI Biết Gọi API và Dùng Công Cụ](/blog/function-calling-tool-use-ai/) — Function calling là tiền thân của structured output, cùng pattern đảm bảo format.
- [Prompt Engineering: Viết Lệnh Để AI Hiểu Bạn](/blog/prompt-engineering-viet-lenh-ai-hieu-ban/) — So sánh prompt engineering vs structured output, khi nào dùng cách nào.
- [Hallucination AI: Tại Sao AI Đôi Khi Bịa Chuyện và Cách Phòng Tránh](/blog/hallucination-ai-tai-sao-bia-cach-phong-tranh/) — Structured output giảm hallucination trong JSON, nhưng không loại bỏ hoàn toàn ở content.
