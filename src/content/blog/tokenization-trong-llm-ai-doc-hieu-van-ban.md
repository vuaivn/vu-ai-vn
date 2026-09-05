---
title: "Tokenization Trong LLM: Cách AI Đọc Và Hiểu Văn Bản"
description: "Khám phá cách LLM chia nhỏ văn bản thành token, tại sao nó ảnh hưởng đến chi phí API và hiệu suất, cùng cách tối ưu prompt hiệu quả hơn."
pubDate: 2026-09-03
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-tokenization-trong-llm-ai-doc-hieu-van-ban-v2.webp"
draft: true
---

**Tokenization là quá trình LLM chia văn bản thành các đơn vị nhỏ hơn gọi là token để xử lý. Mỗi từ, ký tự hoặc cụm từ có thể là một hoặc nhiều token — điều này ảnh hưởng trực tiếp đến chi phí API, giới hạn context window và hiệu suất của AI.**

Nếu bạn từng thắc mắc tại sao ChatGPT "đếm chữ" khác con người, tại sao một prompt dài lại tốn kém hơn, hoặc tại sao tiếng Việt đôi khi khiến AI "hiểu chậm" hơn tiếng Anh — câu trả lời nằm ở tokenization.

## Tokenization là gì và tại sao nó quan trọng?

Tokenization là bước đầu tiên mà mọi Large Language Model (LLM) thực hiện khi nhận văn bản đầu vào. Thay vì đọc từng chữ cái riêng lẻ, LLM chia văn bản thành các "token" — những đơn vị có ý nghĩa nhỏ nhất mà model được huấn luyện để hiểu.

**Ví dụ thực tế:**

- Câu tiếng Anh: `"Hello world"` → 2 tokens (`Hello`, `world`)
- Câu tiếng Việt: `"Xin chào thế giới"` → 8-12 tokens (tùy tokenizer)
- Từ ghép: `"ChatGPT"` → 2 tokens (`Chat`, `GPT`)
- Ký tự đặc biệt: `"🚀"` → 1-3 tokens

Sự khác biệt này không phải ngẫu nhiên. LLM được huấn luyện trên hàng tỷ token từ dữ liệu chủ yếu bằng tiếng Anh, nên tokenizer được tối ưu cho ngôn ngữ đó. Với tiếng Việt, mỗi từ thường bị chia nhỏ thành nhiều token hơn, dẫn đến:

- **Chi phí cao hơn**: Bạn trả phí theo token, không phải theo từ.
- **Context window hẹp hơn**: Nếu GPT-4 cho phép 8,000 tokens, một đoạn văn tiếng Việt sẽ chiếm nhiều "chỗ" hơn cùng nội dung bằng tiếng Anh.
- **Tốc độ chậm hơn**: Model phải xử lý nhiều token hơn cho cùng một ý.

Hiểu tokenization giúp bạn viết prompt hiệu quả hơn, tối ưu chi phí và tránh các lỗi "vượt giới hạn token" khi làm việc với LLM.

## Cách LLM chia văn bản thành token

Hầu hết LLM hiện đại sử dụng một trong hai phương pháp tokenization chính: **Byte-Pair Encoding (BPE)** hoặc **WordPiece**.

### Byte-Pair Encoding (BPE)

BPE hoạt động bằng cách:

1. Bắt đầu từ các ký tự đơn lẻ.
2. Dần dần hợp nhất các cặp ký tự hoặc token xuất hiện thường xuyên nhất thành token mới.
3. Lặp lại cho đến khi đạt số lượng token mục tiêu (thường 50,000–100,000).

**Ví dụ BPE:**

```
Input: "running"
Bước 1: ['r', 'u', 'n', 'n', 'i', 'n', 'g']
Bước 2: Hợp nhất 'n'+'n' thành 'nn' → ['r', 'u', 'nn', 'i', 'n', 'g']
Bước 3: Hợp nhất 'runn' thành token "runn" → ['runn', 'i', 'n', 'g']
Kết quả: 2 tokens ("runn", "ing")
```

OpenAI (GPT-3, GPT-4) và Meta (LLaMA) đều sử dụng BPE. Tokenizer này linh hoạt với từ mới và ngôn ngữ ít gặp, nhưng có thể tạo token "lạ" với ngôn ngữ không phải tiếng Anh.

### WordPiece

Google (BERT, Gemini) sử dụng WordPiece, một biến thể tương tự BPE nhưng ưu tiên các từ con (subword) có khả năng dự đoán cao hơn. Ví dụ, từ "unbelievable" có thể được chia thành `["un", "##believable"]` thay vì `["unbe", "liev", "able"]`.

WordPiece thường hiệu quả hơn với các ngôn ngữ có cấu trúc hình thái phức tạp (tiếng Đức, tiếng Hàn), nhưng ít phổ biến hơn BPE trong các LLM generative.

### Ảnh hưởng đến tiếng Việt

Tiếng Việt là ngôn ngữ đơn lập (mỗi từ là một âm tiết độc lập), nhưng tokenizer BPE và WordPiece được huấn luyện chủ yếu trên tiếng Anh. Kết quả:

- Từ đơn tiếng Việt như "không" thường bị chia thành 2-3 token.
- Dấu thanh và ký tự đặc biệt (ă, â, ơ, ư) tạo thêm token.
- Một câu tiếng Việt 10 từ có thể chiếm 20-30 tokens, trong khi câu tiếng Anh tương đương chỉ 10-15 tokens.

Đây là lý do tại sao nhiều người dùng Việt Nam cảm thấy ChatGPT "tốn phí hơn" khi dùng tiếng Việt so với tiếng Anh — và họ không sai.

## Tại sao tokenization ảnh hưởng đến chi phí và hiệu suất?

### 1. Chi phí API tính theo token, không phải từ

Tất cả các nhà cung cấp LLM (OpenAI, Anthropic, Google) đều tính phí dựa trên số token xử lý, không phải số từ. Ví dụ với GPT-4 (giá tham khảo):

- **Input**: $0.03 / 1,000 tokens
- **Output**: $0.06 / 1,000 tokens

Một prompt tiếng Việt 500 từ có thể chiếm ~1,200 tokens, trong khi cùng nội dung bằng tiếng Anh chỉ ~600 tokens. Bạn sẽ trả gấp đôi chi phí cho cùng một ý tưởng.

### 2. Context window bị giới hạn theo token

Mọi LLM đều có giới hạn context window — số token tối đa nó có thể "nhớ" trong một phiên làm việc. Ví dụ:

- GPT-3.5: 4,096 tokens
- GPT-4: 8,192 / 32,768 tokens (tùy phiên bản)
- Claude 3.5: 200,000 tokens

Nếu bạn dùng tiếng Việt, bạn sẽ "lãng phí" context window nhanh hơn. Một cuộc hội thoại dài 10 tin nhắn bằng tiếng Việt có thể chiếm 8,000 tokens, trong khi cùng nội dung bằng tiếng Anh chỉ 4,000 tokens — bạn sẽ bị cắt lịch sử trò chuyện sớm hơn gấp đôi.

### 3. Tốc độ xử lý phụ thuộc vào số token

LLM không sinh ra text "từng từ" — nó sinh ra **từng token**. Nếu một câu trả lời tiếng Việt cần 500 tokens nhưng câu tương tự bằng tiếng Anh chỉ cần 250 tokens, thời gian chờ sẽ gấp đôi.

Đây cũng là lý do tại sao các model "streaming" (trả lời dần dần) cảm thấy "lag" hơn với tiếng Việt — mỗi từ cần nhiều token hơn để sinh ra.

## Làm thế nào để tối ưu tokenization khi dùng LLM?

### 1. Dùng tokenizer để đếm trước khi gửi

Trước khi gửi prompt dài, hãy đếm số token bằng công cụ tokenizer:

- **OpenAI Tokenizer**: [platform.openai.com/tokenizer](https://platform.openai.com/tokenizer)
- **Anthropic Tokenizer**: [console.anthropic.com/tokenizer](https://console.anthropic.com/tokenizer)
- **TikToken (Python)**: Thư viện mã nguồn mở của OpenAI

**Ví dụ Python:**

```python
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")  # GPT-4, GPT-3.5-turbo
tokens = enc.encode("Xin chào thế giới")
print(f"Số token: {len(tokens)}")  # Output: ~8-10
```

Điều này giúp bạn tránh bị từ chối request do vượt giới hạn, và ước tính chi phí trước khi chạy.

### 2. Cân nhắc dùng tiếng Anh cho prompt phức tạp

Nếu bạn làm việc với prompt dài (ví dụ: phân tích tài liệu 50 trang), cân nhắc dùng tiếng Anh để giảm token. Bạn có thể:

- Viết prompt bằng tiếng Anh, yêu cầu trả lời bằng tiếng Việt.
- Tóm tắt nội dung tiếng Việt thành tiếng Anh trước khi gửi (nếu ngữ cảnh cho phép).

Một prompt tiếng Anh 1,000 từ (~1,200 tokens) rẻ hơn đáng kể so với prompt tiếng Việt 1,000 từ (~2,500 tokens).

### 3. Tránh lặp từ và cụm từ dài không cần thiết

Mỗi từ lặp lại đều tính thêm token. Ví dụ:

- **Kém tối ưu**: "Tôi muốn bạn viết một bài blog. Bài blog này nên nói về AI. Bài blog cần dài khoảng 1,000 từ."
- **Tối ưu**: "Viết bài blog 1,000 từ về AI."

Câu thứ hai ngắn hơn 50%, tiết kiệm token và rõ ràng hơn.

### 4. Hiểu rằng không phải mọi ký tự đều là 1 token

Emoji, ký tự đặc biệt và ngôn ngữ không phổ biến thường chiếm nhiều token hơn:

- `🚀` → 1-3 tokens (tùy tokenizer)
- `"Hello"` → 1 token
- `"こんにちは"` (tiếng Nhật) → 3-5 tokens
- `"नमस्ते"` (tiếng Hindi) → 4-7 tokens

Nếu bạn dùng emoji trong prompt, hãy đếm token trước — một dòng emoji có thể chiếm nhiều token bằng cả đoạn văn.

### 5. Dùng context caching cho prompt lặp lại

Một số LLM (như Anthropic Claude) hỗ trợ **context caching** — lưu phần prompt cố định (system message, tài liệu tham khảo) để tái sử dụng mà không tính phí token mỗi lần. Nếu bạn chạy cùng một system message 100 lần, bạn chỉ trả token cho lần đầu.

Chi tiết: [Semantic Caching Trong LLM: Tiết Kiệm 90% Chi Phí API AI](/blog/semantic-caching-trong-llm/)

## Các tokenizer phổ biến và cách chọn đúng

| Model | Tokenizer | Ưu điểm | Nhược điểm |
|-------|-----------|---------|------------|
| GPT-3, GPT-4 | BPE (cl100k_base) | Linh hoạt, hỗ trợ đa ngôn ngữ | Kém hiệu quả với tiếng Việt |
| Claude 3, 3.5 | BPE (tùy chỉnh) | Tối ưu cho đa ngôn ngữ hơn GPT | Vẫn "nặng" với tiếng Việt |
| Gemini | SentencePiece/WordPiece | Tốt với tiếng Nhật, Hàn | Chưa tối ưu cho tiếng Việt |
| LLaMA 2, 3 | BPE | Mã nguồn mở, có thể tùy chỉnh | Yêu cầu huấn luyện lại tokenizer |

Nếu bạn làm việc chủ yếu bằng tiếng Việt, Claude 3.5 thường hiệu quả hơn GPT-4 về mặt token (dựa trên kinh nghiệm thực tế của người dùng Việt Nam), nhưng sự khác biệt không quá lớn.

Với các dự án yêu cầu tối ưu cao (ví dụ: chatbot phục vụ hàng triệu người dùng Việt), bạn có thể cân nhắc fine-tune tokenizer riêng hoặc dùng [Local LLM với tokenizer tùy chỉnh](/blog/local-llm-chay-ai-tren-may-tinh-ca-nhan-2026/).

## Tokenization ảnh hưởng đến embeddings và RAG như thế nào?

Tokenization không chỉ quan trọng với LLM generative — nó còn là nền tảng của **embeddings** và **Retrieval-Augmented Generation (RAG)**.

Khi bạn tạo embedding từ văn bản (ví dụ với OpenAI `text-embedding-3-small`), model trước tiên sẽ tokenize văn bản. Số token ảnh hưởng trực tiếp đến:

- **Chi phí embedding**: Tính theo token, không phải từ.
- **Chất lượng vector**: Tiếng Việt bị chia nhỏ hơn → thông tin ngữ nghĩa bị "rải" trên nhiều token → embedding có thể kém chính xác hơn.

Nếu bạn xây dựng hệ thống RAG cho tiếng Việt, hãy cân nhắc:

- Dùng embedding model hỗ trợ tốt tiếng Việt (ví dụ: `multilingual-e5-large`).
- Tăng kích thước chunk để đảm bảo mỗi đoạn chứa đủ ngữ cảnh.
- Kiểm tra số token trước khi embedding để tránh vượt giới hạn (thường 512-8,192 tokens tùy model).

Chi tiết về embeddings: [Embeddings & Vector Database: Nền Tảng Của AI Hiểu Ngữ Nghĩa](/blog/embeddings-vector-database-co-ban/)

## Những hiểu lầm phổ biến về tokenization

### "1 từ = 1 token"

Sai. Một từ có thể là 1, 2 hoặc nhiều token tùy độ dài và ngôn ngữ. Từ "ChatGPT" là 2 tokens, từ "AI" là 1 token, từ "không" (tiếng Việt) là 2-3 tokens.

### "LLM đếm chữ giống con người"

Không. LLM đếm token, không đếm từ hay ký tự. Nếu bạn yêu cầu "viết 500 từ", LLM sẽ sinh ra ~500 tokens, nhưng số từ thực tế có thể là 300-700 tùy ngôn ngữ.

### "Dùng tiếng Anh luôn rẻ hơn tiếng Việt"

Đúng về mặt token, nhưng không phải lúc nào cũng tối ưu. Nếu ngữ cảnh yêu cầu tiếng Việt (ví dụ: phân tích văn hóa, dịch chuyên ngành), dùng tiếng Anh có thể khiến model hiểu sai và sinh ra output kém chất lượng hơn — lúc đó bạn tốn token để retry.

### "Tokenizer của GPT-4 và GPT-3.5 giống nhau"

Gần đúng. Cả hai dùng `cl100k_base`, nhưng GPT-4 được huấn luyện trên dữ liệu đa dạng hơn nên xử lý token "lạ" (tiếng Việt, emoji, code) tốt hơn. Tuy nhiên số token vẫn tương tự.

## Tokenization trong tương lai: Cải thiện cho đa ngôn ngữ

Các nhà nghiên cứu đang phát triển tokenizer tốt hơn cho ngôn ngữ không phải tiếng Anh:

- **SentencePiece**: Tokenizer của Google (dùng trong Gemini, T5) hỗ trợ tốt hơn tiếng Nhật, Hàn, Trung.
- **XLMR, mBERT**: Model đa ngôn ngữ với tokenizer được huấn luyện cân bằng hơn trên 100+ ngôn ngữ.
- **Character-level tokenization**: Một số model thử nghiệm chia theo ký tự thay vì subword, nhưng tốn context window hơn.

Trong tương lai, LLM có thể chuyển sang tokenization **byte-level** (chia theo byte thô thay vì ký tự Unicode) để xử lý mọi ngôn ngữ công bằng hơn. Meta đã thử nghiệm điều này với **LLaMA 3**.

Tuy nhiên, cho đến khi các model này trở nên phổ biến, người dùng tiếng Việt vẫn nên ý thức về chi phí token cao hơn và tối ưu prompt khi có thể.

## Kết luận: Tokenization là "ngôn ngữ máy" của LLM

Tokenization là cách LLM "đọc" văn bản — không phải theo từ như con người, mà theo các đơn vị subword được tối ưu cho hiệu suất và dữ liệu huấn luyện. Hiểu tokenization giúp bạn:

- **Kiểm soát chi phí**: Đếm token trước khi gửi, tránh lãng phí.
- **Tối ưu prompt**: Viết ngắn gọn, rõ ràng, tránh lặp từ.
- **Hiểu giới hạn**: Context window tính theo token, không phải từ.
- **Lựa chọn ngôn ngữ thông minh**: Biết khi nào dùng tiếng Anh, khi nào dùng tiếng Việt.

Với tiếng Việt, bạn sẽ luôn "trả giá" cao hơn một chút so với tiếng Anh — nhưng hiểu rõ tokenization cho phép bạn giảm thiểu sự chênh lệch đó. Trong các dự án lớn (chatbot, RAG, tự động hóa), việc tối ưu tokenization có thể tiết kiệm hàng nghìn đô la mỗi tháng.

Nếu bạn đang xây dựng ứng dụng AI cho thị trường Việt Nam, tokenization là một trong những kiến thức nền tảng bạn cần nắm vững — không chỉ để tiết kiệm chi phí, mà còn để hiểu rõ hơn cách LLM "suy nghĩ" và tối ưu trải nghiệm người dùng.

**Đọc thêm:**

- [Mô Hình Ngôn Ngữ Lớn (LLM) Hoạt Động Thế Nào?](/blog/mo-hinh-ngon-ngu-hoat-dong-the-nao/) — Tìm hiểu cách LLM xử lý token sau khi tokenization, từ embedding đến attention mechanism và sinh ra output.
- [Prompt Engineering: Viết Lệnh Để AI Hiểu Bạn](/blog/prompt-engineering-viet-lenh-ai-hieu-ban/) — Hiểu tokenization giúp bạn viết prompt ngắn gọn, rõ ràng và tiết kiệm token hơn, đồng thời tăng chất lượng câu trả lời từ AI.
- [Embeddings & Vector Database: Nền Tảng Của AI Hiểu Ngữ Nghĩa](/blog/embeddings-vector-database-co-ban/) — Khám phá cách tokenization ảnh hưởng đến embeddings và hệ thống RAG, đặc biệt quan trọng khi làm việc với tiếng Việt.
