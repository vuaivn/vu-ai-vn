---
title: "Mô Hình Ngôn Ngữ Lớn (LLM) Hoạt Động Thế Nào?"
description: "Khám phá cách ChatGPT, Claude và các LLM khác xử lý ngôn ngữ — từ kiến trúc Transformer đến quá trình training và inference."
pubDate: 2026-07-27T20:00:00Z
category: cong-nghe
lang: "vi"
cover: /images/posts/hero-mo-hinh-ngon-ngu-hoat-dong-the-nao.webp
draft: false
---

Bạn hỏi ChatGPT một câu hỏi. Vài giây sau, câu trả lời chi tiết hiện ra. Điều gì vừa xảy ra phía sau?

Mô hình ngôn ngữ lớn (Large Language Model - LLM) không phải cơ sở dữ liệu tra cứu. Đây là hệ thống AI học cách hiểu ngôn ngữ từ hàng tỷ văn bản, rồi sinh ra câu trả lời mới — quy trình phức tạp nhưng logic rõ ràng.

Bài này mở hộp đen LLM: từ kiến trúc Transformer mà hầu hết mô hình hiện đại đều dùng, qua quá trình huấn luyện khổng lồ, đến cách chúng sinh ra từng từ một khi bạn nhập prompt.

## LLM Thực Chất Là Gì?

Mô hình ngôn ngữ lớn là một mạng neural nhân tạo được huấn luyện để dự đoán từ tiếp theo trong một chuỗi văn bản. Nghe đơn giản, nhưng khả năng "đoán từ kế tiếp" này — khi được mở rộng lên hàng tỷ tham số và huấn luyện trên hàng nghìn tỷ từ — tạo ra những hành vi thông minh bất ngờ: trả lời câu hỏi, viết code, dịch thuật, sáng tác, thậm chí lập luận nhiều bước.

GPT-4, Claude, Gemini, Llama — tất cả đều là các biến thể của cùng một ý tưởng cốt lõi: học từ văn bản để hiểu ngữ cảnh và sinh văn bản mới có nghĩa.

## Kiến Trúc Transformer Là Nền Tảng

### Tại Sao Không Dùng Mạng Neural Thông Thường?

Trước năm 2017, các mô hình xử lý ngôn ngữ chủ yếu dùng RNN (Recurrent Neural Network) hoặc LSTM — xử lý văn bản tuần tự từ trái sang phải. Vấn đề: chúng quên ngữ cảnh ở đầu câu khi đọc đến cuối, và rất chậm vì không thể song song hóa.

Bài báo **"Attention Is All You Need"** (2017) của Google đã giới thiệu kiến trúc Transformer — thay thế cơ chế tuần tự bằng **self-attention**: mô hình có thể "nhìn" tất cả các từ trong câu đồng thời, xác định từ nào quan trọng với từ nào, bất kể vị trí.

### Self-Attention Hoạt Động Như Thế Nào?

Khi bạn đưa câu "Con mèo ngồi trên chiếc thảm" vào Transformer:

1. **Embedding**: Mỗi từ được chuyển thành vector số (ví dụ: "mèo" → [0.2, -0.5, 0.8, ...]).
2. **Positional Encoding**: Thêm thông tin vị trí để mô hình biết thứ tự từ.
3. **Self-Attention**: Mô hình tính "attention score" — độ liên quan giữa mọi cặp từ. Ví dụ: "con" liên quan mạnh với "mèo", "ngồi" liên quan với "thảm".
4. **Feed-Forward Layers**: Các lớp neural xử lý thêm thông tin đã được "chú ý".
5. **Output**: Vector cuối cùng chứa ngữ nghĩa đầy đủ của câu.

**Kết quả**: Transformer "hiểu" rằng "con mèo" là chủ thể, "ngồi" là hành động, "thảm" là địa điểm — không cần xử lý tuần tự.

## Quá Trình Huấn Luyện LLM

### Bước 1: Pre-training (Huấn Luyện Sơ Bộ)

Đây là bước tốn kém nhất. Mô hình được đưa vào hàng nghìn tỷ từ từ internet — sách, Wikipedia, code, diễn đàn, blog — và học dự đoán từ tiếp theo:

- **Input**: "Con mèo ngồi trên chiếc ___"
- **Mô hình dự đoán**: "thảm" (hoặc "ghế", "tường"...)
- **So sánh với thực tế**, tính sai số, điều chỉnh hàng tỷ tham số.

Lặp lại hàng triệu lần trên nhiều chủ đề → mô hình học được ngữ pháp, kiến thức thế giới, thậm chí logic cơ bản. Đây là lý do GPT-4 biết về lịch sử, khoa học, lập trình mà không cần được lập trình thủ công.

**Chi phí**: Huấn luyện GPT-3 tốn ~$5 triệu USD điện năng và hàng nghìn GPU chạy liên tục.

### Bước 2: Fine-tuning (Tinh Chỉnh)

Sau pre-training, mô hình biết dự đoán từ nhưng chưa biết trả lời câu hỏi theo cách hữu ích. Fine-tuning điều chỉnh mô hình bằng:

1. **Supervised Fine-Tuning (SFT)**: Cho mô hình xem hàng nghìn cặp (câu hỏi → câu trả lời tốt) do con người viết.
2. **RLHF (Reinforcement Learning from Human Feedback)**: Con người đánh giá các câu trả lời của mô hình (tốt/xấu), mô hình học ưu tiên câu trả lời được khen.

**Kết quả**: Mô hình sinh ra văn bản hữu ích, an toàn, dễ hiểu — không phải chỉ dự đoán từ mà thật sự trả lời đúng câu hỏi. [Fine-tuning vs RAG](/blog/fine-tuning-vs-rag-khi-nao-dung/) giải thích khi nào nên tinh chỉnh mô hình và khi nào dùng kiến thức bên ngoài.

## Inference: Sinh Văn Bản Từng Từ Một

Khi bạn gửi prompt cho ChatGPT, quá trình **inference** (suy luận) diễn ra:

1. **Tokenization**: Câu hỏi được cắt thành tokens (từ/từ con). Ví dụ: "LLM hoạt động ra sao?" → ["LLM", "hoạt", "động", "ra", "sao", "?"].
2. **Forward Pass**: Transformer xử lý toàn bộ tokens, tạo ra xác suất cho từ tiếp theo. Ví dụ: "LLM" (60%), "Mô hình" (25%), "Các" (10%)...
3. **Sampling**: Mô hình chọn một từ dựa trên xác suất (có thể chọn từ có xác suất cao nhất, hoặc chọn ngẫu nhiên theo phân phối để đa dạng hơn).
4. **Lặp lại**: Từ vừa chọn được thêm vào prompt ban đầu, lại chạy forward pass để đoán từ kế tiếp — cho đến khi gặp token kết thúc hoặc đủ độ dài.

**Tại sao phải từng từ một?** Vì mô hình được huấn luyện dự đoán **một** từ kế tiếp, không phải cả đoạn. Đây là lý do bạn thấy câu trả lời xuất hiện từ trái sang phải như đang gõ.

## Context Window: Bộ Nhớ Ngắn Hạn Của LLM

Mô hình ngôn ngữ không có "bộ nhớ lâu dài" — mỗi lần bạn nhập prompt mới, nó chỉ nhìn thấy:

- Prompt hiện tại
- Một đoạn lịch sử trò chuyện gần đây (trong giới hạn **context window**)

Ví dụ: GPT-4 Turbo có context window 128K tokens (~300 trang A4). Vượt qua giới hạn này, mô hình "quên" phần đầu cuộc trò chuyện.

**Giải pháp**: [Embeddings và vector database](/blog/embeddings-vector-database-co-ban/) cho phép mô hình truy xuất thông tin liên quan từ kho tài liệu lớn hơn nhiều context window, mở rộng khả năng làm việc với dữ liệu dài.

## Tại Sao LLM Đôi Khi "Sai Sự Thật"?

LLM không tra cứu dữ liệu — chúng sinh văn bản dựa trên **pattern học được từ training data**. Nếu training data thiếu thông tin hoặc sai lệch, mô hình có thể:

- **Hallucination** (ảo giác): Bịa ra thông tin nghe hợp lý nhưng sai. Ví dụ: tạo ra tên sách không tồn tại.
- **Bias** (thiên lệch): Phản ánh định kiến có trong dữ liệu huấn luyện.
- **Lỗi thời**: Mô hình chỉ biết đến thời điểm huấn luyện (ví dụ: GPT-4 cut-off tháng 10/2023 không biết sự kiện 2024).

**Cách giảm thiểu**: Kết hợp LLM với tìm kiếm thời gian thực (như ChatGPT Search), hoặc dùng RAG để cung cấp tài liệu chính xác cho mô hình trước khi trả lời.

## Tham Số, Tốc Độ Và Chi Phí

**Số lượng tham số** (parameters) quyết định khả năng của mô hình:

- GPT-3: 175 tỷ tham số
- GPT-4: ước tính 1-1.7 nghìn tỷ tham số (chưa công bố chính thức)
- Llama 3 (70B): 70 tỷ tham số

Mô hình lớn hơn thường thông minh hơn. Nhưng cũng chậm hơn, tốn tiền hơn. Mỗi lần inference phải tính toán qua hàng tỷ phép nhân — cần GPU/TPU mạnh.

**Xu hướng 2026**: Mô hình nhỏ được fine-tune tốt (như [Llama 3 8B chạy local](/blog/chay-llm-local/)) đang bắt kịp mô hình khổng lồ ở nhiều tác vụ hẹp, giảm chi phí và tăng quyền riêng tư.

## Những Đột Phá Gần Đây

### Chain-of-Thought (Suy Luận Từng Bước)

Thay vì yêu cầu mô hình trả lời ngay, prompt yêu cầu "giải thích từng bước" → mô hình tự sinh ra quá trình lập luận, cải thiện độ chính xác ở bài toán phức tạp.

### Multimodal LLMs

GPT-4V, Gemini, Claude 3.5 có thể xử lý cả ảnh, âm thanh, video — không chỉ text. Chúng dùng cùng kiến trúc Transformer nhưng mở rộng embedding để hiểu cả pixel và waveform.

### Sparse Mixture of Experts (MoE)

Thay vì kích hoạt toàn bộ mô hình, chỉ kích hoạt một phần "chuyên gia" phù hợp với câu hỏi → giảm chi phí inference mà không giảm chất lượng. GPT-4 và Mixtral đều dùng MoE.

## Hạn Chế Và Tương Lai

LLM hiện tại vẫn còn nhiều giới hạn:

- **Không có bộ nhớ dài hạn thật sự**: Mọi phiên chat mới là bắt đầu lại (trừ khi dùng vector DB hoặc context caching).
- **Không tự cập nhật**: Mô hình cần huấn luyện lại hoặc kết hợp công cụ tìm kiếm để biết thông tin mới.
- **Chi phí cao**: Inference mô hình lớn vẫn tốn hàng nghìn GPU.

**Hướng phát triển**: Mô hình nhỏ hơn, nhanh hơn, có khả năng học liên tục (continual learning), và tích hợp sâu với các công cụ bên ngoài ([AI Agent](/blog/ai-agent-la-gi/)) để hành động thay vì chỉ sinh text.

**Đọc thêm:**

- [AI Tạo Sinh (Generative AI): Toàn Cảnh Cho Người Việt 2026](/blog/ai-tao-sinh-generative-ai-toan-canh/) — Bức tranh lớn về AI tạo sinh và vai trò của LLM trong hệ sinh thái này.
- [ChatGPT vs Claude vs Gemini: Chọn Trợ Lý AI Nào?](/blog/chatgpt-claude-gemini-so-sanh/) — So sánh ba LLM hàng đầu để hiểu điểm mạnh và use case phù hợp.
- [Prompt Engineering Cơ Bản](/blog/prompt-engineering-co-ban/) — Cách viết prompt hiệu quả để khai thác tối đa khả năng của LLM.
