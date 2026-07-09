---
title: 'Prompt Engineering cơ bản: Cách viết prompt hiệu quả cho AI'
description: 'Hướng dẫn prompt engineering cơ bản giúp bạn viết prompt rõ ràng, tối ưu kết quả từ ChatGPT, Claude và các mô hình AI khác.'
pubDate: 2026-05-03
updatedDate: 2026-07-09
category: 'cong-nghe'
lang: 'vi'
cover: '/images/posts/hero-prompt.webp'
faq:
  - q: 'Prompt engineering có cần biết lập trình không?'
    a: 'Không. Bạn chỉ cần dùng ngôn ngữ tự nhiên rõ ràng. Tuy nhiên hiểu biết kỹ thuật giúp bạn viết prompt tinh vi hơn.'
  - q: 'Prompt dài hay ngắn thì tốt hơn?'
    a: 'Không có câu trả lời tuyệt đối. Prompt cần đủ chi tiết để rõ ý nhưng không thừa thãi gây nhiễu.'
  - q: 'Tôi có thể tái sử dụng prompt không?'
    a: 'Có. Nên lưu lại các prompt hiệu quả thành "thư viện prompt" để dùng lại và cải tiến dần.'
  - q: 'Prompt engineering có lỗi thời khi AI ngày càng thông minh?'
    a: 'Mô hình càng mạnh, prompt tốt càng phát huy giá trị. Đây vẫn là kỹ năng nền tảng lâu dài.'
---

**Tóm tắt nhanh:** Prompt engineering là **kỹ thuật viết chỉ dẫn để AI trả về kết quả tốt nhất**. Nguyên tắc vàng: prompt càng **rõ ràng, cụ thể, có ngữ cảnh và vai trò**, kết quả càng chất lượng. 5 nguyên tắc cốt lõi: rõ ràng cụ thể, cung cấp ngữ cảnh, chỉ định vai trò, nêu định dạng đầu ra, đưa ví dụ mẫu.

**Prompt engineering** là nghệ thuật và kỹ thuật viết chỉ dẫn (prompt) để mô hình AI trả về kết quả chính xác, hữu ích nhất. Nói ngắn gọn: prompt càng rõ ràng, cụ thể và có ngữ cảnh, kết quả càng chất lượng. Đây là kỹ năng nền tảng cho bất kỳ ai muốn làm việc hiệu quả với AI.

## Prompt engineering là gì?

Prompt engineering là quá trình thiết kế và tinh chỉnh câu lệnh đầu vào cho các mô hình ngôn ngữ lớn (LLM) như GPT, Claude hay Gemini. Thay vì lập trình bằng code, bạn "lập trình" bằng ngôn ngữ tự nhiên. Một prompt tốt định hình cách mô hình suy nghĩ, định dạng đầu ra và mức độ chi tiết của câu trả lời.

### Vì sao prompt engineering quan trọng?

Cùng một mô hình AI, hai người dùng có thể nhận kết quả hoàn toàn khác nhau chỉ vì cách đặt câu hỏi. Prompt kém khiến AI trả lời chung chung, lạc đề hoặc bịa đặt. Prompt tốt giúp bạn tiết kiệm thời gian, giảm số lần chỉnh sửa và khai thác tối đa năng lực của mô hình.

![Minh họa cách viết prompt hiệu quả với ngữ cảnh và ví dụ rõ ràng](/images/posts/in-prompt.webp)

## Những nguyên tắc cốt lõi khi viết prompt

Dưới đây là các nguyên tắc bạn có thể áp dụng ngay:

- **Rõ ràng và cụ thể:** Nêu chính xác điều bạn muốn. Thay vì "viết về marketing", hãy viết "viết dàn ý 5 phần cho bài blog về email marketing cho shop thời trang nhỏ".
- **Cung cấp ngữ cảnh:** Cho AI biết bạn là ai, đối tượng đọc là ai, mục tiêu là gì.
- **Chỉ định vai trò (role):** "Bạn là chuyên gia SEO 10 năm kinh nghiệm..." giúp định hướng giọng văn và chuyên môn.
- **Nêu định dạng đầu ra:** Yêu cầu bảng, danh sách, JSON, hoặc số từ cụ thể.
- **Đưa ví dụ (few-shot):** Cho 1-2 ví dụ mẫu giúp AI hiểu đúng ý bạn.

### Ví dụ prompt kém và prompt tốt

Prompt kém:

```
Viết email bán hàng.
```

Prompt tốt:

```
Bạn là copywriter chuyên nghiệp. Viết một email bán hàng dài 120 từ
giới thiệu khóa học tiếng Anh online cho người đi làm bận rộn.
Giọng văn thân thiện, có 1 lời kêu gọi hành động rõ ràng ở cuối.
```

Sự khác biệt nằm ở vai trò, độ dài, đối tượng, giọng văn và mục tiêu — tất cả đều được nêu rõ.

## Các kỹ thuật prompt nâng cao cần biết

Khi đã quen với cơ bản, bạn có thể thử:

- **Chain-of-thought:** Yêu cầu AI "suy nghĩ từng bước" để giải quyết bài toán phức tạp.
- **Few-shot prompting:** Cung cấp vài ví dụ mẫu để định hình đầu ra.
- **Phân rã nhiệm vụ:** Chia yêu cầu lớn thành nhiều prompt nhỏ, dễ kiểm soát.
- **Lặp và tinh chỉnh:** Xem kết quả, chỉ ra điều chưa ổn, yêu cầu sửa.

### Lỗi thường gặp khi viết prompt

Nhiều người mắc lỗi: prompt quá mơ hồ, nhồi quá nhiều yêu cầu vào một câu, hoặc không kiểm tra lại kết quả. Hãy coi việc viết prompt như một cuộc đối thoại — bạn hoàn toàn có thể yêu cầu AI chỉnh sửa nhiều lần.

## Những điều cốt lõi

- Prompt engineering là **"lập trình bằng ngôn ngữ tự nhiên"** cho LLM.
- 5 nguyên tắc: **rõ ràng cụ thể, cung cấp ngữ cảnh, chỉ định vai trò, nêu định dạng, đưa ví dụ**.
- Kỹ thuật nâng cao: **chain-of-thought, few-shot, phân rã nhiệm vụ, lặp và tinh chỉnh**.
- Lỗi thường gặp: **prompt mơ hồ, nhồi quá nhiều yêu cầu, không kiểm tra lại**.
- Coi việc viết prompt như một **cuộc đối thoại** — chỉnh sửa nhiều lần.

## Câu hỏi thường gặp (FAQ)

**Prompt engineering có cần biết lập trình không?**
Không. Bạn chỉ cần dùng ngôn ngữ tự nhiên rõ ràng. Tuy nhiên hiểu biết kỹ thuật giúp bạn viết prompt tinh vi hơn.

**Prompt dài hay ngắn thì tốt hơn?**
Không có câu trả lời tuyệt đối. Prompt cần đủ chi tiết để rõ ý nhưng không thừa thãi gây nhiễu.

**Tôi có thể tái sử dụng prompt không?**
Có. Nên lưu lại các prompt hiệu quả thành "thư viện prompt" để dùng lại và cải tiến dần.

**Prompt engineering có lỗi thời khi AI ngày càng thông minh?**
Mô hình càng mạnh, prompt tốt càng phát huy giá trị. Đây vẫn là kỹ năng nền tảng lâu dài.

## Kết luận

Prompt engineering là kỹ năng nền tảng của thời đại AI. Hãy bắt đầu thực hành ngay hôm nay: chọn một tác vụ bạn làm hằng ngày, viết một prompt rõ ràng theo các nguyên tắc trên và tinh chỉnh cho đến khi hài lòng.
