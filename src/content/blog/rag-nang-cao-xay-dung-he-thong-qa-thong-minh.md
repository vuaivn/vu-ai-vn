---
title: "RAG Nâng Cao: Xây Dựng Hệ Thống Q&A Thông Minh Từ Dữ Liệu Riêng"
description: "Hướng dẫn triển khai RAG nâng cao với chunking thông minh, hybrid search, reranking và multi-hop reasoning để xây hệ thống Q&A chính xác từ dữ liệu riêng."
pubDate: 2026-08-31
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-rag-nang-cao-xay-dung-he-thong-qa-thong-minh-v2.webp"
draft: false
---

**RAG (Retrieval-Augmented Generation) nâng cao là việc kết hợp tìm kiếm thông minh (chunking tối ưu, hybrid search, reranking) với LLM để xây hệ thống Q&A chính xác từ dữ liệu riêng. Thay vì RAG đơn giản (chia text → embed → tìm → prompt), RAG nâng cao giải quyết vấn đề: chunk không khớp câu hỏi, thiếu ngữ cảnh, kết quả sai lệch — bằng cách cải tiến từng bước trong pipeline.**

Bạn đã thử RAG cơ bản: chia tài liệu thành đoạn 500 ký tự, nhét vào vector database, rồi khi user hỏi thì lấy 3-5 đoạn gần nhất đưa cho LLM trả lời. Nghe hợp lý.

Nhưng thực tế?

Câu hỏi hỏi về "quy trình onboarding nhân viên mới" nhưng vector search trả về đoạn nói về "quy trình nghỉ việc" vì hai cụm từ có embedding gần nhau. Đoạn được trả về đứt gãy giữa chừng, thiếu luôn phần quan trọng nhất. LLM bịa thêm. Hoặc trả lời sai thẳng.

RAG đơn giản chỉ là điểm khởi đầu. Để xây hệ thống Q&A thực sự dùng được trong production — dù cho nội bộ công ty, chatbot khách hàng hay knowledge base cá nhân — bạn cần **RAG nâng cao**.

## RAG Cơ Bản Fail Ở Đâu?

Trước khi nói "nâng cao", hiểu rõ vấn đề cơ bản gặp phải:

### 1. Chunking Ngây Thơ

Chia đều mỗi 500 ký tự hoặc mỗi paragraph nghe có vẻ đơn giản. Nhưng thực tế ngôn ngữ không đều đặn:
- Một bảng dài 2000 ký tự bị chặt thành 4 mảnh vô nghĩa
- Một đoạn văn quan trọng bị cắt đôi, mất ngữ cảnh
- Câu hỏi hỏi về "bước 3" nhưng chunk chỉ chứa bước 2 và nửa đầu bước 3

### 2. Semantic Search Không Đủ

Vector similarity (cosine distance giữa embeddings) tìm được ý nghĩa tương đồng — nhưng:
- "iPhone 15 giá bao nhiêu?" và "iPhone 15 Pro Max giá bao nhiêu?" có embedding gần nhau, nhưng câu trả lời khác nhau
- Câu hỏi chứa từ khóa chuyên môn (model name, mã sản phẩm, thuật ngữ) thì keyword matching (BM25) chính xác hơn vector search thuần túy
- Một query phức tạp ("so sánh A và B về mặt X") cần nhiều chunk từ nhiều phần tài liệu — nhưng top-3 nearest neighbors không đủ

### 3. Thiếu Ngữ Cảnh

Bạn retrieve được 1 đoạn 200 từ, nhét vào prompt. LLM đọc được — nhưng không biết đoạn này nằm trong context nào:
- Đoạn này thuộc chapter nào?
- Tài liệu này của sản phẩm/dịch vụ nào?
- Metadata: ngày cập nhật, tác giả, độ ưu tiên?

Thiếu metadata → LLM dễ trộn lẫn giữa docs cũ và mới, hoặc trả lời chung chung.

### 4. Không Kiểm Soát Được Chất Lượng

RAG cơ bản: retrieve xong thì tin. Không có:
- Reranking (sắp xếp lại kết quả theo relevance thật sự)
- Scoring (đoạn nào đáng tin, đoạn nào không)
- Fallback (khi không tìm được gì đủ tốt, thà nói "không biết" còn hơn bịa)

Kết quả: LLM nhận được đống chunk tào lao → hallucination.

**Đó là lý do RAG nâng cao tồn tại.**

## Chunking Strategies: Chia Thông Minh Hơn

Chunking là bước đầu tiên và quan trọng nhất. Nếu chunk sai, mọi thứ sau đó sẽ fail.

### Fixed-Size Chunking (Baseline Ngây Thơ)

**Cách làm**: chia đều mỗi 500 ký tự (hoặc 1000, tùy), overlap 100 ký tự giữa các chunk.

**Ưu điểm**: đơn giản, nhanh.

**Nhược điểm**:
- Cắt ngang giữa câu, giữa bảng, giữa danh sách → mất ngữ cảnh
- Không tôn trọng cấu trúc logic của tài liệu (heading, section)

**Khi nào dùng**: chỉ khi bạn cần prototype nhanh hoặc dữ liệu rất đồng nhất (ví dụ: transcript podcast đã được phân đoạn sẵn).

### Semantic Chunking (Chia Theo Ý Nghĩa)

**Cách làm**:
1. Chia tài liệu thành các câu
2. Tính embedding cho mỗi câu
3. Tính cosine similarity giữa các câu liên tiếp
4. Khi similarity giảm mạnh (ví dụ < 0.7) → ranh giới chunk mới (chủ đề chuyển đổi)

**Ưu điểm**: tự động phát hiện ranh giới tự nhiên của chủ đề → chunk có ý nghĩa trọn vẹn hơn.

**Nhược điểm**:
- Phụ thuộc vào chất lượng embedding model
- Chậm hơn fixed-size (phải tính embedding từng câu)
- Chunk size không đồng đều → cần điều chỉnh max_chunk_size

**Khi nào dùng**: văn bản dài, có nhiều chủ đề xen kẽ (sách, báo cáo, documentation).

**Implementation** (Python, dùng `sentence-transformers`):
```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_chunk(text, similarity_threshold=0.7, max_chunk_size=1000):
    sentences = text.split('. ')  # đơn giản hóa, thực tế dùng nltk/spacy
    embeddings = model.encode(sentences)
    
    chunks = []
    current_chunk = [sentences[0]]
    
    for i in range(1, len(sentences)):
        sim = cosine_similarity([embeddings[i-1]], [embeddings[i]])[0][0]
        
        if sim < similarity_threshold or len(' '.join(current_chunk)) > max_chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = [sentences[i]]
        else:
            current_chunk.append(sentences[i])
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks
```

### Hierarchical Chunking (Phân Tầng)

**Cách làm**:
1. Chia tài liệu theo cấu trúc logic: section → subsection → paragraph
2. Tạo 2 loại chunk:
   - **Parent chunks**: toàn bộ section (dùng để retrieve ngữ cảnh rộng)
   - **Child chunks**: đoạn nhỏ (dùng để retrieve chi tiết chính xác)
3. Khi retrieve: tìm child chunk khớp nhất → lấy luôn parent chunk của nó để có ngữ cảnh đầy đủ

**Ưu điểm**:
- Giữ được ngữ cảnh (LLM nhận cả section, không chỉ 1 đoạn lẻ loi)
- Tận dụng cấu trúc tự nhiên của tài liệu (Markdown headings, HTML sections)

**Nhược điểm**: phức tạp hơn, cần parse structure.

**Khi nào dùng**: documentation kỹ thuật, sách giáo khoa, knowledge base có cấu trúc rõ ràng.

**Ví dụ**: tài liệu API docs với structure:
```
# Authentication (parent)
  ## OAuth 2.0 (child)
    - Code flow (grandchild)
    - Implicit flow (grandchild)
  ## API Keys (child)
```

Khi user hỏi "OAuth code flow là gì?" → retrieve grandchild "Code flow" → nhưng đưa vào prompt cả parent "Authentication" và child "OAuth 2.0" để LLM hiểu đầy đủ ngữ cảnh.

### Document-Based Chunking (Theo Metadata)

Đôi khi ranh giới chunk tự nhiên nhất chính là... **ranh giới document**.

**Cách làm**: mỗi document (file PDF, page docs, ticket support) = 1 chunk, kèm rich metadata.

**Khi nào dùng**:
- Documents ngắn (mỗi file < 2000 từ)
- Mỗi doc đã là 1 đơn vị ý nghĩa trọn vẹn (email, ticket, blog post)

**Ưu điểm**: không lo mất ngữ cảnh, metadata tự nhiên (tác giả, ngày, tags).

**Nhược điểm**: không áp dụng được với tài liệu dài.

**Lựa chọn chunking strategy nào?**

| Loại dữ liệu | Strategy gợi ý |
|--------------|----------------|
| Docs kỹ thuật có structure rõ | Hierarchical |
| Văn bản dài, nhiều chủ đề | Semantic |
| Tập hợp docs ngắn (emails, tickets) | Document-based |
| Prototype nhanh | Fixed-size (overlap 20%) |

Trong thực tế production: **kết hợp**. Ví dụ: hierarchical cho docs có structure + semantic cho phần nội dung tự do.

## Hybrid Search: Vector + Keyword = Sức Mạnh Gấp Đôi

Vector search (embedding similarity) tìm được ý nghĩa. Nhưng nó yếu với:
- Tên riêng (người, sản phẩm, công ty)
- Thuật ngữ chuyên môn
- Mã số (SKU, ticket ID, model name)

**Keyword search** (BM25, Elasticsearch) giỏi đúng những thứ vector search yếu.

Kết hợp cả hai = **hybrid search**.

### Cách Triển Khai Hybrid Search

**Step 1**: Index cả hai loại:
- Vector index: dùng Pinecone / Weaviate / Qdrant
- Keyword index: dùng Elasticsearch / BM25 (có sẵn trong nhiều vector DB như Weaviate)

**Step 2**: Với mỗi query:
1. Chạy vector search → top 20 kết quả (recall cao)
2. Chạy keyword search → top 20 kết quả
3. **Merge** bằng Reciprocal Rank Fusion (RRF):

```python
def reciprocal_rank_fusion(vector_results, keyword_results, k=60):
    """
    RRF: kết hợp ranking từ 2 nguồn
    score = 1/(k + rank_vector) + 1/(k + rank_keyword)
    """
    scores = {}
    
    for rank, doc_id in enumerate(vector_results, start=1):
        scores[doc_id] = scores.get(doc_id, 0) + 1/(k + rank)
    
    for rank, doc_id in enumerate(keyword_results, start=1):
        scores[doc_id] = scores.get(doc_id, 0) + 1/(k + rank)
    
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

**Ưu điểm RRF**:
- Không cần tune weights (tự cân bằng)
- Kết quả ở top của cả 2 nguồn sẽ được boost
- Đơn giản, ổn định

**Khi nào dùng hybrid**:
- User query có cả ý nghĩa trừu tượng + từ khóa cụ thể ("tài liệu về OAuth cho sản phẩm X")
- Domain có nhiều thuật ngữ chuyên môn (y tế, pháp lý, kỹ thuật)
- Dữ liệu chứa mã số, tên riêng

**Ví dụ thực tế**: 
- Query: "lỗi 503 trên server production"
- Vector search: tìm các đoạn nói về "lỗi server", "downtime", "sự cố production" (ý nghĩa)
- Keyword search: tìm đúng "503" (mã lỗi cụ thể)
- Hybrid: kết quả chứa cả hai → chính xác nhất

## Reranking: Sắp Xếp Lại Kết Quả Theo Relevance Thật Sự

Vector search + hybrid search cho bạn top 20 kết quả candidates. Nhưng không phải tất cả đều đáng tin như nhau.

**Reranking** = chạy lại 1 model chuyên dụng để **score lại** mức độ relevance giữa query và mỗi candidate → sắp xếp lại → chỉ lấy top 3-5 tốt nhất đưa vào prompt.

### Tại Sao Cần Reranking?

**Vấn đề**: embedding model (ví dụ `text-embedding-ada-002` của OpenAI) được train để tạo ra vector "đại diện chung" cho toàn bộ đoạn text. Nó tốt cho broad matching — nhưng không chuyên sâu cho scoring chi tiết.

**Reranker model** (ví dụ `Cohere Rerank`, `bge-reranker-v2`) được train đặc biệt để cho điểm từng cặp (query, document). Chính xác hơn nhiều.

**Số liệu thực tế**: thêm reranking vào RAG pipeline tăng accuracy từ 65% lên 82% (dữ liệu từ Cohere case study).

### Cách Triển Khai Reranking

**Option 1: Cohere Rerank API** (dễ nhất)

```python
import cohere

co = cohere.Client('YOUR_API_KEY')

# Sau khi có top 20 từ hybrid search
query = "OAuth code flow là gì?"
candidates = [chunk['text'] for chunk in top_20_chunks]

reranked = co.rerank(
    query=query,
    documents=candidates,
    top_n=5,
    model='rerank-english-v2.0'  # hoặc rerank-multilingual cho tiếng Việt
)

# Kết quả: top 5 chunks có relevance score cao nhất
top_chunks = [candidates[r.index] for r in reranked.results]
```

**Option 2: Self-hosted reranker** (miễn phí, tự kiểm soát)

Dùng `sentence-transformers` với model `bge-reranker-v2`:

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder('BAAI/bge-reranker-v2-m3')

query = "OAuth code flow là gì?"
candidates = [chunk['text'] for chunk in top_20_chunks]

# Score từng cặp (query, candidate)
scores = model.predict([(query, doc) for doc in candidates])

# Sắp xếp theo score
ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
top_chunks = [candidates[i] for i in ranked_indices[:5]]
```

**Trade-off**:
- Cohere: nhanh, chính xác, nhưng mất phí (~$1/1000 requests)
- Self-hosted: miễn phí, nhưng cần GPU (hoặc chậm hơn trên CPU), phải tự maintain

**Khi nào dùng**: **luôn luôn**, nếu bạn đang xây RAG production. Chi phí reranking thấp hơn nhiều so với việc LLM hallucinate → user mất niềm tin.

## Query Engineering: Cải Thiện Câu Hỏi Trước Khi Search

Đôi khi vấn đề không phải ở chunking hay search — mà ở chính **câu hỏi**.

User hỏi: "cái này hoạt động thế nào?" → "cái này" là gì? Vector search không biết.

**Query engineering** = biến đổi câu hỏi của user thành dạng tốt hơn cho retrieval.

### Query Expansion (Mở Rộng Câu Hỏi)

**Ý tưởng**: sinh ra nhiều biến thể của câu hỏi gốc → search tất cả → gộp kết quả.

**Cách làm**: dùng LLM sinh synonyms/paraphrases:

```python
prompt = f"""
User hỏi: "{original_query}"

Sinh ra 3 cách hỏi khác nhau cùng ý nghĩa:
1.
2.
3.
"""

expanded_queries = llm.generate(prompt)  # ["RAG là gì?", "Giải thích RAG", "Retrieval augmented generation nghĩa là gì"]

# Search với tất cả queries, gộp kết quả
all_results = []
for q in expanded_queries:
    all_results.extend(vector_search(q, top_k=10))

# Deduplicate + rerank
final_results = rerank(original_query, deduplicate(all_results))
```

**Ưu điểm**: tăng recall (tìm được nhiều góc độ).

**Nhược điểm**: tốn thêm API calls, chậm hơn.

**Khi nào dùng**: query ngắn, mơ hồ ("OAuth", "pricing", "setup").

### HyDE (Hypothetical Document Embeddings)

Trick thông minh từ paper của Stanford (2022):

**Ý tưởng**: thay vì embed câu hỏi → embed **câu trả lời giả định**.

**Logic**: embedding của "câu hỏi" và "câu trả lời" khác nhau trong vector space. Nhưng documents trong database đều là "câu trả lời" → nếu bạn embed câu hỏi thì match kém. Nếu sinh ra câu trả lời giả định rồi embed nó → match tốt hơn.

**Cách làm**:

```python
prompt = f"""
User hỏi: "{query}"

Viết 1 đoạn văn ngắn (100 từ) trả lời câu hỏi này, dù bạn không biết chính xác câu trả lời.
"""

hypothetical_answer = llm.generate(prompt)

# Embed câu trả lời giả định (thay vì embed query)
query_embedding = embed(hypothetical_answer)

# Search như bình thường
results = vector_search(query_embedding, top_k=10)
```

**Kết quả**: accuracy tăng 10-15% so với embed trực tiếp query (theo paper gốc).

**Trade-off**: tốn 1 LLM call để sinh hypothetical answer → chậm hơn, tốn hơn.

**Khi nào dùng**: query phức tạp, cần reasoning ("so sánh X và Y", "ưu nhược điểm của Z").

## Multi-Hop RAG và Agentic Workflows

RAG đơn giản: 1 query → 1 lần retrieve → 1 câu trả lời.

Nhưng câu hỏi thực tế thường phức tạp hơn: "So sánh giá iPhone 15 và Samsung S24, và cho tôi biết cái nào pin tốt hơn?"

Đây là **multi-hop question**: cần thông tin từ nhiều nguồn (spec iPhone, spec Samsung) + reasoning (so sánh).

**Multi-hop RAG** = cho phép LLM tự quyết định:
1. Retrieve lần 1 → đọc kết quả
2. Quyết định có cần thêm thông tin không
3. Nếu cần → retrieve lần 2 (với query mới dựa trên kết quả lần 1)
4. Lặp lại cho đến khi đủ thông tin
5. Tổng hợp câu trả lời

**Triển khai**: dùng **agent framework** như LangChain, LlamaIndex, hoặc tự code với function calling.

**Ví dụ với LangChain**:

```python
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI

# Define retrieval tool
def retrieve_tool(query: str) -> str:
    results = hybrid_search(query, top_k=3)
    results = rerank(query, results)[:2]
    return "\n\n".join([r['text'] for r in results])

tools = [
    Tool(
        name="SearchDocs",
        func=retrieve_tool,
        description="Tìm kiếm trong knowledge base. Input: câu hỏi cần tìm."
    )
]

llm = ChatOpenAI(model="gpt-4")
agent = create_react_agent(llm, tools, prompt_template)

# Agent tự động quyết định khi nào search, search cái gì
response = agent.invoke({
    "input": "So sánh pin iPhone 15 và Samsung S24"
})

# Agent sẽ:
# 1. Search "iPhone 15 pin" → đọc → ghi nhận "4000mAh"
# 2. Search "Samsung S24 pin" → đọc → ghi nhận "5000mAh"
# 3. So sánh → trả lời "S24 pin tốt hơn (5000 vs 4000mAh)"
```

**Ưu điểm**: xử lý được câu hỏi phức tạp, linh hoạt.

**Nhược điểm**:
- Chậm (nhiều lần gọi LLM + retrieval)
- Tốn token
- Khó debug (agent đôi khi đi vòng vòng)

**Khi nào dùng**: Q&A domain phức tạp (research, phân tích, so sánh), nơi accuracy quan trọng hơn latency.

## Evaluation và Monitoring: Đo Lường RAG Có Tốt Không

Bạn đã build RAG pipeline xịn xò. Nhưng làm sao biết nó **thật sự tốt**?

### Metrics Quan Trọng

**1. Retrieval Metrics** (đo chất lượng retrieve)

- **Precision@K**: trong top K chunks retrieved, bao nhiêu % thật sự liên quan?
- **Recall@K**: trong tất cả chunks liên quan, bao nhiêu % được retrieve?
- **MRR (Mean Reciprocal Rank)**: vị trí trung bình của chunk liên quan đầu tiên

**2. Generation Metrics** (đo chất lượng câu trả lời)

- **Faithfulness**: câu trả lời có dựa trên retrieved context không? (không hallucinate)
- **Answer Relevance**: câu trả lời có khớp với câu hỏi không?
- **Context Relevance**: retrieved context có liên quan đến câu hỏi không?

**3. End-to-End Metrics**

- **Answer Correctness**: so với ground truth (nếu có), câu trả lời đúng bao nhiêu %?
- **Latency**: thời gian từ query → answer (production cần < 3s)
- **Cost**: token tiêu thụ (embedding + LLM)

### Công Cụ Evaluation

**RAGAS** (RAG Assessment):

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision

# Chuẩn bị test set
test_set = [
    {
        "question": "OAuth code flow là gì?",
        "ground_truth": "OAuth code flow là...",  # câu trả lời chuẩn
        "contexts": [...],  # chunks retrieved
        "answer": "..."  # câu trả lời của RAG
    },
    # ... thêm cases
]

result = evaluate(
    test_set,
    metrics=[faithfulness, answer_relevancy, context_precision]
)

print(result)
# Faithfulness: 0.85
# Answer Relevancy: 0.78
# Context Precision: 0.72
```

**LangSmith / Weights & Biases**: monitoring production RAG, track queries + responses + metrics theo thời gian.

**Khi nào evaluate**:
- Sau mỗi lần thay đổi chunking strategy / embedding model / reranker
- Định kỳ (hàng tuần) với production traffic
- Khi user phản hồi câu trả lời sai

**Cách build test set**:
- Lấy 50-100 câu hỏi thật từ user (nếu có)
- Hoặc tự tạo: mỗi section trong docs → sinh 2-3 câu hỏi + ground truth
- Dùng LLM sinh synthetic questions (nhưng cần human review)

## FAQ

### RAG nâng cao có cần GPU không?

**Không bắt buộc**, nhưng sẽ nhanh hơn nhiều:
- Embedding model (sentence-transformers): CPU được, nhưng batch lớn thì cần GPU (inference 10x nhanh hơn)
- Reranker self-hosted: tương tự
- Vector search: chạy trên database (Pinecone, Weaviate) → không cần GPU của bạn

**Khuyến nghị**: nếu processing < 1000 docs, CPU đủ. Nếu production scale lớn, thuê GPU cloud (hoặc dùng API như Cohere Rerank).

### Chi phí RAG nâng cao so với RAG đơn giản?

**Tăng khoảng 1.5-2x**, nhưng accuracy tăng 20-30% → ROI cao.

**Chi phí breakdown**:
- Embedding: giống nhau (API hoặc self-host)
- Vector DB: giống nhau
- **Thêm**: Reranking (~$1/1000 requests nếu dùng Cohere), hoặc GPU nếu self-host
- **Thêm**: Multi-hop RAG tốn thêm LLM calls (nhưng chỉ dùng cho query phức tạp)

**Tối ưu**: dùng reranking cho mọi query, nhưng multi-hop chỉ khi query phức tạp (phát hiện bằng intent classification).

### Tôi đã có chatbot RAG đơn giản, nên nâng cấp bước nào trước?

**Thứ tự priority**:

1. **Thêm reranking** → impact lớn nhất, dễ nhất (chỉ cần gọi API)
2. **Chuyển sang hybrid search** → tăng recall đáng kể
3. **Cải thiện chunking** → semantic hoặc hierarchical (tùy dữ liệu)
4. **Thêm metadata** cho chunks (source, date, author)
5. **Multi-hop** (nếu domain thật sự phức tạp)

Làm từng bước, đo evaluation sau mỗi bước → chỉ tiếp tục nếu metrics cải thiện.

### RAG có thay thế được fine-tuning không?

**Không hoàn toàn**. [RAG và fine-tuning giải quyết vấn đề khác nhau](/blog/fine-tuning-vs-rag-khi-nao-dung/):
- **RAG**: thêm kiến thức động, dễ update, không cần retrain
- **Fine-tuning**: thay đổi hành vi model, giọng văn, style

**Best practice**: RAG cho knowledge, fine-tuning cho behavior. Ví dụ: fine-tune model để trả lời theo style công ty, nhưng dùng RAG để lấy thông tin sản phẩm.

### Tôi có thể dùng RAG với local LLM không?

**Hoàn toàn được**. [Local LLM](/blog/local-llm-chay-ai-tren-may-tinh-ca-nhan-2026/) như Llama 3, Mistral, Qwen chạy tốt với RAG:
- Embedding: dùng `sentence-transformers` (chạy local)
- Vector DB: Qdrant / Chroma (local)
- Reranker: `bge-reranker` (local)
- LLM: Ollama / llama.cpp

**Lưu ý**: local LLM yếu hơn GPT-4 về reasoning → cần cung cấp context rất rõ ràng, ngắn gọn. Chunking và reranking càng quan trọng.

## Đọc thêm:

- [Embeddings & Vector Database: Nền Tảng Của AI Hiểu Ngữ Nghĩa](/blog/embeddings-vector-database-co-ban/) — Hiểu sâu về embedding và vector DB, nền tảng của RAG.
- [Xây Chatbot AI Riêng Cho Website: Hướng Dẫn Từ A-Z](/blog/xay-chatbot-rieng-cho-website/) — Ứng dụng RAG để xây chatbot thực tế cho website.
- [Semantic Caching Trong LLM: Tiết Kiệm 90% Chi Phí API AI](/blog/semantic-caching-trong-llm/) — Tối ưu chi phí RAG bằng caching thông minh.
