---
title: "Function Calling & Tool Use: Khi AI Biết Gọi API và Dùng Công Cụ"
description: "Function calling cho phép AI tương tác với hệ thống bên ngoài, từ gọi API đến điều khiển thiết bị. Tìm hiểu cách hoạt động và ứng dụng thực tế."
pubDate: 2026-08-03
category: cong-nghe
lang: "vi"
cover: /images/posts/hero-function-calling-tool-use-ai.webp
draft: false
---

**Function calling (gọi hàm) là khả năng của các mô hình ngôn ngữ lớn (LLM) để tự động gọi các hàm hoặc API bên ngoài dựa trên ngữ cảnh hội thoại.** Thay vì chỉ trả lời bằng văn bản, AI có thể thực hiện hành động thực tế: lấy dữ liệu từ database, gửi email, đặt lịch, hoặc điều khiển thiết bị IoT. 

Đây là bước tiến quan trọng. AI từ "trò chuyện" trở thành "hành động".

## Function Calling hoạt động như thế nào?

Khi bạn chat với AI hỗ trợ function calling, quy trình diễn ra theo ba bước:

**Bước 1: Định nghĩa công cụ (tool definition)**
Developer cung cấp cho LLM danh sách các hàm có sẵn, mỗi hàm kèm theo:
- Tên hàm (ví dụ: `get_weather`, `send_email`)
- Mô tả chức năng ("Lấy thông tin thời tiết cho một địa điểm")
- Các tham số cần thiết (địa điểm, ngày, đơn vị nhiệt độ...)
- Kiểu dữ liệu trả về

**Bước 2: AI quyết định gọi hàm**
Khi người dùng hỏi "Thời tiết Hà Nội hôm nay thế nào?", LLM:
- Phân tích câu hỏi và nhận ra cần dữ liệu thời tiết
- Chọn hàm phù hợp (`get_weather`)
- Trích xuất tham số từ câu hỏi (địa điểm: "Hà Nội", ngày: hôm nay)
- Trả về lời gọi hàm dạng JSON: `{"function": "get_weather", "parameters": {"location": "Hanoi", "date": "2026-08-03"}}`

**Bước 3: Thực thi và tổng hợp kết quả**
Hệ thống backend:
- Nhận JSON từ LLM, gọi API thời tiết thật
- Trả kết quả về cho LLM
- LLM đọc dữ liệu và tổng hợp thành câu trả lời tự nhiên: "Hà Nội hôm nay nhiệt độ 32°C, có mây, xác suất mưa 20%."

Điểm mạnh chính ở đây: **AI không bịa đặt dữ liệu**. 

Nó gọi nguồn tin cậy rồi mới trả lời. Đó là lý do function calling đáng tin hơn hẳn so với việc để AI "đoán" từ kiến thức cũ.

## So với Prompt thông thường, Function Calling khác gì?

| Khía cạnh | Prompt thông thường | Function Calling |
|-----------|---------------------|------------------|
| **Khả năng** | Chỉ sinh văn bản | Thực hiện hành động thực tế |
| **Dữ liệu** | Dựa trên kiến thức đã train (có thể lỗi thời) | Lấy dữ liệu real-time từ API |
| **Độ tin cậy** | Có thể hallucination (bịa đặt) | Dữ liệu từ nguồn xác thực |
| **Tương tác** | Một chiều (hỏi → đáp) | Hai chiều (AI chủ động gọi công cụ) |

Ví dụ thực tế: bạn hỏi "Giá Bitcoin hiện tại?" 

Prompt thông thường sẽ đoán hoặc nói "Tôi không có dữ liệu real-time". Function calling? Gọi API CoinGecko, lấy giá chính xác ngay lúc đó.

## Ứng dụng thực tế của Function Calling trong đời sống

**1. Trợ lý ảo thông minh**
- Đặt lịch hẹn trên Google Calendar
- Gửi email/tin nhắn tự động
- Điều khiển đèn, điều hòa, thiết bị thông minh

**2. Hệ thống khách hàng tự động**
- Tra cứu đơn hàng từ database
- Xử lý hoàn tiền, đổi trả
- Tạo ticket support

**3. Phân tích dữ liệu & báo cáo**
- Truy vấn SQL database dựa trên câu hỏi tiếng Việt
- Vẽ biểu đồ từ dữ liệu real-time
- Tạo báo cáo tự động

**4. Agent tự động hóa**
Kết hợp nhiều hàm theo chuỗi: "Gửi email tổng kết doanh thu tuần này cho sếp" → AI tự:
1. Gọi hàm `get_revenue_data(last_week)`
2. Gọi hàm `generate_summary(data)`
3. Gọi hàm `send_email(recipient, subject, body)`

Các [AI Agent](/blog/embeddings-vector-database-co-ban/) hiện đại dựa vào function calling để tự động hóa quy trình phức tạp mà không cần lập trình thủ công từng bước.

## Những giới hạn cần biết khi dùng Function Calling

**Chi phí tăng**
Mỗi lần gọi hàm = thêm 1–2 lượt API với LLM. Nếu một task cần 5 hàm, bạn mất 5× chi phí so với chỉ chat thường.

**Độ trễ cao hơn**
Mỗi hàm mất thêm 1–3 giây (gọi API → xử lý → trả kết quả). Với chuỗi hàm dài, người dùng phải đợi lâu.

**Yêu cầu kiến trúc phức tạp**
Bạn cần:
- Backend xử lý JSON từ LLM
- API endpoints ổn định
- Error handling (nếu hàm fail, AI phải biết cách xử lý)

**Rủi ro bảo mật**
AI có thể gọi sai hàm hoặc với tham số không an toàn. Ví dụ: user hỏi "Xóa tất cả user" → nếu không có kiểm soát, hệ thống có thể thực thi lệnh nguy hiểm.

**Giải pháp**: luôn có whitelist hàm cho phép. Validate tham số. Yêu cầu xác nhận với thao tác nhạy cảm.

Ba lớp bảo vệ này không thừa.

## Các mô hình AI nào hỗ trợ Function Calling?

**OpenAI (ChatGPT)**
- GPT-4, GPT-4 Turbo, GPT-3.5 Turbo đều hỗ trợ
- API: `tools` parameter với `type: "function"`
- Hỗ trợ parallel function calls (gọi nhiều hàm cùng lúc)

**Anthropic (Claude)**
- Claude 3 Opus, Sonnet, Haiku đều hỗ trợ tool use
- Thiết kế an toàn hơn: Claude luôn giải thích tại sao gọi hàm đó
- API: `tools` array trong request

**Google (Gemini)**
- Gemini 1.5 Pro, Flash hỗ trợ function calling
- Tích hợp tốt với Google Workspace (Calendar, Gmail, Drive)

**Các mô hình local**
- Llama 3.1+ (Meta) hỗ trợ tool use
- Mistral-Large
- Cần fine-tuning để đạt độ chính xác cao như GPT-4

So sánh chi tiết các mô hình AI có thể xem tại bài [ChatGPT vs Claude vs Gemini](/blog/chatgpt-claude-gemini-so-sanh/).

## Làm sao để tích hợp Function Calling vào ứng dụng?

**Bước 1: Chọn provider hỗ trợ**
OpenAI, Anthropic, hoặc Google. Nếu cần tự host, dùng Llama 3.1+ với LangChain.

**Bước 2: Định nghĩa các hàm**
Ví dụ với OpenAI API:

```javascript
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Lấy thông tin thời tiết cho một địa điểm",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "Tên thành phố, ví dụ: Hà Nội"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"]
          }
        },
        required: ["location"]
      }
    }
  }
];
```

**Bước 3: Gửi request với tools**
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{role: "user", content: "Thời tiết Hà Nội thế nào?"}],
  tools: tools
});
```

**Bước 4: Xử lý tool calls**
Nếu AI quyết định gọi hàm, response sẽ chứa `tool_calls`. Bạn lấy tham số, gọi hàm thật của mình, rồi gửi kết quả lại cho AI để nó tổng hợp trả lời.

Với những ứng dụng phức tạp hơn, bạn có thể kết hợp với [RAG (Retrieval Augmented Generation)](/blog/fine-tuning-vs-rag-khi-nao-dung/) để AI vừa tìm kiếm knowledge base, vừa gọi hàm hành động.

## Function Calling sẽ phát triển ra sao trong tương lai?

**Xu hướng 1: Multi-step reasoning**
AI sẽ tự lập kế hoạch chuỗi hàm phức tạp. Ví dụ: "Tìm 3 khách sạn rẻ nhất ở Đà Nẵng, so sánh review, rồi đặt phòng cái tốt nhất" → AI tự chia thành 4–5 bước và thực thi.

**Xu hướng 2: Tool discovery tự động**
Thay vì dev định nghĩa trước, AI sẽ tự khám phá API từ OpenAPI spec hoặc tài liệu, rồi học cách dùng.

**Xu hướng 3: Function calling trên thiết bị (on-device)**
Với Llama, Mistral chạy local, smartphone/laptop có thể tự gọi hàm mà không cần gửi data lên cloud → bảo mật và độ trễ thấp hơn.

**Xu hướng 4: Chuẩn hóa protocol**
Hiện mỗi provider có format riêng. Tương lai có thể có chuẩn chung (như OpenAPI cho REST) để function calling dễ di chuyển giữa các mô hình.

## Kết luận

Function calling biến AI từ "người trả lời" thành "người làm việc". 

Không còn là chatbot chỉ biết nói. Bây giờ là agent tự động, hệ thống tương tác với thế giới thực.

Bạn đang xây dựng sản phẩm AI? Cân nhắc function calling khi:
- Cần dữ liệu real-time (giá cả, thời tiết, stock...)
- Muốn AI thực hiện hành động (gửi email, tạo task, điều khiển thiết bị)
- Xây dựng workflow tự động phức tạp

Chi phí và độ phức tạp cao hơn prompt thường. Nhưng giá trị mang lại xứng đáng nếu bạn cần AI "làm việc" chứ không chỉ "nói chuyện".

**Đọc thêm:**

- [Embeddings & Vector Database: Nền Tảng Của AI Hiểu Ngữ Nghĩa](/blog/embeddings-vector-database-co-ban/) — Hiểu cách AI tìm kiếm và so khớp thông tin ngữ nghĩa, nền tảng kết hợp với function calling để xây agent thông minh.
- [Fine-tuning Hay RAG? Khi Nào Dùng Cái Nào](/blog/fine-tuning-vs-rag-khi-nao-dung/) — So sánh hai phương pháp tùy chỉnh AI, giúp chọn đúng hướng khi function calling cần kết hợp với dữ liệu riêng.
- [Prompt Engineering: Viết Lệnh Để AI Hiểu Bạn](/blog/prompt-engineering-viet-lenh-ai-hieu-ban/) — Kỹ năng viết prompt hiệu quả, cần thiết để AI chọn đúng tool và tham số khi dùng function calling.
