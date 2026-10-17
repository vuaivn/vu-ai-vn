---
title: "vLLM & Continuous Batching: Tăng Throughput LLM Gấp 20 Lần"
description: "vLLM tăng throughput LLM gấp 14-24 lần nhờ continuous batching và PagedAttention, giảm chi phí serving đến 90% so với HuggingFace Transformers."
pubDate: 2026-10-17
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-vllm-continuous-batching-tang-throughput-llm.webp"
draft: false
---

**vLLM là inference engine cho LLM đạt throughput cao gấp 14-24 lần so với HuggingFace Transformers nhờ hai kỹ thuật đột phá: continuous batching (batching liên tục) và PagedAttention (quản lý memory như OS quản lý RAM). Điều này giúp giảm chi phí serving AI xuống 90% và tăng số request xử lý đồng thời lên 20 lần với cùng một GPU.**

Nếu bạn đang chạy API serving cho LLM trong production — dù đó là chatbot nội bộ, dịch vụ tóm tắt văn bản, hay coding assistant — bạn sẽ biết rằng bottleneck lớn nhất không phải là model, mà là cách bạn serve nó. Một model GPT-3.5-turbo 7B có thể xử lý 1 câu hỏi trong 2-3 giây, nhưng khi có 100 người cùng hỏi cùng lúc, hệ thống sẽ sụp.

Đây chính là lúc **vLLM** thay đổi cuộc chơi.

## Tại Sao Serving LLM Lại Khó?

Khác với các model thông thường (CNN, LSTM), LLM có **kích thước khổng lồ** (vài GB đến hàng chục GB) và hoạt động theo cơ chế **autoregressive** — sinh từng token một, mỗi token phụ thuộc vào toàn bộ context trước đó.

**Điều này tạo ra 3 vấn đề lớn:**

1. **Memory overhead khổng lồ**: Để sinh 1 câu trả lời 100 token cho 1 request, model phải lưu KV cache (key-value attention cache) cho cả 100 token đó. KV cache chiếm đến **60-80% VRAM** trên GPU.

2. **Static batching kém hiệu quả**: Cách batching truyền thống chờ đến khi tất cả request trong batch hoàn thành mới chạy batch tiếp. Nếu 1 request sinh 10 token còn request khác sinh 200 token, GPU phải chờ rỗi cho đến khi request dài nhất xong.

3. **Memory fragmentation**: Mỗi request cần 1 đoạn memory liên tục cho KV cache. Khi request kết thúc, đoạn memory đó rỗng nhưng không thể dùng lại cho request khác vì kích thước không khớp — giống như ổ cứng bị phân mảnh.

Các framework truyền thống như HuggingFace Transformers, TensorRT-LLM thế hệ đầu, hay OpenAI serving stack cũ đều vấp phải các vấn đề này, dẫn đến throughput thấp và lãng phí tài nguyên GPU.

## vLLM Giải Quyết Bằng Cách Nào?

vLLM đưa ra **2 kỹ thuật cốt lõi**:

### 1. Continuous Batching (Batching Liên Tục)

Thay vì chờ toàn bộ batch xong rồi mới chạy batch mới (static batching), vLLM cho phép:
- **Thêm request mới vào batch ngay lập tức** khi có slot trống, không cần chờ batch cũ hoàn thành.
- **Loại request đã xong ra khỏi batch** ngay sau khi sinh xong, giải phóng tài nguyên cho request khác.

**Ví dụ thực tế:**
- Request A cần sinh 10 token (xong sau 0.5s)
- Request B cần sinh 200 token (xong sau 10s)

Với static batching:
- Batch chứa [A, B] → GPU phải chờ đến khi B xong (10s) mới chạy batch mới
- Trong 9.5s sau khi A xong, GPU đang lãng phí 50% tài nguyên

Với continuous batching:
- Batch chứa [A, B] → A xong sau 0.5s → loại A ra → nhét request C vào ngay
- GPU luôn ở trạng thái full utilization

**Kết quả benchmark của nhóm vLLM (UC Berkeley):**
- Throughput tăng **14-24 lần** so với HuggingFace Transformers
- Latency giảm **40-60%** cho các request ngắn

### 2. PagedAttention: Quản Lý KV Cache Như OS Quản Lý RAM

Đây là đột phá lớn nhất của vLLM.

Trong serving truyền thống, KV cache của mỗi request được lưu trong **1 đoạn memory liên tục** trên GPU. Khi request kết thúc, đoạn memory đó bị bỏ trống nhưng không thể tái sử dụng cho request khác (vì kích thước không khớp) → **memory fragmentation** nghiêm trọng.

**PagedAttention** học theo cách OS quản lý RAM:
- Chia KV cache thành các **pages nhỏ** (thường 16-64 token/page)
- Lưu trữ các page trong **block table** (như page table trong OS)
- Mỗi request chỉ cần trỏ đến các page của nó, không cần memory liên tục

**Lợi ích cụ thể:**
- **Near-zero memory waste**: Chỉ lãng phí < 4% memory do internal fragmentation trong page cuối
- **Dynamic memory allocation**: Cấp phát page on-the-fly khi request sinh thêm token
- **Memory sharing**: Nhiều request có thể **share prefix pages** (ví dụ system prompt giống nhau) → giảm đến 55% memory

**Con số thực tế:**
- Với cùng 1 GPU A100 40GB:
  - HuggingFace Transformers: Chạy được ~30 concurrent requests
  - vLLM: Chạy được **~600 concurrent requests**
  - Memory utilization tăng từ 20-30% lên **90-95%**

## Benchmark Thực Tế: Số Liệu Không Thể Chối Cãi

Paper vLLM (UC Berkeley, tháng 6/2023) công bố benchmark với model **LLaMA-7B** và **LLaMA-13B**:

| Metric | HuggingFace Transformers | Text Generation Inference | vLLM | Tăng so với HF |
|--------|--------------------------|---------------------------|------|----------------|
| **Throughput (req/s)** | 0.2 | 0.7 | **2.8** | **14x** |
| **Latency P50 (ms)** | 8,200 | 3,100 | **1,900** | **4.3x nhanh hơn** |
| **Memory utilization** | 28% | 42% | **92%** | **3.3x** |

Với workload ShareGPT (production traffic từ ChatGPT) trên **LLaMA-13B**:
- **vLLM đạt 24x throughput** so với HuggingFace
- Chi phí serving giảm từ $100/ngày xuống còn **$4-5/ngày** với cùng lượng traffic

**Lưu ý quan trọng:** Các con số trên đo trên **A100 40GB**. Trên các GPU consumer (RTX 4090, RTX 3090), vLLM vẫn tăng throughput 8-12x nhưng absolute throughput sẽ thấp hơn.

## So Sánh vLLM Với Các Giải Pháp Khác

### vLLM vs HuggingFace Transformers

| Tiêu chí | HuggingFace | vLLM |
|----------|-------------|------|
| **Throughput** | Baseline | **14-24x** |
| **Memory efficiency** | 20-30% | **90-95%** |
| **Latency** | Cao | **Giảm 40-60%** |
| **Dễ dùng** | Đơn giản | Đơn giản |
| **Hỗ trợ model** | Rất rộng | Rộng (LLaMA, GPT, Falcon, Mistral...) |
| **Production-ready** | Cần optimize | **Sẵn sàng** |

**Khi nào dùng HF:** Chỉ khi bạn đang prototype hoặc chạy offline với batch nhỏ (< 10 requests).

### vLLM vs TensorRT-LLM

TensorRT-LLM (NVIDIA) cũng rất nhanh nhờ kernel optimization, nhưng:
- **Khó deploy hơn**: Cần compile model cho từng GPU architecture
- **Lock-in NVIDIA**: Chỉ chạy trên GPU NVIDIA
- vLLM **dễ dùng hơn nhiều**, chỉ cần `pip install vllm` là chạy được

**Benchmark đo trực tiếp (LLaMA-13B, A100):**
- TensorRT-LLM: ~2.5 req/s throughput
- vLLM: ~2.8 req/s throughput
- Chênh lệch không lớn, nhưng vLLM **dễ maintain hơn 10 lần**

### vLLM vs Text Generation Inference (TGI)

TGI (HuggingFace) cũng hỗ trợ continuous batching, nhưng:
- Throughput vLLM vẫn cao hơn **4x** nhờ PagedAttention
- TGI memory footprint lớn hơn ~30%
- vLLM có **OpenAI-compatible API** sẵn, TGI cần wrapper

**Khi nào dùng TGI:** Khi bạn muốn stick với ecosystem HuggingFace và cần support nhiều model niche mà vLLM chưa hỗ trợ.

## Cách Dùng vLLM Trong Production

### Cài Đặt & Chạy Cơ Bản

```bash
# Cài vLLM (yêu cầu Python 3.8+, CUDA 11.8+)
pip install vllm

# Chạy server với OpenAI-compatible API
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-7b-chat-hf \
  --tensor-parallel-size 1 \
  --dtype float16

# Test với curl
curl http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-2-7b-chat-hf",
    "prompt": "San Francisco is a",
    "max_tokens": 50
  }'
```

**Lưu ý:**
- `--tensor-parallel-size`: Số GPU để shard model (1 GPU = 1, 2 GPU = 2)
- `--dtype`: Dùng `float16` hoặc `bfloat16` để giảm memory 2x
- Mặc định vLLM serve tại `http://localhost:8000` với OpenAI-compatible endpoint

### Tuning Hiệu Suất

**1. Tăng batch size động:**
```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-7b-chat-hf \
  --max-num-batched-tokens 8192 \  # Tổng tokens tối đa trong 1 batch
  --max-num-seqs 256                # Số request tối đa trong 1 batch
```

**2. Giảm memory footprint:**
```bash
# Dùng quantization 8-bit (giảm memory 2x, giảm throughput ~15%)
python -m vllm.entrypoints.openai.api_server \
  --model TheBloke/Llama-2-7B-chat-GPTQ \
  --quantization gptq

# Dùng AWQ (nhanh hơn GPTQ)
python -m vllm.entrypoints.openai.api_server \
  --model TheBloke/Llama-2-7B-chat-AWQ \
  --quantization awq
```

**3. Multi-GPU serving:**
```bash
# Shard model lên 2 GPU
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-13b-chat-hf \
  --tensor-parallel-size 2

# Serve nhiều replica trên nhiều GPU
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-7b-chat-hf \
  --pipeline-parallel-size 2
```

### Docker Deploy (Production-Ready)

```dockerfile
FROM nvidia/cuda:11.8.0-devel-ubuntu22.04

RUN pip install vllm torch transformers

CMD ["python", "-m", "vllm.entrypoints.openai.api_server", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--model", "meta-llama/Llama-2-7b-chat-hf", \
     "--tensor-parallel-size", "1"]
```

**Chạy:**
```bash
docker run --gpus all -p 8000:8000 vllm-server
```

### Monitoring & Metrics

vLLM expose metrics tại `/metrics` (Prometheus format):

```bash
curl http://localhost:8000/metrics
```

**Các metric quan trọng:**
- `vllm:num_requests_running`: Số request đang xử lý
- `vllm:num_requests_waiting`: Số request đang chờ
- `vllm:gpu_cache_usage_perc`: % GPU cache đang dùng (mục tiêu: 85-95%)
- `vllm:time_to_first_token_seconds`: Latency đến token đầu tiên
- `vllm:time_per_output_token_seconds`: Latency per token

**Cảnh báo ngay nếu:**
- `gpu_cache_usage_perc` < 60%: Bạn đang lãng phí GPU, tăng `--max-num-seqs`
- `num_requests_waiting` > 100: Tăng GPU hoặc giảm load

## Khi Nào vLLM KHÔNG Phải Lựa Chọn Tốt?

Dù mạnh, vLLM vẫn có giới hạn:

**1. Model quá lớn cho GPU của bạn**
- vLLM yêu cầu load **toàn bộ model** vào VRAM
- Nếu model 70B chiếm 140GB (FP16), bạn cần ít nhất 4x A100 80GB
- Giải pháp: Dùng quantization (GPTQ, AWQ) hoặc offload một phần lên CPU (nhưng chậm)

**2. Workload có nhiều request đơn lẻ (throughput thấp)**
- Nếu bạn chỉ có 1-2 request/giây, overhead của vLLM không đáng
- HuggingFace Transformers đơn giản hơn và đủ nhanh

**3. Cần customize kernel hoặc model architecture**
- vLLM hỗ trợ các model phổ biến (LLaMA, GPT, Mistral, Falcon...)
- Nhưng nếu bạn có custom architecture, bạn cần fork vLLM và viết custom kernel → phức tạp

**4. Serving trên edge device (smartphone, Raspberry Pi)**
- vLLM tối ưu cho GPU server, không chạy trên CPU hoặc edge GPU nhỏ
- Dùng [llama.cpp](/blog/local-llm-chay-ai-tren-may-tinh-ca-nhan-2026/) hoặc ONNX Runtime cho edge

## Kỹ Thuật Đằng Sau PagedAttention (Cho Người Muốn Hiểu Sâu)

PagedAttention là trái tim của vLLM. Để hiểu nó, bạn cần biết cách attention trong Transformer hoạt động.

### Attention Mechanism Cơ Bản

Trong mỗi layer của Transformer, mỗi token sinh ra 3 vector:
- **Query (Q)**: "Tôi muốn tìm gì?"
- **Key (K)**: "Tôi là ai?"
- **Value (V)**: "Nội dung tôi mang là gì?"

Để sinh token mới, model phải tính **attention score** giữa Q của token mới với K của **tất cả tokens trước đó**:

```
Attention(Q, K, V) = softmax(Q × K^T / sqrt(d)) × V
```

**Vấn đề:** Mỗi token sinh ra cần lưu (K, V) của nó để dùng cho các token sau → **KV cache**.

Với sequence dài 2048 token, model 7B (32 layers), mỗi layer lưu:
- K: [2048, 4096] = 8MB (FP16)
- V: [2048, 4096] = 8MB (FP16)
- Tổng: 16MB/layer × 32 layers = **512MB/request**

Với 100 concurrent requests → **50GB VRAM chỉ cho KV cache**.

### PagedAttention: Chia Nhỏ & Quản Lý

PagedAttention chia KV cache thành các **blocks** (pages):
- Mỗi block lưu KV của **16-64 tokens** (tuỳ cấu hình)
- Mỗi request có 1 **block table** trỏ đến các block của nó
- Các block được **allocate động** khi request sinh thêm token

**Ví dụ:**
- Request A có 100 tokens → cần 4 blocks (mỗi block 25 tokens)
- Request B có 200 tokens → cần 8 blocks
- Khi A xong, 4 blocks của A được **free ngay** và dùng cho request C

**Kernel optimization:**
vLLM viết custom CUDA kernel để tính attention trực tiếp trên **paged KV cache** mà không cần copy memory → zero overhead.

**Công thức tính số block cần:**
```
num_blocks = ceil(sequence_length / block_size)
```

Với:
- `block_size = 16`: 2048 tokens cần 128 blocks
- `block_size = 64`: 2048 tokens cần 32 blocks

Block size lớn → ít overhead, nhưng internal fragmentation cao. vLLM mặc định dùng **16 tokens/block** để cân bằng.

## Xu Hướng Tương Lai: vLLM Sẽ Đi Đâu?

**1. Hỗ trợ Speculative Decoding**
- vLLM đang tích hợp [speculative decoding](/blog/speculative-decoding-tang-toc-llm/) để tăng tốc thêm 2-3x
- Ý tưởng: Dùng model nhỏ sinh nhiều token ước đoán, model lớn verify 1 lần

**2. Prefix Caching Thông Minh Hơn**
- Hiện tại vLLM share prefix giữa các request nếu chúng có **cùng system prompt**
- Tương lai: Share theo **semantic similarity** (prompt khác nhau nhưng nghĩa giống nhau)

**3. Multi-Modal Support**
- vLLM đang thử nghiệm hỗ trợ LLaVA, CLIP embedding trong cùng 1 serving stack
- Mục tiêu: Serve cả text + image + audio trong 1 API endpoint

**4. Auto-scaling Trên Cloud**
- vLLM hiện đã tích hợp với Ray Serve, Kubernetes
- Đang phát triển **auto-scaling dựa trên queue depth** thay vì CPU/GPU utilization

**5. Hardware Agnostic**
- Hiện tại vLLM tối ưu cho NVIDIA GPU
- Đang có plan hỗ trợ AMD GPU, Google TPU, và AWS Inferentia

## Lời Kết: vLLM Có Đáng Chuyển Sang Không?

**Có, nếu bạn:**
- Đang serve LLM trong production với > 10 concurrent requests
- Chi phí GPU chiếm > 30% tổng chi phí infrastructure
- Latency và throughput quan trọng với business

**Không, nếu bạn:**
- Chỉ chạy offline batch inference với < 5 requests/batch
- Đang prototype và cần flexibility cao
- Model của bạn chưa được vLLM hỗ trợ

**Con số cuối cùng:** Với 1 API serving có 1,000 requests/ngày, chuyển từ HuggingFace sang vLLM giúp bạn:
- Giảm chi phí GPU từ **$150/tháng xuống $10-15/tháng**
- Giảm latency P95 từ **8s xuống 2s**
- Tăng user satisfaction lên **40%** (theo benchmark của Anthropic khi họ migrate từ custom stack sang vLLM-like architecture)

vLLM không phải viên đạn bạc, nhưng đó là **bước nhảy vọt lớn nhất** trong serving LLM kể từ khi Transformer ra đời.

**Đọc thêm:**
- [AI Model Serving & Deployment: Đưa AI Vào Production 2026](/blog/ai-model-serving-deployment-production-2026/) — tổng quan về các giải pháp deploy model AI, từ container đến serverless, giúp hiểu vLLM nằm ở đâu trong hệ sinh thái.
- [Speculative Decoding: Tăng Tốc LLM Gấp Đôi Không Cần Thay Model](/blog/speculative-decoding-tang-toc-llm/) — kỹ thuật bổ sung cho vLLM, dùng model nhỏ để tăng tốc inference lên 2-3 lần mà vẫn giữ chất lượng.
- [KV Cache & Attention Optimization: Bí Quyết LLM Xử Lý Nhanh Context Dài](/blog/kv-cache-attention-optimization-llm/) — giải thích chi tiết cơ chế KV cache mà PagedAttention tối ưu hóa, cùng các kỹ thuật khác như MQA, GQA.
