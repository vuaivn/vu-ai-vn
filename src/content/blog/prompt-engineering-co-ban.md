---
title: "Prompt engineering cơ bản: nghệ thuật ra lệnh cho AI"
description: "Cùng một câu hỏi, cách bạn diễn đạt quyết định chất lượng câu trả lời của AI. Học các kỹ thuật viết prompt nền tảng để dùng AI hiệu quả hơn nhiều lần."
pubDate: 2026-07-11
category: "cong-nghe"
lang: "vi"
---


> **Prompt engineering là kỹ năng viết câu lệnh sao cho AI hiểu đúng và trả lời tốt nhất.** Cùng một mô hình AI, người biết viết prompt nhận được kết quả hữu ích gấp nhiều lần người viết qua loa. Đây là kỹ năng nền tảng nhất mà bất kỳ ai dùng AI đều nên rèn.

Có một hiểu lầm phổ biến: khi AI trả lời dở, người ta đổ lỗi cho AI. Nhưng phần lớn thời gian, vấn đề nằm ở **cách hỏi**. Cùng một trợ lý AI, một câu hỏi mơ hồ cho ra câu trả lời mơ hồ, còn một câu hỏi rõ ràng cho ra vàng.

Kỹ năng viết câu hỏi ấy gọi là prompt engineering — và tin vui là nó không hề khó.

## Vì sao cách hỏi lại quan trọng đến vậy

Mô hình AI ngôn ngữ hoạt động bằng cách **dự đoán văn bản tiếp theo** dựa trên những gì bạn cung cấp. Nó không đọc được suy nghĩ của bạn. Nó chỉ có thể làm việc với những từ bạn đưa vào.

Vì thế, nếu bạn hỏi "viết về du lịch", AI phải tự đoán vô số thứ: viết cho ai, dài bao nhiêu, giọng điệu nào, mục đích gì. Kết quả là một câu trả lời chung chung, nhạt nhẽo. Càng cho AI ít thông tin, nó càng phải đoán, và càng dễ trượt ý bạn.

## Kỹ thuật 1: Cụ thể và chi tiết

Đây là nguyên tắc quan trọng nhất. So sánh:

- ❌ "Viết một email."
- ✅ "Viết một email ngắn, giọng thân thiện nhưng chuyên nghiệp, gửi khách hàng để xin lỗi vì giao hàng trễ 2 ngày và đề nghị giảm giá 10% cho đơn sau."

Câu thứ hai cho AI biết mục đích, giọng điệu, độ dài, và nội dung cần có. Kết quả sẽ sát ý bạn hơn rất nhiều.

## Kỹ thuật 2: Gán vai trò cho AI

Bạn có thể yêu cầu AI "đóng vai" một chuyên gia. Điều này giúp nó điều chỉnh kiến thức và giọng điệu cho phù hợp.

Ví dụ: *"Hãy đóng vai một chuyên gia dinh dưỡng. Giải thích cho người mới bắt đầu về cách đọc nhãn thực phẩm, dùng ngôn ngữ đơn giản, dễ hiểu."*

Việc gán vai trò định khung câu trả lời, giúp AI tập trung đúng lĩnh vực và đúng đối tượng người đọc.

## Kỹ thuật 3: Cho ví dụ mẫu

Nếu bạn muốn một phong cách hoặc định dạng cụ thể, cách nhanh nhất là **đưa ví dụ**. Kỹ thuật này gọi là "few-shot prompting".

Ví dụ, thay vì mô tả dài dòng phong cách bạn muốn, bạn dán vào một đoạn mẫu và nói: "Viết theo đúng giọng điệu và cấu trúc như đoạn này". AI học rất nhanh từ ví dụ.

## Kỹ thuật 4: Chia nhỏ nhiệm vụ

Với việc phức tạp, đừng dồn tất cả vào một câu hỏi khổng lồ. Hãy chia thành các bước.

Ví dụ, thay vì "viết cho tôi cả một kế hoạch marketing", hãy làm từng phần: trước hết hỏi AI phân tích đối tượng khách hàng, rồi mới sang ý tưởng nội dung, rồi sang lịch đăng bài. Chia nhỏ giúp mỗi bước rõ ràng và chất lượng hơn.

Bạn cũng có thể yêu cầu AI "suy nghĩ từng bước" (chain of thought) với các bài toán logic — nó thường cho kết quả chính xác hơn khi được yêu cầu trình bày lập luận.

## Kỹ thuật 5: Lặp lại và tinh chỉnh

Đừng kỳ vọng câu trả lời đầu tiên là hoàn hảo. Prompt tốt là một **cuộc hội thoại**, không phải một phát ăn ngay.

Sau câu trả lời đầu, cứ tinh chỉnh: "làm ngắn hơn", "giọng trang trọng hơn", "thêm một ví dụ thực tế", "bỏ đoạn cuối". Mỗi lần điều chỉnh, bạn dẫn AI tới gần kết quả mong muốn hơn.

## Kết

Prompt engineering nghe có vẻ kỹ thuật, nhưng bản chất chỉ là **giao tiếp rõ ràng**. Nếu bạn biết cách diễn đạt điều mình muốn cho một người trợ lý thông minh nhưng không đọc được suy nghĩ, bạn đã biết viết prompt.

Năm kỹ thuật trên — cụ thể, gán vai trò, cho ví dụ, chia nhỏ, tinh chỉnh — là bộ công cụ nền tảng. Càng thực hành, bạn càng cảm nhận được cách "nói chuyện" với AI để nó phát huy hết sức mạnh.

Muốn hiểu sâu hơn về giới hạn của AI, đọc bài [context window là gì](/blog/context-window-la-gi/). Hoặc khám phá [AI agent là gì](/blog/ai-agent-la-gi/) để thấy prompt được dùng thế nào trong hệ thống tự động.
