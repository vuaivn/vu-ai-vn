---
title: "LLM Routing: Chọn Model Phù Hợp Tự Động Tiết Kiệm 70% Chi Phí"
description: "LLM routing tự động chọn model phù hợp cho từng tác vụ, giảm 70% chi phí mà vẫn giữ chất lượng. Tìm hiểu các chiến lược routing và cách triển khai thực tế."
pubDate: 2026-10-21
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-llm-routing-model-selection-tiet-kiem-chi-phi.webp"
draft: false
---

**LLM routing là gì?** 

Đơn giản thôi: thay vì dùng một model đắt tiền cho mọi tác vụ, bạn để hệ thống tự động chọn model rẻ hơn cho việc đơn giản. Chỉ gọi model đắt khi thật sự cần. 

Kết quả? Giảm chi phí 50-90% mà chất lượng không đổi — đôi khi còn tốt hơn.

Đây không phải lý thuyết. Các công ty như Anthropic, OpenAI, và hàng trăm startup AI đã triển khai routing để tối ưu chi phí production. Bài này hướng dẫn bạn làm tương tự.

## LLM Routing Là Gì?

LLM routing (hay model routing) là kỹ thuật phân luồng request tới các model AI khác nhau dựa trên độ phức tạp của tác vụ. Thay vì gọi GPT-4o cho mọi câu hỏi, bạn để một router quyết định:

- Câu hỏi đơn giản ("Thủ đô Việt Nam là gì?") → model nhỏ, rẻ (GPT-4o-mini, Claude Haiku)
- Câu hỏi phức tạp ("Phân tích chiến lược marketing cho startup SaaS B2B") → model lớn, đắt (Claude Opus, GPT-4o)
- Code generation đơn giản → DeepSeek-Coder
- Reasoning phức tạp → O1-preview

**Tại sao cần routing?** Vì chênh lệch giá giữa các model rất lớn:

- GPT-4o: $2.50/1M input tokens
- GPT-4o-mini: $0.15/1M input tokens (rẻ hơn 16.6 lần)
- Claude Opus: $15/1M input tokens
- Claude Haiku: $0.25/1M input tokens (rẻ hơn 60 lần)

Nếu 70% request của bạn có thể giải quyết bằng model rẻ mà không ảnh hưởng chất lượng, bạn vừa cắt giảm 60-80% hóa đơn API.

## Tại Sao LLM Routing Quan Trọng Năm 2026?

Ba lý do routing giờ là kỹ năng bắt buộc:

**1. Chi phí AI tăng theo quy mô**

Khi ứng dụng của bạn từ vài trăm user lên vài nghìn, hóa đơn LLM API có thể nhảy từ $200/tháng lên $5,000-$20,000. Không routing = bạn trả tiền cho sức mạnh không dùng tới.

**2. Model đa dạng hơn, chuyên biệt hơn**

Năm 2026 không còn chỉ GPT hay Claude. Bạn có DeepSeek cho code, Gemini Flash cho multimodal nhanh, Llama cho self-hosted, Mixtral cho cost-performance cao. Mỗi model tốt ở một lĩnh vực — routing giúp bạn khai thác tối ưu.

**3. User không quan tâm model nào trả lời**

User chỉ quan tâm: câu trả lời đúng, nhanh, và UX mượt. Routing cho phép bạn thỏa mãn cả ba mà không đốt tiền.

Ví dụ thực tế: một chatbot customer support có thể xử lý 80% câu hỏi FAQ bằng GPT-4o-mini ($0.15/1M tokens), chỉ escalate 20% case phức tạp lên Claude Opus ($15/1M). Trung bình chi phí giảm từ $10/1M xuống $3.15/1M — giảm 68.5%.

## Các Chiến Lược LLM Routing Phổ Biến

### 1. Rule-Based Routing (Routing Theo Luật)

Cách đơn giản nhất: định nghĩa luật cứng.

**Ví dụ code (TypeScript):**

```typescript
function routeModel(userMessage: string, context: any) {
  const messageLength = userMessage.split(' ').length;
  
  // Rule 1: Tin nhắn ngắn (<10 từ) → model nhỏ
  if (messageLength < 10) {
    return 'gpt-4o-mini';
  }
  
  // Rule 2: Request có từ khóa "code" → model code
  if (/code|program|script|function/i.test(userMessage)) {
    return 'deepseek-coder';
  }
  
  // Rule 3: Request có "analyze" hoặc "compare" → model lớn
  if (/analyze|compare|evaluate|strategy/i.test(userMessage)) {
    return 'claude-opus-4';
  }
  
  // Default: model trung bình
  return 'gpt-4o';
}
```

**Ưu điểm**: Dễ hiểu, debug được, không tốn chi phí gọi thêm model.

**Nhược điểm**: Cứng nhắc, không học được, dễ bị edge case (một câu ngắn nhưng phức tạp).

**Khi nào dùng**: MVP, ứng dụng nhỏ, hoặc khi bạn đã hiểu rõ pattern request của user.

### 2. Classifier-Based Routing (Routing Bằng Phân Loại)

Dùng một model nhỏ, rẻ làm "classifier" để phân loại request trước khi gọi model chính.

**Workflow**:
1. User gửi request
2. GPT-4o-mini ($0.15/1M) đọc request và phân loại: "simple" / "medium" / "complex"
3. Dựa vào classification, gọi model tương ứng

**Ví dụ prompt cho classifier:**

```
Classify this user request as "simple", "medium", or "complex":

Simple: factual questions, basic definitions, straightforward tasks
Medium: requires explanation, comparison, or moderate reasoning
Complex: requires deep analysis, multi-step reasoning, or expert knowledge

User request: """
{userMessage}
"""

Output JSON: {"complexity": "simple|medium|complex", "reason": "brief reason"}
```

**Chi phí**: Classifier cost (vài cent/1K requests) << tiết kiệm từ routing đúng.

**Khi nào dùng**: Khi request pattern đa dạng, không dự đoán được bằng rule.

### 3. Embedding-Based Routing (Routing Bằng Vector Similarity)

Phức tạp hơn nhưng chính xác: encode request thành embedding, so sánh với các "ví dụ mẫu" đã label trước.

**Workflow**:
1. Chuẩn bị dataset: 50-200 ví dụ request, mỗi cái label "simple"/"medium"/"complex"
2. Embed tất cả bằng `text-embedding-3-small` ($0.02/1M tokens)
3. Khi có request mới:
   - Embed request
   - Tìm top-3 ví dụ gần nhất (cosine similarity)
   - Lấy majority vote của label → chọn model

**Ưu điểm**: Chính xác hơn rule, không cần gọi LLM để classify (nhanh hơn).

**Nhược điểm**: Cần setup embedding database, phức tạp hơn.

**Khi nào dùng**: Production scale, khi bạn có dataset request đủ lớn để huấn luyện.

### 4. Cascade Routing (Thử Model Nhỏ Trước)

Chiến lược bảo thủ: luôn thử model nhỏ trước, nếu không tự tin → gọi model lớn.

**Workflow**:
1. Gọi GPT-4o-mini với request + yêu cầu output confidence score (0-100)
2. Nếu confidence ≥ 80 → dùng kết quả của mini
3. Nếu confidence < 80 → gọi lại với GPT-4o hoặc Claude Opus

**Ví dụ prompt:**

```
Answer this question and rate your confidence (0-100) in your answer.

Question: {userMessage}

Output JSON:
{
  "answer": "your answer",
  "confidence": 85,
  "reason": "why you're confident or not"
}
```

**Khi nào dùng**: Khi bạn muốn an toàn tuyệt đối (healthcare, legal, finance), nhưng vẫn tối ưu chi phí.

**Lưu ý**: Cascade làm tăng latency (gọi 2 lần nếu fail), nhưng trong thực tế chỉ 10-20% request cần escalate.

### 5. Model-as-Router (LLM Tự Chọn Model)

Dùng một LLM làm "trọng tài" quyết định model nào phù hợp nhất.

**Prompt mẫu:**

```
You are a model router. Given a user request, choose the best LLM to handle it:

Models available:
- gpt-4o-mini: fast, cheap, good for simple factual questions
- gpt-4o: balanced, good for most tasks
- claude-opus-4: best for complex analysis, writing, reasoning
- deepseek-coder: specialized for code generation

User request: """
{userMessage}
"""

Output JSON: {"model": "model-name", "reason": "why this model"}
```

**Khi nào dùng**: Khi bạn muốn routing "thông minh" mà không cần maintain rules hay dataset.

## Cách Triển Khai LLM Routing Thực Tế

### Bước 1: Đo Baseline Chi Phí

Trước khi routing, bạn cần biết mình đang trả bao nhiêu và cho cái gì.

**Actions**:
1. Log tất cả LLM calls trong 1-2 tuần: `{request, model, input_tokens, output_tokens, cost}`
2. Tính tổng chi phí theo model
3. Phân loại request thành 3 nhóm: simple (30-50%), medium (30-40%), complex (10-30%)

**Tools**: OpenAI Usage Dashboard, Anthropic Console, hoặc tự log bằng observability tool (LangSmith, Helicone, Langfuse).

### Bước 2: Chọn Chiến Lược Routing

Dựa vào quy mô và pattern:

| Quy mô | Pattern request | Chiến lược đề xuất |
|--------|----------------|-------------------|
| <1K requests/day | Đơn giản, lặp lại | Rule-based |
| 1K-10K/day | Đa dạng | Classifier-based |
| >10K/day | Phức tạp | Embedding-based hoặc Cascade |

### Bước 3: Implement Router

**Ví dụ đầy đủ với Classifier-based (Node.js):**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function classifyRequest(userMessage: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Classify user requests as:
- simple: factual, <2 steps
- medium: explanation, comparison
- complex: analysis, multi-step reasoning

Output JSON: {"complexity": "simple|medium|complex"}`
      },
      { role: 'user', content: userMessage }
    ],
    response_format: { type: 'json_object' }
  });
  
  const classification = JSON.parse(response.choices[0].message.content);
  return classification.complexity;
}

async function routeAndCall(userMessage: string) {
  const complexity = await classifyRequest(userMessage);
  
  const modelMap = {
    simple: 'gpt-4o-mini',
    medium: 'gpt-4o',
    complex: 'claude-opus-4'
  };
  
  const model = modelMap[complexity];
  
  // Gọi model được chọn
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: userMessage }]
  });
  
  return {
    answer: response.choices[0].message.content,
    model_used: model,
    cost_saved: calculateSavings(complexity)
  };
}
```

### Bước 4: A/B Test Và Đo Lường

Routing không có nghĩa là quality trade-off. Bạn cần verify:

**Metrics cần track:**
- **Cost savings**: So sánh chi phí trước/sau routing
- **Quality**: User satisfaction, thumbs up/down rate
- **Latency**: Thời gian phản hồi (routing + model call)
- **Accuracy**: % request được route đúng model

**A/B test setup**:
- Group A: Không routing (dùng GPT-4o cho tất cả)
- Group B: Có routing
- Run 1-2 tuần, so sánh cost và quality

**Target**: Cost giảm 50-70% mà quality không đổi (hoặc tăng nhờ dùng đúng model cho đúng việc).

### Bước 5: Tối Ưu Liên Tục

Routing không phải "set and forget". Theo dõi:

1. **Model mới**: GPT-4o Turbo, Claude 4, Gemini 2.0 ra → test và thêm vào router
2. **Pattern thay đổi**: User behavior thay đổi theo thời gian → retrain classifier
3. **Cost optimization**: Model giá giảm → điều chỉnh routing logic

## Các Công Cụ Hỗ Trợ LLM Routing

### 1. LiteLLM (Open-source Router)

```python
from litellm import Router

model_list = [
  {
    "model_name": "gpt-4o-mini",
    "litellm_params": {
      "model": "gpt-4o-mini",
      "api_key": os.getenv("OPENAI_API_KEY"),
    }
  },
  {
    "model_name": "claude-opus",
    "litellm_params": {
      "model": "claude-opus-4",
      "api_key": os.getenv("ANTHROPIC_API_KEY"),
    }
  }
]

router = Router(model_list=model_list)

# Gọi với routing tự động
response = router.completion(
  model="gpt-4o-mini",  # fallback
  messages=[{"role": "user", "content": "Hello"}]
)
```

**Tính năng**: Load balancing, fallback, retry, cost tracking.

### 2. Portkey (AI Gateway + Router)

SaaS platform với routing dashboard:

- Visual routing rules editor
- Real-time cost tracking
- A/B testing tích hợp
- Automatic fallback khi model down

**Giá**: Free tier 10K requests/month, sau đó $49/month.

### 3. OpenRouter (Model Marketplace + Router)

Truy cập 100+ models qua 1 API, với routing theo giá tự động:

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "openai/gpt-4o-mini",
    "route": "fallback",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**Routing modes**: `fallback` (thử rẻ trước), `lowest-cost`, `lowest-latency`.

### 4. LangChain Router Chain

```python
from langchain.chains.router import MultiPromptChain
from langchain.chains import LLMChain

# Define chains cho từng loại task
simple_chain = LLMChain(llm=GPT4oMini(), prompt=simple_prompt)
complex_chain = LLMChain(llm=ClaudeOpus(), prompt=complex_prompt)

router_chain = MultiPromptChain(
  router_chain=RouterChain(...),
  destination_chains={
    "simple": simple_chain,
    "complex": complex_chain
  }
)

result = router_chain.run("What is the capital of Vietnam?")
```

## Best Practices Cho LLM Routing

### 1. Đừng Over-Optimize Chi Phí

Routing để **giảm chi phí không cần thiết**, không phải cắt giảm tối đa. Nếu một request thật sự cần model lớn, đừng ép vào model nhỏ chỉ để tiết kiệm $0.02.

**Metric quan trọng nhất**: Cost per **satisfied** user, không phải cost tuyệt đối.

### 2. Monitor Quality Rất Kỹ

Set up feedback loop:

```typescript
await logRequest({
  request: userMessage,
  model_used: model,
  cost: calculatedCost,
  user_feedback: null  // Sẽ cập nhật sau
});

// Sau khi user rate (thumbs up/down)
await updateFeedback(requestId, { user_feedback: 'positive' });
```

Nếu routing làm quality giảm >5% → revert hoặc điều chỉnh.

### 3. Cache Aggressively

Kết hợp routing với [semantic caching](/blog/semantic-caching-trong-llm/): request giống nhau không cần gọi model lần 2.

**Impact**: Cache hit 30-40% → tiết kiệm thêm 30-40% trên đã routing.

### 4. Fallback Plan Cho Downtime

Model có thể down. Luôn có plan B:

```typescript
async function callWithFallback(request: string, primaryModel: string) {
  try {
    return await callModel(primaryModel, request);
  } catch (error) {
    if (error.status === 503) {
      // Model down → fallback
      return await callModel('gpt-4o', request);
    }
    throw error;
  }
}
```

### 5. Tính Cả Chi Phí Của Routing

Nếu classifier cost $0.0001/request và tiết kiệm $0.0005/request → net saving $0.0004.

Nhưng nếu classifier cost $0.001 và chỉ tiết kiệm $0.0005 → mất thêm tiền. Đo cả hai.

## Case Study: Startup SaaS Giảm 72% Chi Phí LLM

**Background**: Một nền tảng code review AI với 5,000 users, xử lý 50K code reviews/month.

**Trước routing**:
- Dùng GPT-4o cho tất cả ($2.50/1M input)
- Chi phí: ~$8,500/month

**Sau routing** (classifier-based):
- 60% reviews đơn giản (syntax, style) → GPT-4o-mini ($0.15/1M)
- 30% reviews trung bình (logic, bugs) → GPT-4o ($2.50/1M)
- 10% reviews phức tạp (architecture, security) → Claude Opus ($15/1M)

**Kết quả sau 3 tháng**:
- Chi phí giảm xuống $2,380/month (giảm 72%)
- Quality score tăng 4% (dùng đúng model cho đúng việc)
- Latency giảm 15% (model nhỏ nhanh hơn)

**Bí quyết**: Họ train classifier trên 500 ví dụ review thật, đạt accuracy 89% trong việc phân loại độ phức tạp.

## Sai Lầm Thường Gặp Khi Triển Khai Routing

### 1. Routing Quá Sớm

Nếu bạn chưa có 1,000+ requests/day, đừng vội routing. Optimize khi có data thật.

### 2. Không Đo Baseline

Bạn không thể biết routing có hiệu quả nếu không biết mình đang trả bao nhiêu và cho cái gì.

### 3. Quá Tin Vào Rule

Rule-based routing dễ nhưng brittle. Một user hỏi "Capital?" (1 từ) không có nghĩa câu hỏi đơn giản.

### 4. Bỏ Qua Latency

Classifier thêm 100-300ms. Nếu app của bạn latency-sensitive (chat real-time), cân nhắc embedding-based (instant) thay vì classifier.

### 5. Không A/B Test

Chạy routing 100% ngay từ đầu = risk lớn. A/B test với 10-20% traffic trước, verify quality OK, rồi mới scale.

## Tương Lai Của LLM Routing

Năm 2026-2027, routing sẽ tiến hóa:

1. **Auto-routing**: Model tự biết khi nào nên escalate lên model mạnh hơn (như GPT-4 Turbo với "I need a more capable model for this")
2. **Cross-provider routing**: Tự động chọn giữa OpenAI, Anthropic, Google, DeepSeek dựa vào giá real-time
3. **Domain-specific routers**: Router được train riêng cho healthcare, legal, finance
4. **Budget-aware routing**: Set budget $500/month, router tự điều chỉnh để không vượt

Routing không phải trend tạm thời — nó là kỹ năng cần thiết để scale AI applications bền vững.

## Kết Luận

LLM routing là bước tiến hóa tự nhiên của việc dùng AI trong production. Thay vì "một model cho tất cả", bạn xây một hệ thống thông minh chọn đúng công cụ cho đúng việc.

Bắt đầu đơn giản: log requests 1 tuần, phân loại manual thành 3 nhóm, implement rule-based routing, đo kết quả. Nếu tiết kiệm >50% chi phí mà quality giữ nguyên → scale lên classifier hoặc embedding-based.

Chi phí AI sẽ chỉ tăng theo quy mô. Routing là cách bạn scale **bền vững** mà không đốt tiền.

**Đọc thêm:**

- [AI Gateway & Model Router: Quản Lý Nhiều LLM Thông Minh 2026](/blog/ai-gateway-model-router-quan-ly-llm-2026/) — Các công cụ gateway hỗ trợ routing tự động, load balancing và fallback giữa nhiều LLM providers, giúp bạn triển khai routing production-ready nhanh hơn.
- [Semantic Caching Trong LLM: Tiết Kiệm 90% Chi Phí API AI](/blog/semantic-caching-trong-llm/) — Kết hợp routing với semantic cache để tối ưu kép: chỉ gọi model khi cần (routing) và không gọi lại những gì đã hỏi (cache), đẩy cost savings lên 90%.
- [AI Model Benchmarks: Cách Đo Và So Sánh Chất Lượng LLM 2026](/blog/ai-model-benchmarks-do-chat-luong-llm/) — Để routing hiệu quả, bạn cần hiểu rõ điểm mạnh/yếu của từng model qua các benchmark chuẩn, giúp thiết kế routing rules chính xác hơn.
