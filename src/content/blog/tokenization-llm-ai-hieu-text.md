---
title: "Tokenization Trong LLM: Cách AI Hiểu Text Từng Mảnh Nhỏ"
description: "Tokenization là bước đầu tiên để AI hiểu ngôn ngữ tự nhiên. Tìm hiểu cách LLM phân tích text thành token, tại sao nó quan trọng, và ảnh hưởng đến chi phí API."
pubDate: 2026-09-19T20:00:00Z
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-tokenization-llm-ai-hieu-text.webp"
draft: false
---

**Tokenization là bước đầu tiên để AI hiểu văn bản.** Mỗi lần bạn gửi câu hỏi cho ChatGPT, Claude hay Gemini, model không "đọc" từng chữ cái hay từng từ như người. Nó tách văn bản thành những mảnh nhỏ gọi là **token**, rồi mới xử lý.

Tokenization ảnh hưởng thẳng đến **chi phí API** (bạn trả tiền theo token), **giới hạn context window**, và **chất lượng output**. Hiểu nó giúp bạn viết prompt hiệu quả hơn, tối ưu chi phí, tránh lỗi khó hiểu.

## Tokenization Là Gì?

Tokenization là quá trình **phân tách văn bản thành các đơn vị nhỏ hơn** (token) mà model AI có thể xử lý. Một token có thể là:

- **Một từ** (`"AI"`, `"model"`)
- **Một phần của từ** (`"running"` → `"run"` + `"ning"`)
- **Một ký tự đặc biệt** (dấu câu, khoảng trắng, emoji)
- **Một cụm ký tự phổ biến** (`"ing"`, `"tion"`)

Ví dụ, câu `"Tokenization là gì?"` có thể được tách thành:

```
["Token", "ization", " là", " gì", "?"]
```

Số lượng token phụ thuộc vào **tokenizer** mà model sử dụng. GPT-4 dùng tokenizer khác với Claude hay Gemini, nên cùng một câu có thể tạo ra số token khác nhau.

## Tại Sao Không Dùng Từng Chữ Cái Hay Từng Từ?

**Dùng từng chữ cái?** Model phải xử lý quá nhiều đơn vị. Từ `"tokenization"` sẽ thành 12 ký tự riêng lẻ – tăng độ phức tạp và chi phí tính toán.

**Dùng từng từ?** Model gặp khó với từ mới, từ ghép, từ sai chính tả. Nó không xử lý linh hoạt khi gặp từ chưa từng thấy.

**Token cân bằng giữa hai đầu:** Số lượng đơn vị vừa phải (không quá nhiều như ký tự), khả năng mở rộng tốt (xử lý từ mới bằng cách ghép token con).

## Các Phương Pháp Tokenization Phổ Biến

### 1. Byte Pair Encoding (BPE)

BPE là phương pháp phổ biến nhất, được dùng trong GPT-2, GPT-3, GPT-4.

**Cách hoạt động:**
- Bắt đầu với từng ký tự riêng lẻ
- Tìm cặp ký tự xuất hiện nhiều nhất, ghép chúng thành một token mới
- Lặp lại cho đến khi đạt số lượng token mong muốn

Ví dụ: từ `"running"` có thể thành `["run", "ning"]` vì `"run"` và `"ning"` xuất hiện nhiều trong dữ liệu huấn luyện.

**Ưu điểm:** Linh hoạt với từ mới, tiết kiệm token cho từ phổ biến.

**Nhược điểm:** Từ hiếm hoặc ngôn ngữ ít dữ liệu (như tiếng Việt) bị tách thành nhiều token hơn → tốn chi phí.

### 2. WordPiece

Dùng trong BERT và model của Google.

**Khác BPE:** Thay vì chọn cặp xuất hiện nhiều nhất, WordPiece chọn cặp làm tăng xác suất của corpus nhiều nhất (dựa trên mô hình ngôn ngữ).

### 3. SentencePiece

Dùng trong LLaMA, Gemini và nhiều model hiện đại.

**Đặc điểm:** Xử lý văn bản ở mức byte (không phụ thuộc ngôn ngữ), hỗ trợ tốt cả tiếng Anh, tiếng Việt, tiếng Trung, emoji.

**Ưu điểm:** Đa ngôn ngữ tốt hơn BPE, không cần tiền xử lý phức tạp.

## Tokenization Và Chi Phí API

Hầu hết API LLM tính phí theo **số token**, không phải số từ hay số ký tự.

**Ví dụ thực tế:**

- GPT-4: ~$0.03/1K token input, ~$0.06/1K token output
- Claude Sonnet: ~$0.003/1K token input, ~$0.015/1K token output

Một câu tiếng Anh trung bình: **~1.3 token/từ**  
Một câu tiếng Việt: **~1.5-2 token/từ** (vì ít dữ liệu huấn luyện hơn)

**Mẹo tiết kiệm:**
- Viết prompt gọn, tránh lặp từ
- Dùng từ viết tắt (nếu model hiểu)
- Kiểm tra token count trước khi gửi (OpenAI có công cụ `tiktoken`, Anthropic có `tokenizer`)

## Tokenization Và Context Window

Mỗi model có **giới hạn context window** tính bằng token:

- GPT-4 Turbo: 128K token
- Claude Opus: 200K token
- Gemini 1.5 Pro: 2M token

Nếu input + output vượt quá giới hạn, model sẽ **bỏ phần đầu** hoặc **báo lỗi**.

**Ví dụ thực tế:** Bạn muốn xử lý một file PDF 50 trang. Nếu mỗi trang ~500 token, toàn bộ PDF là ~25K token. Bạn cần model có context window ≥30K (để còn chỗ cho output).

[Prompt engineering](/blog/prompt-engineering-viet-lenh-ai-hieu-ban/) giúp bạn tối ưu cách sử dụng context window — chẳng hạn, chia nhỏ tác vụ thay vì nhồi toàn bộ dữ liệu vào một lần.

## Tokenization Và Đa Ngôn Ngữ

**Vấn đề:** Tokenizer của GPT được huấn luyện chủ yếu trên tiếng Anh. Khi xử lý tiếng Việt, mỗi từ có thể bị tách thành nhiều token hơn.

**Ví dụ:**

```
Tiếng Anh: "Hello world" → 2 token
Tiếng Việt: "Xin chào" → 4-5 token (tùy tokenizer)
```

**Hậu quả:**
- Chi phí API cao hơn
- Context window nhanh đầy hơn
- Tốc độ xử lý chậm hơn

**Giải pháp:**
- Dùng model có tokenizer tốt với tiếng Việt (Gemini, Claude có cải thiện)
- Dùng embedding model riêng cho tiếng Việt nếu làm [RAG](/blog/fine-tuning-vs-rag-khi-nao-dung/)
- Dùng local LLM đã fine-tune cho tiếng Việt

## Tokenization Và Hiệu Suất Model

**Token ảnh hưởng đến chất lượng output:**

1. **Từ hiếm bị tách nhiều:** Model khó "hiểu" từ khi nó bị chia thành 5-6 mảnh nhỏ.
2. **Số token càng nhiều, attention càng phân tán:** Model phải "chú ý" đến nhiều đơn vị hơn → dễ lạc hướng.
3. **Token boundary ảnh hưởng đến ngữ nghĩa:** Nếu một từ quan trọng bị tách sai, model có thể hiểu lầm.

**Ví dụ thực tế:**

```
Input: "I want to tokenize this sentence"
Token tốt: ["I", " want", " to", " token", "ize", " this", " sentence"]
Token xấu: ["I", " w", "ant", " to", " tok", "en", "ize", " th", "is", " sent", "ence"]
```

Token xấu khiến model khó "nhìn thấy" từ `"tokenize"` hay `"sentence"` hoàn chỉnh.

## Làm Thế Nào Để Kiểm Tra Token?

**OpenAI (GPT):**
- Web: [platform.openai.com/tokenizer](https://platform.openai.com/tokenizer)
- Python: `tiktoken` library

```python
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4")
tokens = enc.encode("Tokenization là gì?")
print(len(tokens))  # Số token
```

**Anthropic (Claude):**
- API trả về `usage.input_tokens` và `usage.output_tokens`

**Gemini:**
- API có `countTokens` method

**Mẹo:** Luôn kiểm tra token count trước khi gửi request lớn để tránh bất ngờ về chi phí.

## Tokenization Trong Thực Tế

### Use Case 1: Chatbot Tiếng Việt

Bạn xây chatbot tư vấn khách hàng bằng tiếng Việt. Mỗi câu hỏi trung bình 20 từ, nhưng GPT-4 tokenize thành ~35 token.

**Giải pháp:**
- Dùng Claude hoặc Gemini (tokenizer tốt hơn cho tiếng Việt)
- Cache system prompt để giảm token lặp lại
- Dùng [semantic caching](/blog/semantic-caching-trong-llm/) để tránh gọi API cho câu hỏi tương tự

### Use Case 2: Xử Lý Document Dài

Bạn cần phân tích báo cáo 100 trang. File PDF này khi tokenize ra ~80K token.

**Giải pháp:**
- Dùng model có context window lớn (Claude Opus 200K, Gemini 2M)
- Hoặc chia nhỏ document, dùng [RAG nâng cao](/blog/rag-nang-cao-xay-dung-he-thong-qa-thong-minh/) để truy vấn từng phần
- Map-reduce: tóm tắt từng section, rồi tổng hợp

### Use Case 3: Fine-tuning

Khi fine-tune model, bạn trả phí theo token trong dataset. Nếu tokenizer không tốt với tiếng Việt, chi phí tăng gấp 2-3 lần.

**Giải pháp:**
- Dùng model base đã tối ưu tokenizer cho ngôn ngữ mục tiêu
- Hoặc train tokenizer riêng (chỉ khả thi nếu bạn có infrastructure lớn)

## Token Vs. Ký Tự: Tại Sao Nó Quan Trọng?

"Prompt của tôi chỉ 500 ký tự, sao lại 120 token?"

Sự thật: 1 token ≠ 1 ký tự. Tùy ngôn ngữ và từ vựng:

- Tiếng Anh: ~4 ký tự = 1 token
- Tiếng Việt: ~3 ký tự = 1 token (hoặc ít hơn)
- Code: ~3-4 ký tự = 1 token
- Emoji: 1 emoji = 1-3 token

**Ví dụ thực tế:**

```
"😊" → 1-2 token (tùy tokenizer)
"console.log('hello')" → ~5 token
```

Khi thiết kế prompt, đừng chỉ đếm ký tự. Dùng công cụ token counter để chính xác.

## Tương Lai Của Tokenization

**Multimodal tokenization:** Model như GPT-4 Vision, Gemini không chỉ tokenize text mà còn image, audio. Một ảnh 1024x1024 có thể "tốn" ~1000 token.

**Tokenizer học được (learnable):** Thay vì fix trước, tokenizer có thể được model tự học và điều chỉnh trong quá trình huấn luyện.

**Byte-level models:** Một số model mới (như ByT5) hoạt động trực tiếp ở mức byte, bỏ qua tokenization hoàn toàn. Điều này giúp xử lý đa ngôn ngữ tốt hơn nhưng tăng chi phí tính toán.

**Character-level transformers:** Nghiên cứu đang thử nghiệm model hoạt động ở mức ký tự (không token) nhưng vẫn giữ hiệu suất.

## Kết Luận: Tokenization Là Nền Móng, Không Phải Chi Tiết Kỹ Thuật

Tokenization quyết định:
- **Chi phí** bạn trả cho API
- **Giới hạn** context window bạn có thể dùng
- **Chất lượng** output model tạo ra
- **Tốc độ** xử lý của ứng dụng

Hiểu tokenization giúp bạn:
- Viết prompt tiết kiệm token
- Chọn model phù hợp với ngôn ngữ
- Debug khi model output không như mong đợi
- Tối ưu chi phí khi scale ứng dụng AI

Tokenization không phải thứ bạn cần thao tác trực tiếp hàng ngày, nhưng nó là **nền móng** giúp bạn hiểu cách AI "đọc" và "suy nghĩ". Khi biết model nhìn thấy gì, bạn mới viết được prompt mà model thực sự hiểu.

**Đọc thêm:**

- [Mô Hình Ngôn Ngữ Lớn (LLM) Hoạt Động Thế Nào?](/blog/mo-hinh-ngon-ngu-hoat-dong-the-nao/) — Tìm hiểu cách LLM xử lý token sau khi tokenization.
- [Prompt Engineering: Viết Lệnh Để AI Hiểu Bạn](/blog/prompt-engineering-viet-lenh-ai-hieu-ban/) — Áp dụng hiểu biết về token để viết prompt hiệu quả hơn.
- [Semantic Caching Trong LLM: Tiết Kiệm 90% Chi Phí API AI](/blog/semantic-caching-trong-llm/) — Giảm số lần gọi API (và token tiêu tốn) bằng caching thông minh.
