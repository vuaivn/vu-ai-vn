---
title: "Grounding Trong AI: Citations, RAG Attribution và Cách LLM Trích Nguồn 2026"
description: "Hướng dẫn chi tiết Grounding trong AI: citations, RAG attribution giúp LLM trích dẫn nguồn chính xác, giảm hallucination. Từ lý thuyết đến thực hành."
pubDate: 2026-10-03
category: cong-nghe
lang: "vi"
cover: /images/posts/hero-grounding-trong-ai-citations-rag-attribution.webp
draft: true
---

Bạn hỏi ChatGPT về một sự kiện lịch sử, nó trả lời tự tin — nhưng khi kiểm tra lại, thông tin sai hoàn toàn và không có nguồn trích dẫn nào. Đây chính là vấn đề **lack of grounding** — LLM sinh câu trả lời từ tri thức tổng quát mà không gắn với nguồn dữ liệu cụ thể. **Grounding trong AI** là kỹ thuật buộc LLM phải dựa trên tài liệu, dữ liệu thực, hoặc nguồn bên ngoài khi trả lời, đồng thời cung cấp **citations** (trích dẫn) và **attribution** (ghi nhận nguồn) minh bạch. Bài này giải thích grounding là gì, tại sao quan trọng, các kỹ thuật chính (RAG attribution, inline citations, structured grounding), và cách triển khai để chatbot của bạn trở nên đáng tin cậy hơn.

## Grounding trong AI là gì và tại sao LLM cần nó?

**Grounding trong AI** (hay **grounding response to sources**) là quá trình ràng buộc câu trả lời của LLM với các nguồn dữ liệu cụ thể, xác thực được — thay vì để model tự do "sáng tác" từ tri thức tổng quát đã học. Khi một LLM grounded, mỗi khẳng định quan trọng trong câu trả lời phải kèm theo **trích dẫn** (citation) hoặc **tham chiếu** (reference) tới tài liệu gốc, cho phép người dùng kiểm chứng.

**Vấn đề thực tế khi thiếu grounding:**
- LLM trả lời tự tin về số liệu, ngày tháng, sự kiện — nhưng sai lệch hoặc bịa đặt (**hallucination**)
- Người dùng không biết thông tin đến từ đâu, không thể kiểm chứng
- Chatbot y tế, tài chính, pháp lý đưa lời khuyên sai có thể gây hậu quả nghiêm trọng
- Trong môi trường enterprise, câu trả lời không truy xuất được nguồn làm giảm độ tin cậy

**Lợi ích khi có grounding:**
- **Giảm hallucination**: LLM chỉ trả lời dựa trên tài liệu đã retrieve, không bịa
- **Tăng độ tin cậy**: User thấy nguồn trích dẫn → có thể kiểm chứng
- **Truy vết được**: Mỗi khẳng định có thể truy ngược về document gốc
- **Tuân thủ pháp lý**: Trong compliance, phải chứng minh nguồn gốc thông tin

Về kỹ thuật, grounding thường đi kèm với **RAG** ([Retrieval-Augmented Generation](/blog/rag-nang-cao-xay-dung-he-thong-qa-thong-minh/)) — retrieve tài liệu liên quan, sau đó LLM sinh câu trả lời dựa trên đúng những tài liệu đó và ghi rõ nguồn. Hiểu về [hallucination trong AI](/blog/hallucination-ai-tai-sao-bia-cach-phong-tranh/) sẽ giúp bạn thấy rõ grounding là giải pháp phòng ngừa chính.

## Các loại grounding trong AI: Inline citations, RAG attribution, Structured grounding

Không phải mọi grounding đều giống nhau. Dưới đây là ba mô hình chính:

### 1. Inline Citations (Trích dẫn trực tiếp trong câu)
LLM chèn **số thứ tự** hoặc **link** ngay trong câu trả lời, tham chiếu tới nguồn cụ thể. Ví dụ:

> "Theo báo cáo 2025, thị trường AI chatbot tăng 38% [1]. RAG giảm hallucination xuống còn 12% so với 45% khi dùng LLM thuần [2]."
>
> **[1]** Gartner AI Market Report 2025  
> **[2]** Stanford AI Index 2025, p.47

**Ưu điểm:**
- Rõ ràng, dễ kiểm chứng ngay trong lúc đọc
- Người dùng thấy từng câu nào có nguồn, câu nào là suy luận

**Nhược điểm:**
- LLM phải generate số citation chính xác → khó (dễ sai số thứ tự)
- Cần post-processing để match citation ID với document

**Khi nào dùng:** Báo cáo nghiên cứu, chatbot y tế/pháp lý, nơi cần minh bạch từng khẳng định.

### 2. RAG Attribution (Ghi nguồn cuối câu trả lời)
Sau khi LLM sinh câu trả lời, hệ thống **liệt kê các tài liệu đã dùng** ở cuối dưới dạng "Sources" hoặc "References". Đây là cách ChatGPT with Bing, Perplexity.ai hoạt động.

**Ưu điểm:**
- Dễ triển khai: chỉ cần append danh sách documents đã retrieve
- Không làm gián đoạn văn phong câu trả lời

**Nhược điểm:**
- Người dùng không biết **câu nào** dựa trên **nguồn nào**
- Đôi khi LLM list cả nguồn không dùng (để "an toàn")

**Khi nào dùng:** Q&A chatbot, search assistant, khi cần balance giữa minh bạch và trải nghiệm.

### 3. Structured Grounding (Grounding qua schema & slots)
LLM phải điền thông tin vào các **slot có nguồn xác định trước**. Ví dụ chatbot đặt vé máy bay:

```json
{
  "departure": "HAN",        // grounded to user input
  "destination": "SGN",      // grounded to user input
  "date": "2026-10-15",      // grounded to calendar API
  "price": "$120",           // grounded to airline API response
  "available_seats": 12      // grounded to inventory DB
}
```

Mỗi field có nguồn rõ ràng → không có chỗ để hallucinate.

**Ưu điểm:**
- 100% grounded, hallucination ≈ 0
- Dễ audit (mỗi field trace về API/DB call)

**Nhược điểm:**
- Chỉ áp dụng cho domain structured (booking, form filling)
- Không linh hoạt cho câu hỏi mở

**Khi nào dùng:** Chatbot đặt hàng, form assistant, slot-filling tasks.

Ngoài ra còn có **function calling với citations** — LLM gọi tool (search API, SQL query) và trả lời dựa trên kết quả tool, ghi rõ tool nào đã dùng. Chi tiết về [function calling](/blog/function-calling-tool-use-ai/) sẽ giúp bạn hiểu cách kết hợp grounding với công cụ bên ngoài.

## Cách triển khai RAG Attribution: Từ retrieve đến cite

Đây là workflow phổ biến nhất để có grounding trong production RAG system:

### Bước 1: Retrieve documents có metadata đầy đủ
Khi embed documents vào vector database, **lưu metadata** như:
```python
{
  "text": "...",
  "source": "Gartner AI Report 2025",
  "url": "https://example.com/report.pdf",
  "page": 47,
  "published_date": "2025-03-10",
  "doc_id": "gartner_2025_047"
}
```

Khi retrieve, bạn không chỉ có text chunk mà còn có nguồn gốc rõ ràng.

### Bước 2: Inject retrieved docs + metadata vào prompt
Prompt template:

```
Dựa trên các tài liệu sau, trả lời câu hỏi của user. 
QUAN TRỌNG: Chỉ dùng thông tin từ tài liệu dưới đây. Nếu không có đủ info, nói "không đủ thông tin".

[Document 1]
Source: Gartner AI Report 2025, page 47
Text: "RAG systems reduce hallucination by 73% compared to vanilla LLM..."

[Document 2]
Source: Stanford AI Index 2025, page 12
Text: "Enterprise adoption of AI agents grew 45% YoY..."

---
User question: {query}

Answer (kèm citation dạng [1], [2]):
```

### Bước 3: LLM generate answer với citation IDs
LLM output:

> "RAG giảm hallucination 73% [1], trong khi việc sử dụng AI agents tăng 45% [2]."

### Bước 4: Post-process để map citations → metadata
Hệ thống bạn parse `[1]`, `[2]` và append reference list:

```
[1] Gartner AI Report 2025, page 47 — https://example.com/report.pdf
[2] Stanford AI Index 2025, page 12 — https://stanford.edu/ai-index
```

**Best practices:**
- **Thêm câu "must cite" vào system prompt**: "Always cite sources using [n] format."
- **Giới hạn số documents retrieve** (3-5 docs) để LLM không bị overwhelm
- **Dùng structured output** (JSON mode) nếu cần citation machine-readable
- **Verify citation accuracy**: một số tool như [LangSmith](https://www.langchain.com/langsmith) có thể check xem LLM có cite đúng doc không

Kết hợp với [semantic caching](/blog/semantic-caching-trong-llm/) sẽ giúp tiết kiệm cost khi retrieve + cite nhiều lần cho câu hỏi tương tự.

## Công cụ và framework hỗ trợ grounding: LangChain, LlamaIndex, Gemini Grounding

### LangChain RetrievalQA with sources
LangChain có sẵn chain `RetrievalQAWithSourcesChain`:

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Chroma

llm = ChatOpenAI(model="gpt-4")
vectorstore = Chroma(persist_directory="./db")

chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)

result = chain({"question": "What is RAG?"})
print(result["answer"])
print("Sources:", result["sources"])  # auto-generated citation
```

Output sẽ có `sources` field list các document đã dùng.

### LlamaIndex Citations
LlamaIndex tích hợp sâu hơn:

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(documents)

query_engine = index.as_query_engine(
    response_mode="tree_summarize",
    verbose=True,
    # Enable source citation
    include_text=False  # chỉ trả citation, không embed full text
)

response = query_engine.query("Explain RAG hallucination reduction")
print(response)
print(response.source_nodes)  # list node IDs + metadata
```

LlamaIndex còn có `CitationQueryEngine` cho inline citations.

### Google Gemini Grounding (mới nhất 2026)
Gemini API từ tháng 3/2026 có **Grounding with Google Search**:

```python
import google.generativeai as genai

model = genai.GenerativeModel('gemini-1.5-pro')
response = model.generate_content(
    "What are the latest AI trends in 2026?",
    generation_config={
        "grounding": {
            "google_search": {}
        }
    }
)

print(response.text)
print(response.grounding_metadata)  # citations from Google Search
```

LLM sẽ retrieve từ Google Search real-time và ghi rõ nguồn.

**So sánh:**

| Tool | Inline citation? | Custom docs? | Ease | Cost |
|------|-----------------|--------------|------|------|
| LangChain | ✅ (với prompt) | ✅ | Trung bình | Phụ thuộc LLM |
| LlamaIndex | ✅ CitationQE | ✅ | Dễ | Phụ thuộc LLM |
| Gemini Grounding | ✅ | ❌ (chỉ Google Search) | Rất dễ | $0.0002/1k chars grounding |

Nếu bạn cần grounding từ **internal docs**, dùng LangChain/LlamaIndex + [vector database](/blog/embeddings-vector-database-co-ban/). Nếu cần grounding từ **web public**, Gemini Grounding là lựa chọn nhanh nhất.

## Best practices để tăng độ chính xác của grounding

### 1. Chunk documents hợp lý (512-1024 tokens/chunk)
Chunk quá nhỏ → thiếu context, citation không đủ thông tin.  
Chunk quá lớn → retrieve không chính xác, LLM khó trích nguồn đúng đoạn.

**Sweet spot**: 512-1024 tokens, overlap 50-100 tokens.

### 2. Enrich metadata khi index
Thêm vào mỗi chunk:
- `source` (tên tài liệu)
- `url` hoặc `file_path`
- `page_number` / `section`
- `published_date` (để ưu tiên tài liệu mới)
- `author` / `organization`

Metadata này sẽ xuất hiện trong citation → tăng tính minh bạch.

### 3. Dùng reranking để lọc documents chính xác
Sau khi retrieve 20 docs từ vector DB, dùng **cross-encoder reranker** (như Cohere Rerank) để chọn ra 3-5 docs **thực sự liên quan nhất** trước khi đưa vào LLM. Điều này giảm noise và tăng accuracy của citation.

### 4. Prompt engineering: Buộc LLM phải cite
Thêm vào system prompt:

```
QUAN TRỌNG:
- Chỉ sử dụng thông tin từ documents được cung cấp.
- Mỗi khẳng định quan trọng PHẢI kèm citation [n].
- Nếu không có thông tin trong documents, nói "Tôi không có đủ thông tin từ tài liệu để trả lời."
- KHÔNG bịa đặt hoặc suy đoán ngoài documents.
```

### 5. Verify citations với attribution score
Một số framework (LlamaIndex, TruLens) có **attribution metric** — đo xem câu trả lời có thực sự match với documents đã cite không. Score thấp → warning user "độ tin cậy thấp".

### 6. Human-in-the-loop cho domain quan trọng
Với y tế, pháp lý, tài chính — **không tự động hoàn toàn**. Có bước review của chuyên gia trước khi trả lời user.

Kết hợp các practices trên với [AI guardrails](/blog/ai-guardrails-kiem-soat-output-an-toan/) sẽ tạo ra một hệ thống grounding an toàn, đáng tin cậy cho production.

## Grounding vs Hallucination: Mối quan hệ và cách đo lường

**Grounding là giải pháp chính để giảm hallucination**, nhưng không phải là 100%.

**Cách grounding giảm hallucination:**
1. **Constrain generation space**: LLM chỉ được "chọn" từ tài liệu có sẵn, không tự do sáng tác
2. **Retrieval acts as verification**: Nếu không retrieve được doc liên quan → LLM bắt buộc nói "không biết" thay vì bịa
3. **Citation forces accountability**: LLM phải chỉ ra nguồn → khó bịa vì user sẽ check

**Nhưng vẫn có rủi ro:**
- **Misattribution**: LLM cite sai nguồn (claim A nhưng cite doc B)
- **Cherry-picking**: LLM chọn lọc thông tin thiên lệch từ docs
- **Hallucinated citations**: LLM bịa cả số citation (ví dụ cite [3] nhưng chỉ có 2 docs)

**Cách đo lường grounding quality:**

| Metric | Định nghĩa | Cách đo |
|--------|-----------|---------|
| **Attribution Accuracy** | % citations đúng (trỏ đúng doc có info đó) | Manual review hoặc automated (TruLens) |
| **Grounding Recall** | % thông tin trong answer có nguồn từ docs | So sánh claim vs docs retrieved |
| **Grounding Precision** | % docs được cite có thực sự dùng | Kiểm tra overlap giữa answer và cited docs |
| **Hallucination Rate** | % claims không có trong docs | NLP-based fact-checking (vd Chainpoll) |

**Tools đo lường:**
- [TruLens](https://www.trulens.org/): Groundedness score (0-1)
- [Chainpoll](https://github.com/langchain-ai/chain-poll): Check hallucination trong RAG
- [RAGAS](https://github.com/explodinggradients/ragas): Context relevance + faithfulness metrics

Best practice: **Đo grounding accuracy trên 100+ câu hỏi test** trước khi đưa chatbot vào production.

## Grounding trong các use case thực tế: Legal, Medical, Enterprise Q&A

### 1. Legal chatbot (Tra cứu luật, hợp đồng)
**Yêu cầu:**
- Mỗi câu phải cite điều luật cụ thể (Luật X, Điều Y, Khoản Z)
- Không được suy diễn ngoài văn bản pháp luật

**Implementation:**
- Index: Bộ luật, nghị định, thông tư với metadata `law_id`, `article`, `clause`
- Grounding: Inline citation dạng "(Luật BHXH 2014, Điều 15, Khoản 2)"
- Guardrail: Từ chối trả lời nếu không retrieve được văn bản phù hợp

**Công cụ:** LlamaIndex + Pinecone + GPT-4 (hoặc Claude cho long context)

### 2. Medical chatbot (Tư vấn sức khỏe)
**Yêu cầu:**
- Cite nghiên cứu y khoa (PubMed, clinical guidelines)
- Disclaimer: "Đây không phải lời khuyên y tế chính thức"

**Implementation:**
- Index: PubMed abstracts, FDA guidelines, WHO recommendations
- Grounding: RAG attribution + link PubMed ID
- Human-in-the-loop: Bác sĩ review trước khi gửi cho bệnh nhân

**Compliance:** HIPAA (nếu ở Mỹ), cần audit trail cho mọi citation.

### 3. Enterprise knowledge base Q&A (Internal docs)
**Yêu cầu:**
- Nhân viên hỏi về policy, SOP, technical docs
- Phải trích đúng version mới nhất của tài liệu

**Implementation:**
- Index: Confluence, Google Drive, Notion với metadata `last_updated`, `version`
- Grounding: Show document title + last updated date
- Access control: Chỉ retrieve docs mà user có quyền xem

**Security:** Kết hợp [prompt injection defense](/blog/prompt-injection-ai-security-2026/) để tránh user bypass grounding qua adversarial prompts.

**Đọc thêm:**

- [RAG Nâng Cao: Xây Dựng Hệ Thống Q&A Thông Minh Từ Dữ Liệu Riêng](/blog/rag-nang-cao-xay-dung-he-thong-qa-thong-minh/) — Chi tiết workflow RAG production với multi-stage retrieval, reranking, và attribution strategies
- [Hallucination AI: Tại Sao AI Đôi Khi Bịa Chuyện và Cách Phòng Tránh](/blog/hallucination-ai-tai-sao-bia-cach-phong-tranh/) — Nguyên nhân gốc rẽ của hallucination và các kỹ thuật giảm thiểu, bao gồm grounding, constrained decoding, và fact-checking pipelines
- [Embeddings & Vector Database: Nền Tảng Của AI Hiểu Ngữ Nghĩa](/blog/embeddings-vector-database-co-ban/) — Cách vector search hoạt động trong RAG để retrieve documents chính xác cho grounding
