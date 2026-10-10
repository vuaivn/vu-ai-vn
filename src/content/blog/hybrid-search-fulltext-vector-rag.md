---
title: "Hybrid Search: Kết Hợp Full-text & Vector Search Cho RAG Chính Xác Hơn"
description: "Hybrid search kết hợp BM25 và vector search giúp RAG chính xác hơn 30-40%. Hướng dẫn chi tiết cách implement và khi nào nên dùng."
pubDate: 2026-10-10
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-hybrid-search-fulltext-vector-rag.webp"
draft: false
---

**Hybrid search kết hợp BM25 (full-text) và vector search để RAG tìm đúng thông tin hơn 30-40% so với chỉ dùng vector. Cơ chế: BM25 bắt từ khóa chính xác, vector nắm ngữ nghĩa, RRF gộp kết quả. Dùng khi cần độ chính xác cao với dữ liệu nhiều thuật ngữ chuyên ngành.**

## Tại Sao Vector Search Đơn Thuần Không Đủ?

Bạn build hệ thống RAG (Retrieval-Augmented Generation) với vector search thuần. Embedding model encode câu hỏi thành vector, tìm tài liệu gần nhất về mặt ngữ nghĩa. Nghe hoàn hảo.

Cho đến khi user hỏi "React 18.2 có tính năng gì mới?", hệ thống trả về tài liệu về React 17 hoặc Vue 3. Tại sao? Vì chúng "gần về ngữ nghĩa" — cả hai đều là framework JavaScript. Nhưng **sai phiên bản, sai framework**. Hoàn toàn sai.

Vector search yếu ở:
- **Số chính xác**: "React 18.2" vs "React 18.3" — vector gần như giống nhau
- **Tên riêng**: "PostgreSQL" vs "MySQL" — ngữ nghĩa gần (cả hai đều RDBMS) nhưng là 2 công nghệ khác
- **Từ khoá hiếm**: thuật ngữ chuyên ngành, mã lỗi, tên API — ít xuất hiện trong corpus huấn luyện embedding

**Full-text search** (BM25, TF-IDF) bắt **từ khóa chính xác**. "React 18.2" chỉ match "React 18.2". Không nhầm. Không gần.

Hybrid search kết hợp cả hai. Vector hiểu ý. Full-text bắt từ. Chính xác hơn 30-40%.

## Hybrid Search Hoạt Động Thế Nào?

### Kiến Trúc 3 Bước

1. **Parallel retrieval** — chạy đồng thời:
   - Vector search: embedding query → tìm top K chunks gần nhất (cosine similarity)
   - Full-text search: BM25 → tìm top K chunks match từ khóa tốt nhất
2. **Fusion** — gộp 2 danh sách bằng **Reciprocal Rank Fusion (RRF)**:
   ```
   score(doc) = α × vector_score + β × bm25_score
   # Hoặc RRF chuẩn:
   rrf(doc) = Σ 1/(k + rank_i)  # k=60 thường dùng
   ```
3. **Rerank** (optional) — cross-encoder đánh giá lại top N để chọn M cuối (M < N)

### Công Thức RRF (Reciprocal Rank Fusion)

```python
def rrf_score(doc_id, rankings, k=60):
    score = 0
    for ranking in rankings:  # rankings = [vector_results, bm25_results]
        if doc_id in ranking:
            rank = ranking.index(doc_id) + 1  # 1-indexed
            score += 1 / (k + rank)
    return score
```

**k=60** là hằng số phổ biến (theo paper RRF gốc). Rank càng cao (top 1, 2, 3...) → điểm càng lớn. Document xuất hiện trong **cả 2 ranking** được boost mạnh.

### Ví Dụ Cụ Thể

Query: "PostgreSQL index B-tree performance"

**Vector search top 3**:
1. "How B-tree indexes improve query speed" (cosine: 0.89)
2. "Database indexing best practices" (cosine: 0.85)
3. "MySQL vs PostgreSQL comparison" (cosine: 0.82)

**BM25 search top 3**:
1. "PostgreSQL B-tree index internals" (BM25: 12.3)
2. "PostgreSQL index types: B-tree, GIN, GiST" (BM25: 10.1)
3. "How B-tree indexes improve query speed" (BM25: 8.7)

**RRF fusion** (k=60):
- Doc "PostgreSQL B-tree index internals": 1/(60+2) ≈ 0.016 (BM25 rank 1) → **0.016**
- Doc "How B-tree indexes...": 1/(60+1) + 1/(60+3) ≈ 0.016 + 0.016 = **0.032** ← winner (xuất hiện cả 2)
- Doc "PostgreSQL index types": 1/(60+2) ≈ **0.016**

Kết quả: "How B-tree indexes..." lên top vì match **cả ngữ nghĩa lẫn từ khóa**.

## Khi Nào Dùng Hybrid Search?

### ✅ Nên Dùng Khi:

1. **Dữ liệu chứa thuật ngữ chuyên ngành**
   - Tài liệu kỹ thuật (API docs, error codes)
   - Y khoa, luật pháp (tên bệnh, điều khoản)
   - Sản phẩm (mã SKU, tên model)

2. **Cần độ chính xác cao**
   - Customer support (phải trả đúng vấn đề)
   - Compliance (không được nhầm quy định)

3. **User có thể search cụ thể hoặc mơ hồ**
   - Cụ thể: "iPhone 15 Pro Max 256GB" → BM25 bắt chính xác
   - Mơ hồ: "điện thoại chụp ảnh đẹp" → vector nắm ý định

4. **Corpus đa dạng ngôn ngữ/domain**
   - Vector search yếu khi embedding model không được train trên domain đó
   - BM25 language-agnostic, bắt từ khóa bất kể domain

### ❌ Không Cần Khi:

- Dữ liệu đồng nhất, ít thuật ngữ (blog cá nhân, novel)
- Chỉ cần semantic search (recommendation, similarity)
- Corpus nhỏ (<1000 docs) — overhead fusion không xứng

### So Sánh Hiệu Suất (Benchmark Thực Tế)

Đừng chỉ tin lý thuyết. Pinecone test trên dataset BeIR (2024):

| Method | nDCG@10 | Recall@10 | Latency |
|--------|---------|-----------|---------|
| Vector only | 0.52 | 0.68 | 45ms |
| BM25 only | 0.48 | 0.61 | 12ms |
| **Hybrid (RRF)** | **0.64** | **0.79** | 58ms |
| Hybrid + rerank | **0.71** | 0.82 | 180ms |

Hybrid search tăng **23% nDCG, 16% recall** so với vector thuần, đổi lại thêm ~13ms latency (chấp nhận được).

## Implement Hybrid Search: Code Thực Tế

### Setup Vector Store Hỗ Trợ Hybrid (Qdrant)

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, HnswConfig

client = QdrantClient(host="localhost", port=6333)

# Tạo collection với sparse vector cho BM25
client.create_collection(
    collection_name="docs_hybrid",
    vectors_config={
        "dense": VectorParams(
            size=1536,  # OpenAI ada-002
            distance=Distance.COSINE,
            hnsw_config=HnswConfig(m=16, ef_construct=100)
        )
    },
    sparse_vectors_config={
        "text": {  # BM25 sparse vector
            "index": {
                "on_disk": False
            }
        }
    }
)
```

### Index Documents

```python
from qdrant_client.models import PointStruct, SparseVector
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
import numpy as np

# Embedding model
encoder = SentenceTransformer('all-MiniLM-L6-v2')

docs = [
    "PostgreSQL B-tree index internals explained",
    "How to optimize MySQL query performance",
    # ... hàng ngàn docs
]

# Tokenize for BM25
tokenized_docs = [doc.lower().split() for doc in docs]
bm25 = BM25Okapi(tokenized_docs)

points = []
for idx, doc in enumerate(docs):
    # Dense vector
    dense_vec = encoder.encode(doc).tolist()
    
    # Sparse vector (BM25 weights)
    tokens = tokenized_docs[idx]
    sparse_vec = bm25.get_scores(tokens)
    
    points.append(PointStruct(
        id=idx,
        vector={
            "dense": dense_vec,
            "text": SparseVector(
                indices=np.nonzero(sparse_vec)[0].tolist(),
                values=sparse_vec[np.nonzero(sparse_vec)].tolist()
            )
        },
        payload={"text": doc}
    ))

client.upsert(collection_name="docs_hybrid", points=points)
```

### Query Hybrid Search

```python
from qdrant_client.models import SearchRequest, Prefetch

query = "PostgreSQL index B-tree performance"
query_vec = encoder.encode(query).tolist()
query_tokens = query.lower().split()
query_sparse = bm25.get_scores(query_tokens)

# Hybrid search với RRF
results = client.query_points(
    collection_name="docs_hybrid",
    prefetch=[
        # Vector search
        Prefetch(
            query=query_vec,
            using="dense",
            limit=20
        ),
        # BM25 search
        Prefetch(
            query=SparseVector(
                indices=np.nonzero(query_sparse)[0].tolist(),
                values=query_sparse[np.nonzero(query_sparse)].tolist()
            ),
            using="text",
            limit=20
        )
    ],
    query=FusionQuery(fusion="rrf"),  # RRF fusion
    limit=5
)

for hit in results:
    print(f"{hit.score:.3f} | {hit.payload['text']}")
```

### Alternative: Weaviate Hybrid Search

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

# Query hybrid (alpha = 0.5 → 50% vector, 50% BM25)
result = client.query.get("Document", ["text"]) \
    .with_hybrid(
        query="PostgreSQL index performance",
        alpha=0.5  # 0=pure BM25, 1=pure vector
    ) \
    .with_limit(5) \
    .do()
```

## Tuning Hybrid Search: Alpha Parameter

**Alpha** (α) điều chỉnh tỷ trọng vector vs BM25:

```
final_score = α × vector_score + (1-α) × bm25_score
```

- **α = 0**: pure BM25 (chỉ từ khóa)
- **α = 0.5**: cân bằng
- **α = 1**: pure vector (chỉ ngữ nghĩa)

**Cách chọn α**:

| Loại Query | α Recommended | Lý Do |
|------------|---------------|-------|
| Thuật ngữ chính xác ("error 404") | 0.3 | Ưu tiên BM25 |
| Câu hỏi mở ("làm sao tăng hiệu suất?") | 0.7 | Ưu tiên ngữ nghĩa |
| Mix (tên sản phẩm + mô tả) | 0.5 | Cân bằng |

**A/B test** để tìm α tối ưu cho domain của bạn. Track metric: **nDCG@5** (normalized Discounted Cumulative Gain top 5 results).

## Reranking: Bước Cuối Tăng Độ Chính Xác

Hybrid search cho ~50 candidates. **Reranker** (cross-encoder) đánh giá lại chính xác hơn.

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

# Hybrid search → 50 candidates
candidates = hybrid_search(query, top_k=50)

# Rerank → top 5
pairs = [[query, doc['text']] for doc in candidates]
scores = reranker.predict(pairs)

reranked = sorted(
    zip(candidates, scores),
    key=lambda x: x[1],
    reverse=True
)[:5]
```

**Trade-off**:
- ✅ Tăng 10-15% accuracy
- ❌ Latency x3-4 (cross-encoder chậm hơn bi-encoder)

→ Dùng rerank khi **độ chính xác quan trọng hơn tốc độ** (legal, medical).

## Chi Phí & Performance

### Latency Breakdown (1000 docs)

| Component | Latency | % Total |
|-----------|---------|---------|
| Vector search | 35ms | 40% |
| BM25 search | 18ms | 20% |
| RRF fusion | 5ms | 6% |
| Rerank (optional) | 120ms | 138% |
| **Total (no rerank)** | **58ms** | — |
| **Total (with rerank)** | **178ms** | — |

### Storage Cost

- **Vector-only**: 4 bytes × dimensions × docs
  - 1M docs × 1536 dims = 6.1GB
- **Hybrid**: thêm ~20% cho BM25 sparse vectors
  - 1M docs = 6.1GB + 1.2GB = **7.3GB**

### Compute Cost

- Index time: +15% (phải build cả BM25 index)
- Query time: +29% (2 searches song song)

→ Đổi **7% storage + 29% latency** lấy **+23% accuracy** — xứng với production.

## Best Practices

### 1. Preprocessing Cho BM25

BM25 nhạy với **tokenization**. Best practices:

```python
import re
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

def preprocess_bm25(text):
    # Lowercase
    text = text.lower()
    # Xóa ký tự đặc biệt (giữ số)
    text = re.sub(r'[^a-z0-9\s]', '', text)
    # Tokenize
    tokens = text.split()
    # Remove stopwords (optional — test xem có tốt hơn không)
    # tokens = [t for t in tokens if t not in stopwords.words('english')]
    # Stemming (optional)
    # stemmer = PorterStemmer()
    # tokens = [stemmer.stem(t) for t in tokens]
    return tokens
```

**Chú ý**: Với tiếng Việt, dùng `pyvi` để tokenize đúng.

### 2. Chunk Size Optimization

Hybrid search hoạt động tốt với **chunk 200-400 tokens**:
- Quá ngắn (<100): BM25 thiếu context
- Quá dài (>500): vector search mất focus

### 3. Monitor & Tune

Track metrics:
- **Precision@K**: bao nhiêu % top K là relevant?
- **nDCG@K**: ranking quality
- **Latency p95**: 95% requests ≤ X ms

A/B test α parameter mỗi 2-4 tuần.

### 4. Fallback Strategy

```python
def search_with_fallback(query):
    # 1. Try hybrid
    results = hybrid_search(query, min_score=0.7)
    if len(results) >= 3:
        return results
    
    # 2. Fallback: pure vector (broader)
    results = vector_search(query, min_score=0.6)
    if len(results) >= 1:
        return results
    
    # 3. Last resort: BM25 (catch exact keywords)
    return bm25_search(query)
```

## So Sánh Các Vector Store Hỗ Trợ Hybrid

| Vector DB | Hybrid Support | Method | Ease of Use |
|-----------|----------------|--------|-------------|
| **Qdrant** | ✅ Native | RRF, custom fusion | ⭐⭐⭐⭐⭐ |
| **Weaviate** | ✅ Native | Alpha blend | ⭐⭐⭐⭐⭐ |
| **Pinecone** | ✅ (beta) | Sparse-dense | ⭐⭐⭐⭐ |
| **Milvus** | ❌ → manual | DIY RRF | ⭐⭐⭐ |
| **Chroma** | ❌ → manual | DIY RRF | ⭐⭐ |

**Khuyến nghị**: Qdrant hoặc Weaviate cho hybrid production-ready.

## Case Study: RAG Chatbot Y Khoa

**Vấn đề**: Chatbot tư vấn y khoa trả lời sai thuốc vì vector search nhầm "Paracetamol 500mg" với "Ibuprofen 400mg" (cả hai đều giảm đau).

**Giải pháp**: Hybrid search với α=0.3 (ưu tiên BM25 cho tên thuốc).

**Kết quả**:
- Độ chính xác tên thuốc: 71% → **94%**
- Latency: 42ms → 59ms (+40% chấp nhận được)
- User satisfaction: 3.2/5 → 4.6/5

**Key insight**: BM25 bắt **exact match** tên thuốc, vector search bắt **triệu chứng liên quan** → kết hợp = chính xác.

## Kết Luận

Hybrid search không phải trend — là **best practice cho RAG production**. Khi nào dùng:

- ✅ Dữ liệu chứa thuật ngữ chuyên ngành, số chính xác
- ✅ Cần độ chính xác cao (support, compliance)
- ✅ User search cả cụ thể lẫn mơ hồ

Trade-off: +7% storage, +29% latency, đổi lấy **+23% accuracy**.

Bắt đầu với **α=0.5**, A/B test, track nDCG@5. Rerank nếu cần thêm 10-15% accuracy.

Vector search đơn thuần đủ cho 70% use case. 30% còn lại — nơi độ chính xác quyết định — hybrid search là sự khác biệt giữa "hoạt động" và "hoạt động TỐT".

## FAQ

### Hybrid search tốn RAM hơn vector-only bao nhiêu?

Thêm ~20% cho BM25 sparse vectors. Ví dụ: 1M docs × 1536 dims = 6.1GB (vector) + 1.2GB (BM25) = 7.3GB total. Sparse vector chiếm ít vì chỉ lưu non-zero weights.

### BM25 có hoạt động với tiếng Việt không?

Có, nhưng cần tokenizer đúng (pyvi, underthesea). Tiếng Việt không có space ngăn từ như tiếng Anh → tokenize sai = BM25 sai. Ví dụ: "học máy" phải thành ["học_máy"], không phải ["học", "máy"].

### Khi nào dùng reranker?

Khi độ chính xác quan trọng hơn tốc độ: legal (nhầm điều luật = rủi ro), medical (nhầm thuốc = nguy hiểm), finance (nhầm số liệu = mất tiền). Rerank tăng 10-15% accuracy nhưng latency x3-4.

### Alpha = bao nhiêu cho ecommerce search?

α=0.4-0.5. User vừa search cụ thể (SKU, tên sản phẩm) vừa mơ hồ ("áo thun nam đẹp"). A/B test: track CTR top 3 results, chọn α cho CTR cao nhất.

### Hybrid search scale được đến bao nhiêu documents?

10M+ docs không vấn đề với Qdrant/Weaviate. Bottleneck là **index time** (build BM25 cho 10M docs ~20-30 phút), không phải query time. Query vẫn <100ms với HNSW + BM25 index tối ưu.

**Đọc thêm:**
- [RAG Nâng Cao: Xây Dựng Hệ Thống Q&A Thông Minh Từ Dữ Liệu Riêng](/blog/rag-nang-cao-xay-dung-he-thong-qa-thong-minh/) — chi tiết RAG pipeline hoàn chỉnh, từ chunking đến monitoring production
- [Embeddings & Vector Database: Nền Tảng Của AI Hiểu Ngữ Nghĩa](/blog/embeddings-vector-database-co-ban/) — cơ chế vector search, các loại embedding model và khi nào dùng gì
- [GraphRAG: Kết Hợp Graph Database & RAG Cho AI Thông Minh Hơn](/blog/graphrag-ket-hop-graph-database-rag/) — nâng cấp RAG bằng knowledge graph để nắm quan hệ giữa entities
