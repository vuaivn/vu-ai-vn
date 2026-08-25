---
title: "Zero-shot & Few-shot Learning: AI Học Với Ít Hoặc Không Cần Dữ Liệu"
description: "Tìm hiểu Zero-shot và Few-shot Learning — kỹ thuật giúp AI thực hiện tác vụ mới mà không cần huấn luyện lại. In-context learning, prompt engineering và ứng dụng thực tế 2026."
pubDate: 2026-08-25T20:00:00.000Z
category: cong-nghe
lang: vi
cover: /images/posts/hero-zero-shot-few-shot-learning-ai.webp
draft: false
---

**Zero-shot và Few-shot Learning là khả năng mô hình AI thực hiện tác vụ mới mà không cần (zero-shot) hoặc chỉ cần vài ví dụ (few-shot) — không phải huấn luyện lại. Đây là bước tiến lớn trong AI thực tiễn: thay vì cần hàng nghìn mẫu huấn luyện cho mỗi tác vụ, ta chỉ cần viết prompt thông minh.**

Nếu bạn đã từng hỏi ChatGPT một câu hỏi hoàn toàn mới mà nó vẫn trả lời được — đó là zero-shot learning đang hoạt động. Nếu bạn đưa cho Claude 3 ví dụ email dịch vụ khách hàng tốt, rồi bảo nó viết email thứ 4 theo phong cách tương tự — đó là few-shot learning.

## Zero-shot Learning Là Gì?

Zero-shot learning là khả năng mô hình AI thực hiện một tác vụ mà nó **chưa từng được huấn luyện trực tiếp** trên tác vụ đó, chỉ dựa vào kiến thức tổng quát đã học được trong quá trình pre-training.

### Cách hoạt động

Mô hình ngôn ngữ lớn (LLM) như GPT-4, Claude, Gemini được huấn luyện trên hàng nghìn tỷ từ — mã nguồn, sách, trang web, hội thoại. Qua quá trình đó, chúng học được:

- **Cấu trúc ngôn ngữ** — ngữ pháp, từ vựng, ngữ nghĩa
- **Tri thức thế giới** — sự kiện, khái niệm, mối quan hệ
- **Mẫu (pattern)** — cách định dạng JSON, cách viết email, cách giải toán

Khi bạn đưa cho mô hình một nhiệm vụ mới (ví dụ: "Phân loại email này là khiếu nại hay hỏi thông tin"), mô hình không cần dữ liệu huấn luyện riêng cho tác vụ phân loại email — nó suy luận từ kiến thức tổng quát đã có.

### Ví dụ thực tế

**Prompt zero-shot:**
```
Phân loại email sau thành một trong các nhóm: Khiếu nại, Hỏi thông tin, Đề xuất hợp tác.

Email: "Chào anh, em muốn biết sản phẩm X có hỗ trợ tích hợp API không ạ?"

Phân loại:
```

Mô hình trả lời: **Hỏi thông tin** — mặc dù chưa từng được huấn luyện trên dataset phân loại email của bạn.

## Few-shot Learning Là Gì?

Few-shot learning là kỹ thuật đưa cho mô hình **một vài ví dụ (thường 1–10 ví dụ)** trong prompt, để hướng dẫn mô hình cách thực hiện tác vụ. Mô hình học "tại chỗ" (in-context learning) từ các ví dụ đó mà không cần cập nhật trọng số.

### Ví dụ thực tế

**Prompt few-shot (3 ví dụ):**
```
Phân loại email sau thành một trong các nhóm: Khiếu nại, Hỏi thông tin, Đề xuất hợp tác.

Email: "Sản phẩm tôi nhận được bị lỗi, tôi muốn hoàn tiền."
Phân loại: Khiếu nại

Email: "Bạn có chương trình đối tác cho doanh nghiệp không?"
Phân loại: Đề xuất hợp tác

Email: "Cho mình hỏi giá gói Premium bao nhiêu?"
Phân loại: Hỏi thông tin

---

Email: "Em muốn biết sản phẩm X có hỗ trợ tích hợp API không ạ?"
Phân loại:
```

Với few-shot, mô hình có **ngữ cảnh cụ thể hơn** về cách bạn định nghĩa từng nhóm, nên kết quả thường chính xác và ổn định hơn zero-shot.

## So Sánh Zero-shot, Few-shot và Fine-tuning

| Phương pháp | Số mẫu cần | Cập nhật trọng số? | Chi phí | Độ chính xác | Khi nào dùng |
|-------------|------------|-------------------|---------|-------------|--------------|
| **Zero-shot** | 0 (chỉ instruction) | Không | Thấp nhất | Vừa–cao | Tác vụ đơn giản, chuẩn, hoặc thử nghiệm nhanh |
| **Few-shot** | 1–10 ví dụ | Không | Thấp | Cao | Tác vụ phức tạp hơn, cần ổn định output |
| **Fine-tuning** | 100–100,000+ | Có (huấn luyện lại) | Cao | Rất cao | Tác vụ chuyên biệt, yêu cầu độ chính xác cao, khối lượng lớn |

**Nguyên tắc**: Bắt đầu với zero-shot. Chưa đủ chính xác? Thêm vài ví dụ (few-shot). Vẫn chưa đủ hoặc cần xử lý hàng triệu request? Lúc đó mới cân nhắc fine-tuning.

## In-context Learning: Cơ Chế Đằng Sau

Few-shot learning hoạt động nhờ **in-context learning** — khả năng mô hình học từ ngữ cảnh (context window) mà không cần cập nhật trọng số.

### Cách hoạt động

Khi bạn đưa prompt có ví dụ vào, mô hình:

1. **Đọc toàn bộ context** — tất cả ví dụ + nhiệm vụ mới
2. **Nhận diện mẫu** — "à, nhiệm vụ này là phân loại; output nên có dạng X"
3. **Áp dụng mẫu** — sinh ra output tương tự với ví dụ đã cho

Điều này xảy ra **trong 1 lần forward pass** — không có quá trình gradient descent, không có backpropagation, không có cập nhật trọng số. Mô hình chỉ đơn giản là "nhận ra pattern và tiếp tục nó".

### Giới hạn context window

In-context learning bị giới hạn bởi **context window** của mô hình:

- GPT-4 Turbo: 128K tokens (~300 trang A4)
- Claude 3.5 Sonnet: 200K tokens
- Gemini 1.5 Pro: 2 triệu tokens

Bạn có thể đưa hàng trăm ví dụ vào prompt (nếu context đủ lớn), nhưng:
- Chi phí API tăng tỷ lệ với số token
- Nhiều ví dụ quá có thể gây nhiễu thay vì giúp mô hình

**Best practice**: 3–5 ví dụ thường đủ cho hầu hết tác vụ. Nếu cần hơn 20 ví dụ, đó là tín hiệu nên chuyển sang fine-tuning.

## Prompt Engineering Cho Few-shot Learning

Cách bạn cấu trúc ví dụ ảnh hưởng trực tiếp đến chất lượng output.

### 1. Ví dụ phải đại diện

Chọn ví dụ phủ các **edge case** và **biến thể** của tác vụ:

**Tốt:**
```
Câu: "Sản phẩm này tuyệt vời!" → Tích cực
Câu: "Giao hàng chậm quá." → Tiêu cực
Câu: "Bình thường, không có gì đặc biệt." → Trung lập
```

**Không tốt (thiếu trường hợp trung lập):**
```
Câu: "Tuyệt vời!" → Tích cực
Câu: "Tệ quá!" → Tiêu cực
```

### 2. Định dạng nhất quán

Giữ **cấu trúc giống hệt nhau** cho mọi ví dụ:

```
Input: [nội dung]
Output: [kết quả]
---
Input: [nội dung]
Output: [kết quả]
```

Mô hình học cả pattern lẫn format — nếu format lộn xộn, output cũng lộn xộn.

### 3. Instruction rõ ràng

Đặt hướng dẫn tổng quan **trước** các ví dụ:

```
Tác vụ: Dịch câu tiếng Việt sang tiếng Anh, giọng văn tự nhiên (không máy móc).

Vi: Hôm nay trời đẹp quá.
En: What a beautiful day.

Vi: Mình đi ăn trưa nhé?
En: Wanna grab lunch?

---
Vi: Em chưa hiểu lắm.
En:
```

Instruction giúp mô hình hiểu **mục đích** thay vì chỉ bắt chước mù quáng.

## Ứng Dụng Thực Tế Năm 2026

### 1. Phân loại văn bản chuyên biệt

Bạn có 5 loại ticket support riêng của công ty — không có dataset huấn luyện công khai. Thay vì tốn tuần lễ gán nhãn hàng nghìn mẫu để fine-tune, bạn viết prompt few-shot với 5 ví dụ và chạy ngay.

### 2. Tạo nội dung theo brand voice

Đưa cho LLM 3–4 mẫu bài viết brand của bạn (giọng điệu, cấu trúc, từ ngữ) → bảo nó viết bài mới theo phong cách tương tự. Không cần fine-tune mô hình riêng.

### 3. Trích xuất dữ liệu có cấu trúc

Từ hợp đồng, hóa đơn, email — đưa 2–3 ví dụ cách trích xuất thành JSON, mô hình sẽ áp dụng cho tài liệu mới.

### 4. Dịch thuật chuyên ngành

Zero-shot translation đã khá tốt, nhưng với ngành chuyên môn (y tế, luật, kỹ thuật), few-shot với thuật ngữ chuẩn giúp output ổn định hơn rất nhiều.

### 5. Code generation theo convention

Đưa vài đoạn code mẫu theo coding style của team → bảo LLM sinh code mới sẽ đồng nhất với codebase hiện có.

## Hạn Chế và Khi Nào Không Dùng

### Hạn chế

1. **Không ổn định bằng fine-tuning** — output có thể biến động khi prompt thay đổi nhỏ
2. **Tốn token** — mỗi request đều gửi toàn bộ ví dụ lên, tăng chi phí API
3. **Khó scale với tác vụ phức tạp** — nếu tác vụ cần hiểu sâu domain, few-shot không thay thế được fine-tuning
4. **Dễ bị nhiễu** — ví dụ không tốt → output sai

### Khi nào KHÔNG nên dùng few-shot

- **Tác vụ yêu cầu độ chính xác cực cao** (y tế, tài chính) → fine-tuning + evaluation nghiêm ngặt
- **Khối lượng request khổng lồ** (hàng triệu/ngày) → fine-tuning giảm cost per request
- **Tác vụ cần reasoning phức tạp** → cân nhắc kết hợp với chain-of-thought hoặc mô hình reasoning chuyên dụng

## Tương Lai: Few-shot + RAG + Fine-tuning

Thực tế 2026, các kỹ thuật này **kết hợp** với nhau:

- **RAG (Retrieval-Augmented Generation)** — lấy ví dụ liên quan từ database → đưa vào prompt (dynamic few-shot)
- **Few-shot prompting** — hướng dẫn format/style
- **Fine-tuning** — tinh chỉnh cho domain/tác vụ cốt lõi

Một hệ thống chatbot support thực tế có thể:
1. Fine-tune mô hình trên toàn bộ knowledge base
2. Dùng RAG lấy tài liệu liên quan
3. Dùng few-shot prompt để định dạng câu trả lời theo brand voice

Mỗi kỹ thuật giải quyết một phần bài toán — và khi kết hợp đúng, chúng mạnh hơn gấp nhiều lần so với dùng riêng lẻ.

## FAQ

### Zero-shot learning có phải là AI tự học không?

Không. Zero-shot không phải tự học — mô hình đã được huấn luyện sẵn trên dữ liệu khổng lồ. "Zero-shot" chỉ có nghĩa là bạn không cần huấn luyện thêm cho tác vụ cụ thể đó.

### Bao nhiêu ví dụ là đủ cho few-shot?

3–5 ví dụ thường đủ cho hầu hết tác vụ. Nếu cần hơn 10 ví dụ và vẫn không ổn định, đó là tín hiệu nên chuyển sang fine-tuning.

### Few-shot có thay thế được fine-tuning không?

Không hoàn toàn. Few-shot rất tốt cho prototyping và tác vụ linh hoạt, nhưng fine-tuning vẫn mạnh hơn về độ chính xác, ổn định và hiệu quả chi phí khi scale lớn.

### Context window càng lớn càng tốt cho few-shot?

Về lý thuyết có — nhưng thực tế chi phí API tỷ lệ với số token. Context 2 triệu token (Gemini 1.5 Pro) cho phép đưa hàng trăm ví dụ, nhưng có thể không cần thiết và rất đắt.

### Làm sao biết khi nào nên chuyển từ few-shot sang fine-tuning?

Chuyển sang fine-tuning khi:
- Few-shot không đạt độ chính xác yêu cầu
- Khối lượng request lớn (fine-tuning giảm cost per request)
- Tác vụ ổn định, không thay đổi thường xuyên
- Có đủ dữ liệu huấn luyện (tối thiểu vài trăm mẫu chất lượng)

**Đọc thêm:**

- [Mô Hình Ngôn Ngữ Lớn (LLM) Hoạt Động Thế Nào?](/blog/mo-hinh-ngon-ngu-hoat-dong-the-nao/) — Hiểu cơ chế pre-training giúp mô hình có khả năng zero-shot và few-shot learning ngay từ đầu.
- [Fine-tuning Hay RAG? Khi Nào Dùng Cái Nào](/blog/fine-tuning-vs-rag-khi-nao-dung/) — So sánh chi tiết ba kỹ thuật: zero-shot/few-shot prompting, fine-tuning và RAG — khi nào dùng cái nào, khi nào kết hợp.
- [Prompt Engineering: Viết Lệnh Để AI Hiểu Bạn](/blog/prompt-engineering-viet-lenh-ai-hieu-ban/) — Kỹ thuật cấu trúc prompt hiệu quả, bao gồm cả few-shot examples và instruction design.