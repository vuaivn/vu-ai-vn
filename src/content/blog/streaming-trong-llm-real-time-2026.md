---
title: "Streaming Trong LLM: Tăng Tốc Trải Nghiệm AI Real-time 2026"
description: "Token-by-token streaming biến trải nghiệm AI từ chờ đợi nhàm chán thành tương tác sống động. Hiểu rõ cơ chế, lợi ích và cách triển khai streaming cho ứng dụng LLM của bạn."
pubDate: 2026-09-08
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-streaming-trong-llm-real-time-2026.webp"
draft: false
---

**Streaming trong LLM là kỹ thuật trả kết quả từng token ngay khi model tạo ra, thay vì đợi toàn bộ câu trả lời hoàn thành. Người dùng thấy text xuất hiện dần như đang được gõ — trải nghiệm nhanh hơn 70-80% so với chờ response đầy đủ, đặc biệt quan trọng với câu trả lời dài 500+ từ.**

Hỏi ChatGPT một câu dài, rồi nhìn con xoay loading quay mãi. 10 giây sau — bùm — cả đoạn 300 từ hiện ra như ai đó vừa paste. 

Streaming khác hẳn. Chữ nhảy ra từng chữ. Bạn đọc được câu đầu trong khi model đang viết câu thứ hai. Không phải "chờ xong mới thấy". Mà là "thấy ngay, đọc luôn".

## Streaming trong LLM hoạt động như thế nào?

LLM sinh text theo từng **token** (đơn vị nhỏ nhất — thường là từ/âm tiết hoặc thậm chí ký tự). Quá trình này gọi là **autoregressive generation**: model dự đoán token tiếp theo dựa trên tất cả token đã sinh trước đó, rồi lặp lại cho đến khi gặp điều kiện dừng (end-of-sequence token, giới hạn độ dài, hoặc dấu câu đóng).

**Không streaming (buffered)**: model sinh hết 200 token. Gom lại. Gửi về client một phát. Người dùng ngồi nhìn màn hình trắng 8 giây, rồi "bùm" — cả đoạn văn hiện ra.

**Có streaming**: token vừa sinh xong, server đẩy luôn xuống HTTP (qua Server-Sent Events hoặc chunked transfer). 20-50ms một token. Client nhận, append vào UI. Chữ xuất hiện dần như đang gõ.

Cơ chế này không thay đổi cách model suy nghĩ — nó vẫn sinh từng token tuần tự như cũ. Sự khác biệt nằm ở **thời điểm truyền tải**: streaming lộ quá trình sinh ra ngoài thay vì giấu nó đến khi xong.

### Server-Sent Events (SSE) vs WebSocket

Hai giao thức phổ biến cho streaming:

- **SSE** (text/event-stream): đơn giản, chỉ cần HTTP. Server gửi các event `data: {...}` liên tục, client lắng nghe. Đủ cho hầu hết use case LLM (ví dụ OpenAI API dùng SSE). Không hỗ trợ binary, chỉ một chiều server → client.
  
- **WebSocket**: kết nối hai chiều, binary-safe, phức tạp hơn nhưng linh hoạt. Dùng khi cần gửi tín hiệu từ client (ví dụ "stop generation" giữa chừng) hoặc khi truyền metadata/binary cùng text.

Trong thực tế, SSE đáp ứng 90% nhu cầu streaming LLM, vì user thường chỉ cần **nhận** output, không cần tương tác giữa chừng.

## Lợi ích thực tế của streaming

### 1. Trải nghiệm người dùng nhanh đến **70-80%**

GPT-4 sinh 500 từ mất khoảng 10 giây. Không streaming? 10 giây nhìn màn hình trắng. Rồi bùm, cả đoạn hiện ra.

Có streaming? Sau 2 giây bạn đã đọc được 4-5 câu đầu. Đọc tiếp trong khi model vẫn viết. **Time-to-first-token (TTFT)** chỉ 200-500ms. App phản hồi tức thì. Không còn cảm giác "đang loading" nữa.

Nghiên cứu UX cho thấy perceived latency giảm đáng kể khi có feedback ngay lập tức, dù tổng thời gian không đổi. Streaming tận dụng hiệu ứng tâm lý này: não người đọc được 50% nội dung trong khi chờ 50% còn lại — cảm giác "nhanh" dù model vẫn chạy hết 10 giây.

### 2. Cho phép dừng sớm

Với streaming, bạn nhìn thấy output đang chạy. Nếu phát hiện model đi sai hướng (hallucination, lặp lại, hoặc câu trả lời không phù hợp), bạn có thể **cancel request** giữa chừng — tiết kiệm token, thời gian, và tiền. Không streaming thì phải đợi đến khi model viết xong mới biết kết quả sai, token đã bị tính đầy đủ.

### 3. Tối ưu nguồn lực backend

Streaming cho phép server giải phóng memory sớm hơn. Thay vì tích lũy cả response trong RAM rồi mới gửi, server gửi từng token và bỏ đi. Với ứng dụng phục vụ hàng nghìn user đồng thời, đây là lợi thế lớn — giảm memory footprint, tăng throughput.

### 4. Chạy pipeline phức tạp song song

Trong các hệ thống **agentic AI** (multi-step reasoning, tool-calling), streaming cho phép hiển thị từng bước suy nghĩ khi nó xảy ra. Ví dụ: model gọi tool → stream kết quả tool → tiếp tục suy luận → stream câu trả lời cuối. User thấy cả quá trình, tăng tính minh bạch và tin tưởng.

## Cách triển khai streaming với các API LLM phổ biến

### OpenAI API (GPT-4, GPT-3.5, o1...)

```python
from openai import OpenAI
client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Giải thích lượng tử"}],
    stream=True  # bật streaming
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

Mỗi `chunk` chứa một token (hoặc vài token). Field `delta.content` là text mới, append vào output tích lũy. `flush=True` đảm bảo terminal/stdout hiển thị ngay.

### Anthropic Claude API

```python
import anthropic
client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Streaming là gì?"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Claude API có helper `text_stream` trích text thuần từ stream events. Cú pháp sạch hơn, tự động xử lý các message events khác (thinking blocks, tool use...).

### Google Gemini API

```python
import google.generativeai as genai
genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel('gemini-pro')

response = model.generate_content("Mô hình AI nào tốt nhất?", stream=True)
for chunk in response:
    print(chunk.text, end="", flush=True)
```

Gemini cũng hỗ trợ `stream=True`. API design đơn giản — mỗi chunk là một phần response text.

### Local LLM (llama.cpp, Ollama)

```bash
# Ollama streaming
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Streaming hoạt động ra sao?",
  "stream": true
}'
```

Ollama trả về JSON lines (newline-delimited JSON). Mỗi dòng là một event, có field `response` chứa token mới. Client parse từng dòng, append `response` vào UI.

## Thách thức khi triển khai streaming

### 1. Error handling phức tạp hơn

Với buffered response, nếu lỗi xảy ra giữa chừng (ví dụ model hallucinate, timeout, quota vượt), server có thể catch error và trả JSON lỗi hoàn chỉnh. Với streaming, một nửa response đã gửi đi — không thể "thu hồi". Khi lỗi xảy ra, client nhận được partial text + thông báo lỗi ở giữa stream.

**Best practice**: gửi metadata ở cuối stream (ví dụ `[DONE]` event) để client biết stream kết thúc bình thường. Nếu stream đứt đột ngột, hiển thị warning "Response bị cắt giữa chừng".

### 2. Khó cache

HTTP cache (CDN, browser cache) hoạt động tốt với response tĩnh. Streaming response thì real-time, unique per request, khó cache. Nếu muốn cache, phải cache ở tầng application: lưu response đầy đủ sau khi stream xong, key theo hash của prompt + params.

**Semantic caching** (ví dụ [Semantic Caching Trong LLM](/blog/semantic-caching-trong-llm/)) có thể giúp: nếu prompt tương tự đã được hỏi, trả kết quả cached (buffered) ngay lập tức thay vì stream mới. Đánh đổi: mất tính "real-time fresh".

### 3. Độ trễ mạng tích lũy

Mỗi token là một HTTP chunk riêng biệt. Nếu latency mạng cao (ví dụ 100ms), việc gửi 200 token sẽ thêm 20 giây overhead (lý thuyết). Thực tế, HTTP/2 multiplexing và buffering giảm bớt vấn đề này, nhưng với kết nối chậm, streaming có thể phản tác dụng — token đến rời rạc, trải nghiệm giật lag.

**Giải pháp**: batching nhẹ ở server — gom 2-3 token trước khi gửi chunk (trade-off giữa real-time và stability). Hoặc fallback sang buffered mode khi phát hiện latency cao.

### 4. Token-by-token UI rendering tốn resource

Với mỗi token, JavaScript phải update DOM. 200 token = 200 lần re-render. Nếu UI phức tạp (markdown parsing, syntax highlighting, LaTeX render...), có thể lag. 

**Tối ưu**: dùng virtual DOM diffing (React, Vue), hoặc append text vào một `<pre>` đơn giản trước, parse markdown sau khi stream xong. Debounce render nếu token đến quá nhanh (ví dụ chỉ render mỗi 50ms thay vì instant).

## Khi nào KHÔNG nên dùng streaming?

- **Response ngắn (<50 từ)**: overhead thiết lập stream không đáng, buffered nhanh hơn.
- **Batch processing**: xử lý 1000 câu hỏi offline, không cần UX real-time.
- **Cần toàn bộ output trước khi tiếp tục**: ví dụ sinh code rồi compile ngay — phải có full code mới chạy được, streaming không giúp gì.
- **Kết nối không ổn định**: mobile 3G, mạng công ty với proxy chặn SSE — streaming dễ bị ngắt giữa chừng, buffered đáng tin hơn.

## Tương lai của streaming: Real-time multimodal

Streaming hiện tại chủ yếu phục vụ **text**. Nhưng các model mới như GPT-4 Vision, Gemini 1.5 đang mở rộng sang **multimodal streaming**:

- **Image generation streaming**: thay vì đợi 30 giây cho ảnh hoàn chỉnh, ảnh được render từ low-res → high-res dần (progressive JPEG on steroids). Midjourney đã thử nghiệm điều này.
  
- **Audio streaming (TTS/STT real-time)**: model voice như [AI Voice & Speech Recognition](/blog/ai-voice-speech-recognition-2026/) đang stream audio chunks ngay khi generate, latency chỉ 100-200ms — gần như đàm thoại tự nhiên.

- **Video generation streaming**: tương lai xa hơn, nhưng concept tương tự — mỗi frame được generate và stream ngay, thay vì đợi cả clip 10 giây render xong.

Streaming từ "kỹ thuật UX" đang trở thành **nền tảng cho real-time AI interaction** — không chỉ nhanh hơn mà còn mở ra các use case mới (live voice assistant, collaborative AI editing...).

## Ví dụ thực tế: Streaming trong production app

**Case study: Perplexity AI** (công cụ tìm kiếm AI):

Khi bạn hỏi Perplexity một câu, bạn thấy:
1. Model stream câu trả lời text ngay lập tức (TTFT ~300ms).
2. Đồng thời, nó gọi tool search → fetch kết quả web → stream citations vào cuối câu trả lời.
3. User đọc được 60% câu trả lời trong khi 40% còn lại + citations đang được tạo.

Nếu không streaming, user phải chờ ~8 giây (inference + search + format) cho cả cục text + citations xuất hiện cùng lúc. Với streaming, cảm giác "instant answer" dù backend vẫn mất 8 giây.

**Kỹ thuật họ dùng**:
- SSE cho text streaming.
- WebSocket cho live citations (vì cần push thêm metadata structure).
- Batching 3-5 tokens/chunk để tránh spam DOM updates.
- Fallback buffered mode nếu stream timeout >15s (degradation thay vì crash).

## FAQ

### Streaming có tốn thêm tiền API không?

Không. Số token generate vẫn như cũ, dù stream hay buffered. Bạn trả tiền theo **completion_tokens** (số token model đã sinh), không phụ thuộc cách truyền tải. Tuy nhiên, nếu bạn cancel stream giữa chừng, chỉ trả tiền cho số token đã sinh — đây là cách **tiết kiệm** nếu phát hiện sai sớm.

### Streaming làm chậm tốc độ tổng thể không?

Không. Tốc độ **sinh token** của model không đổi (ví dụ 30 tokens/giây). Streaming chỉ thay đổi **khi nào user thấy** — họ thấy sớm hơn, nhưng thời điểm "hoàn thành toàn bộ" vẫn y hệt. Thực tế, streaming có thể **nhanh hơn một chút** vì không có bước "accumulate all tokens into memory rồi serialize một lần".

### Có thể resume stream bị ngắt không?

Phụ thuộc API. OpenAI/Claude không hỗ trợ resume native — nếu stream ngắt, phải gọi lại từ đầu. Một số API tự build có thể implement **checkpointing**: gửi `resume_from_token=N` để tiếp tục từ token thứ N, nhưng đây không phải tiêu chuẩn.

**Workaround**: client lưu tất cả token đã nhận, khi ngắt thì hiển thị "Stream bị ngắt, đã lưu X tokens. [Retry]". Retry = gọi API mới, nhưng ít nhất user không mất hết nội dung.

### Streaming ảnh hưởng đến độ chính xác câu trả lời không?

Không. Model sinh text theo cùng một thuật toán (autoregressive sampling) dù stream hay buffered. Streaming chỉ là **cách truyền tải**, không thay đổi quá trình inference. Tuy nhiên, user có thể **ngắt sớm** nếu thấy câu trả lời sai → gián tiếp cải thiện "chất lượng output thực tế dùng" (vì câu trả lời tệ bị cancel trước khi lãng phí thêm token).

### Làm sao biết khi nào stream kết thúc?

Các API gửi một event đặc biệt:
- OpenAI: chunk cuối có `finish_reason` (ví dụ `"stop"`, `"length"`).
- Claude: `message_stop` event.
- Gemini: chunk cuối có `done: true`.

Client lắng nghe event này để biết "đã xong, không còn token nào nữa". Nếu stream đứt giữa chừng (network error), sẽ **không** có event này → client nên timeout sau 30-60s không nhận gì.

## Đọc thêm

- [Multimodal AI: Khi AI Hiểu Cả Text, Hình Ảnh và Giọng Nói](/blog/multimodal-ai-text-hinh-anh-giong-noi/) — streaming không chỉ cho text, mà sắp áp dụng cho image/audio/video.
- [Function Calling & Tool Use: Khi AI Biết Gọi API](/blog/function-calling-tool-use-ai/) — streaming + tool calling = hiển thị từng bước suy luận real-time trong agentic workflows.
- [AI Observability: Giám Sát & Debug AI Model Trong Production](/blog/ai-observability-giam-sat-debug-production/) — monitor latency, TTFT, token throughput khi deploy streaming LLM.
