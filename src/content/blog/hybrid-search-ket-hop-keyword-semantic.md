---
title: "Hybrid Search: Kết Hợp Keyword & Semantic Search Cho Kết Quả Tốt Nhất"
description: "Hybrid search kết hợp tìm kiếm từ khóa truyền thống (BM25) và semantic search (vector) để cho kết quả chính xác và đầy đủ hơn. Hướng dẫn cách triển khai cho RAG system."
pubDate: 2026-09-27
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-hybrid-search-ket-hop-keyword-semantic.webp"
draft: false
---

**Hybrid search** kết hợp **keyword search** (BM25, Elasticsearch) và **semantic search** (vector embeddings) để cho kết quả vừa chính xác về từ khóa, vừa hiểu đúng ngữ nghĩa. Đặc biệt quan trọng khi xây dựng RAG (Retrieval-Augmented Generation) system cho chatbot hoặc AI assistant.

Thay vì chọn một trong hai, hybrid search lấy điểm mạnh của cả hai. Keyword search bắt được từ chuyên môn, tên riêng, số hiệu chính xác. Semantic search hiểu được câu hỏi tương đồng dù dùng từ khác. Trộn điểm (score fusion) hoặc re-rank, ta có kết quả tốt hơn đáng kể.

## Tại Sao Cần Hybrid Search?

Mỗi phương pháp tìm kiếm đều có giới hạn riêng:

**Keyword search (BM25/TF-IDF)**:
- Ưu: bắt chính xác từ khóa, tên riêng, mã số, thuật ngữ kỹ thuật
- Nhược: không hiểu ngữ nghĩa — "laptop gaming" ≠ "máy tính chơi game"

**Semantic search (vector embeddings)**:
- Ưu: hiểu ngữ nghĩa, tìm được câu hỏi/tài liệu tương đồng dù từ khác
- Nhược: đôi khi miss từ chuyên môn chính xác, dễ trả về kết quả gần nghĩa nhưng sai chi tiết

**Hybrid search** bù trừ cho nhau: kết quả chính xác (BM25) + đầy đủ ngữ nghĩa (vector) = tìm kiếm tốt nhất.

## Cách Hoạt Động

Quy trình hybrid search cơ bản:

1. **Index dữ liệu song song**: mỗi document được index cả hai kiểu
   - BM25/inverted index (Elasticsearch, Meilisearch, Typesense)
   - Vector index (Pinecone, Weaviate, Qdrant, pgvector)

2. **Query song song**: khi user hỏi, chạy cả hai:
   - BM25 search → top K kết quả với điểm BM25
   - Vector search → top K kết quả với điểm cosine similarity

3. **Score fusion**: trộn hai danh sách kết quả
   - **RRF (Reciprocal Rank Fusion)**: công thức đơn giản, không cần normalize điểm
     ```
     score(doc) = sum(1 / (k + rank_bm25(doc)), 1 / (k + rank_vector(doc)))
     ```
     k thường = 60; rank càng cao (1, 2, 3...) điểm càng lớn
   - **Weighted sum**: normalize điểm rồi trộn theo trọng số
     ```
     score = alpha * norm(bm25_score) + (1-alpha) * norm(vector_score)
     ```
     alpha = 0.5 là cân bằng; tùy use case điều chỉnh

4. **Re-rank (optional)**: dùng cross-encoder (BERT, T5) chấm lại top N kết quả để sắp xếp cuối cùng

Kết quả cuối: danh sách document ranked tốt nhất, vừa chính xác vừa hiểu ngữ nghĩa.

## Ví Dụ Triển Khai

### Với Weaviate (built-in hybrid)

Weaviate hỗ trợ hybrid search ngay:

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

response = (
    client.query
    .get("Article", ["title", "content"])
    .with_hybrid(
        query="laptop gaming giá rẻ",
        alpha=0.5  # 0=chỉ keyword, 1=chỉ vector, 0.5=cân bằng
    )
    .with_limit(10)
    .do()
)
```

`alpha=0.5` là hybrid cân bằng; tăng lên 0.7-0.8 nếu semantic quan trọng hơn.

### Với Qdrant + custom fusion

Nếu vector DB chưa có built-in hybrid, tự code:

```python
from qdrant_client import QdrantClient
from rank_bm25 import BM25Okapi

# 1. BM25 search (offline index)
corpus = [doc["text"] for doc in documents]
tokenized = [doc.split() for doc in corpus]
bm25 = BM25Okapi(tokenized)
bm25_scores = bm25.get_scores(query.split())
bm25_top = sorted(enumerate(bm25_scores), key=lambda x: -x[1])[:20]

# 2. Vector search
client = QdrantClient("localhost", port=6333)
vector_results = client.search(
    collection_name="docs",
    query_vector=embed(query),
    limit=20
)

# 3. RRF fusion
def rrf_fusion(bm25_ranks, vector_ranks, k=60):
    scores = {}
    for rank, (doc_id, _) in enumerate(bm25_ranks, 1):
        scores[doc_id] = scores.get(doc_id, 0) + 1/(k + rank)
    for rank, result in enumerate(vector_ranks, 1):
        doc_id = result.id
        scores[doc_id] = scores.get(doc_id, 0) + 1/(k + rank)
    return sorted(scores.items(), key=lambda x: -x[1])

final = rrf_fusion(bm25_top, vector_results)
```

RRF đơn giản, hiệu quả, không cần tune nhiều.

## Khi Nào Dùng Hybrid Search?

**Dùng hybrid** khi:
- Dữ liệu chứa cả text tự nhiên LẪN thuật ngữ/tên riêng chính xác (docs kỹ thuật, medical, legal)
- User query vừa có keyword cụ thể vừa có câu hỏi ngữ nghĩa ("iPhone 15 Pro Max có pin tốt không?")
- RAG system cần độ chính xác cao — chatbot, Q&A enterprise
- So sánh A/B thấy semantic-only miss quá nhiều keyword match

**Chỉ dùng semantic** khi:
- Text hoàn toàn tự nhiên, ít thuật ngữ (blog cá nhân, review, chat)
- User query luôn là câu hỏi mở ("cách làm bánh ngon")
- Không có BM25 infrastructure sẵn

**Chỉ dùng keyword** khi:
- Tìm kiếm structured data (logs, database records)
- Query ngắn, keyword-heavy ("error 404", "invoice #12345")

Với RAG production, hybrid là baseline tốt nhất. A/B test rồi điều chỉnh alpha theo traffic thật.

## So Sánh Kết Quả Thực Tế

Benchmark trên MS MARCO dataset (question answering):

| Phương pháp | MRR@10 | Recall@100 |
|-------------|--------|------------|
| BM25 alone | 0.187 | 0.853 |
| Dense vector (SBERT) | 0.330 | 0.958 |
| **Hybrid (RRF)** | **0.352** | **0.971** |
| Hybrid + re-rank | **0.389** | 0.971 |

Hybrid thắng cả hai phương pháp đơn lẻ. Thêm re-rank nữa, kết quả càng tốt.

Trên production RAG của một dự án fintech (docs tiếng Việt):
- Semantic-only: 72% câu trả lời đúng context
- BM25-only: 65%
- **Hybrid (alpha=0.6)**: **84%**

Cải thiện rõ rệt, đặc biệt với câu hỏi chứa số liệu + ngữ nghĩa.

## Công Cụ Hỗ Trợ Hybrid Search

| Tool | Hybrid built-in? | Cách dùng |
|------|------------------|-----------|
| **Weaviate** | ✅ | `.with_hybrid(alpha=...)` |
| **Qdrant** | ✅ (v1.7+) | Fusion API |
| **Pinecone** | ✅ (sparse-dense) | Hybrid index |
| **Milvus** | ✅ | Hybrid search |
| **Elasticsearch** | ✅ | `_knn_search` + `query` combined |
| **pgvector** | ❌ | Custom RRF code |
| **ChromaDB** | ❌ | Custom |

Nếu vector DB chưa hỗ trợ, tự code RRF như ví dụ trên — logic đơn giản, chạy nhanh.

## Best Practices

1. **Bắt đầu với alpha=0.5**, sau đó A/B test điều chỉnh:
   - alpha > 0.5: semantic nặng hơn (câu hỏi tự nhiên)
   - alpha < 0.5: keyword nặng hơn (query có thuật ngữ)

2. **Dùng RRF thay vì weighted sum** nếu không muốn tune nhiều — RRF robust hơn, ít nhạy cảm với scale của điểm.

3. **Re-rank top 20-50 kết quả** bằng cross-encoder nếu budget cho phép — cải thiện thêm 5-10%.

4. **Monitor từng phương pháp riêng** (log BM25 hits và vector hits) để debug khi kết quả không tốt.

5. **Tokenize đúng ngôn ngữ** cho BM25 — tiếng Việt cần word segmentation (VnCoreNLP, pyvi) thay vì split space.

## Hạn Chế

- **Infrastructure phức tạp hơn**: cần maintain cả BM25 index lẫn vector index
- **Latency cao hơn**: query hai hệ thống + fusion thêm ~10-30ms
- **Tune alpha**: cần A/B test để tìm giá trị tối ưu cho từng use case
- **Cost tăng**: vector index tốn RAM/storage nhiều hơn keyword-only

Với RAG production, trade-off này đáng giá — chất lượng kết quả tăng rõ rệt.

## FAQ

### Hybrid search khác gì multi-stage retrieval?

**Hybrid search** trộn điểm của keyword + semantic ở cùng một stage.

**Multi-stage retrieval** chạy tuần tự: stage 1 lấy nhiều (BM25), stage 2 re-rank bằng semantic. Cả hai đều hiệu quả, có thể kết hợp (hybrid ở stage 1, re-rank ở stage 2).

### Alpha bao nhiêu là tốt?

Không có con số chung — phụ thuộc data và query pattern. Baseline alpha=0.5, sau đó:
- Nếu user query nhiều keyword cụ thể → giảm xuống 0.3-0.4
- Nếu user query câu hỏi tự nhiên → tăng lên 0.6-0.7
- A/B test trên traffic thật

### Có cần embedding model tốt không?

Có — semantic search chỉ tốt nếu embedding model tốt. Dùng model SOTA như:
- `multilingual-e5-large` (đa ngôn ngữ, 560M params)
- `bge-large-en-v1.5` (tiếng Anh)
- `VnCoreNLP` embeddings (tiếng Việt)

Embedding kém → semantic search kém → hybrid không cứu được.

### Làm sao biết hybrid có tốt hơn không?

**Offline eval**: benchmark trên test set (MRR, NDCG, Recall@K).

**Online A/B test**: chia traffic 50/50, đo:
- Click-through rate (CTR)
- Time to answer
- User satisfaction (thumbs up/down)

Thường hybrid thắng semantic-only 5-15% trên production metrics.

## Kết Luận

Hybrid search là **best practice** hiện tại cho RAG system và search engine cần độ chính xác cao. Kết hợp keyword (BM25) và semantic (vector) cho kết quả vừa chính xác từ khóa, vừa hiểu ngữ nghĩa — đặc biệt quan trọng với dữ liệu chứa thuật ngữ chuyên môn hoặc tên riêng.

Triển khai đơn giản nhất: dùng vector DB có built-in hybrid (Weaviate, Qdrant, Pinecone), set alpha=0.5 làm baseline, sau đó A/B test điều chỉnh. Nếu DB chưa hỗ trợ, tự code RRF fusion — logic đơn giản nhưng hiệu quả cao.

Đầu tư thêm infrastructure cho hybrid search hoàn toàn xứng đáng với cải thiện chất lượng kết quả 10-20% trên production.

**Đọc thêm:**

- [Embeddings & Vector Database: Nền Tảng Của AI Hiểu Ngữ Nghĩa](/blog/embeddings-vector-database-co-ban/) — để hiểu rõ hơn về semantic search và vector embeddings
- [RAG Nâng Cao: Xây Dựng Hệ Thống Q&A Thông Minh Từ Dữ Liệu Riêng](/blog/rag-nang-cao-xay-dung-he-thong-qa-thong-minh/) — áp dụng hybrid search vào RAG pipeline
- [Fine-tuning Hay RAG? Khi Nào Dùng Cái Nào](/blog/fine-tuning-vs-rag-khi-nao-dung/) — so sánh các phương pháp tùy chỉnh AI cho domain riêng
