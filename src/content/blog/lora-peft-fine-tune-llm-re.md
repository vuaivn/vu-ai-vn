---
title: "LoRA và PEFT: Fine-tune LLM Rẻ 10 Lần Không Cần GPU Khủng"
description: "Hướng dẫn chi tiết LoRA và Parameter-Efficient Fine-Tuning: tùy biến LLM với chi phí thấp, không cần GPU đắt tiền. So sánh Full Fine-tuning vs LoRA."
pubDate: 2026-09-26
category: "cong-nghe"
lang: "vi"
cover: "/images/posts/hero-lora-peft-fine-tune-llm-re.webp"
draft: false
---

**LoRA (Low-Rank Adaptation) và PEFT (Parameter-Efficient Fine-Tuning) cho phép bạn tùy biến các mô hình ngôn ngữ lớn (LLM) với chi phí chỉ bằng 1/10 so với fine-tuning truyền thống, mà không cần GPU khủng.** Thay vì huấn luyện lại toàn bộ hàng tỷ tham số, bạn chỉ cập nhật một tập nhỏ "adapter" — tiết kiệm bộ nhớ, giảm thời gian, và vẫn đạt kết quả tương đương.

Nếu bạn từng nghĩ fine-tuning LLM chỉ dành cho các công ty lớn có ngân sách triệu đô, bài này sẽ chứng minh điều ngược lại. Với LoRA, một GPU consumer (RTX 4090, thậm chí 3060) là đủ để tùy biến GPT-3.5, Llama-2, hay Mistral cho trường hợp sử dụng riêng của bạn.

## LoRA là gì và hoạt động thế nào?

LoRA (Low-Rank Adaptation) là kỹ thuật fine-tuning hiệu quả: thay vì điều chỉnh toàn bộ trọng số của model gốc (hàng tỷ tham số), LoRA **thêm các ma trận nhỏ (rank thấp)** vào các lớp attention của transformer, rồi chỉ huấn luyện những ma trận này.

**Ví dụ thực tế:** Một LLM 7B tham số (7 tỷ) trong full fine-tuning cần ~28GB VRAM (với bfloat16). Với LoRA rank-16, bạn chỉ cần huấn luyện ~4.2 triệu tham số (0.06% của model) — chỉ tốn ~6GB VRAM. Adapter file kết quả chỉ ~17MB thay vì hàng chục GB.

**Công thức đơn giản:**
```
Original layer: W (shape d×k, frozen)
LoRA update:   ΔW = B×A  
               (B: d×r, A: r×k)
Output:        W + ΔW

Với r << min(d,k), số tham số huấn luyện giảm mạnh
```

Điểm mấu chốt: **trọng số gốc (W) không thay đổi** — bạn chỉ học một "bản vá" nhỏ (ΔW). Khi inference, chỉ cần cộng ΔW vào W hoặc tải adapter riêng.

## PEFT: Họ kỹ thuật rộng hơn

PEFT (Parameter-Efficient Fine-Tuning) là **thuật ngữ ô** bao gồm nhiều phương pháp fine-tuning ít tham số:

1. **LoRA** (Low-Rank Adaptation) — adapter rank thấp, phổ biến nhất
2. **Prefix Tuning** — thêm vector "prefix" vào đầu mỗi layer
3. **Adapter Layers** — chèn các bottleneck MLP giữa các transformer layer
4. **Prompt Tuning** — học soft prompt (embedding vector) thay vì hard text
5. **IA³ (Infused Adapter by Inhibiting and Amplifying Inner Activations)** — nhân scaling vector vào activation

Trong thực tế, **LoRA chiếm ưu thế** vì đơn giản, hiệu quả, và có thư viện hỗ trợ tốt (Hugging Face PEFT). Các phương pháp khác ít phổ biến hơn hoặc dành cho trường hợp đặc biệt.

## So sánh Full Fine-tuning vs LoRA: Chi phí thực tế

| Tiêu chí | Full Fine-tuning (Llama-2 7B) | LoRA (rank-16, Llama-2 7B) |
|----------|-------------------------------|----------------------------|
| **Tham số huấn luyện** | 7B (100%) | ~4.2M (0.06%) |
| **VRAM cần** | ~28GB (bfloat16) | ~6GB |
| **GPU tối thiểu** | A100 40GB, A6000 | RTX 3060 12GB, 4090 |
| **Thời gian (10k steps)** | ~6-8 giờ (A100) | ~2-3 giờ (4090) |
| **Chi phí cloud** | ~$15-20 (8h A100) | ~$3-5 (3h 4090 cloud) |
| **Adapter size** | 14GB (full model) | ~17MB (chỉ adapter) |
| **Khả năng merge** | Thay thế model gốc | Có thể load nhiều adapter |

**Kết luận:** LoRA giảm chi phí **10 lần** (thậm chí hơn), cho phép chạy trên GPU consumer, và dễ chia sẻ/quản lý nhiều phiên bản tùy biến.

## Khi nào nên dùng LoRA?

**Dùng LoRA khi:**
- Bạn muốn tùy biến LLM cho **task cụ thể** (chatbot y tế, trợ lý pháp lý, style viết đặc thù)
- Có **dataset nhỏ-vừa** (1k-100k mẫu) — đủ để fine-tune, không đủ để train from scratch
- **Ngân sách GPU hạn chế** — không có A100/H100, chỉ có RTX/consumer GPU
- Cần **nhiều variant** của cùng một model (1 model gốc + 10 adapter cho 10 khách hàng khác nhau)
- Muốn **deploy nhẹ** — load adapter 17MB nhanh hơn nhiều so với swap model 14GB

**Dùng Full Fine-tuning khi:**
- Bạn có ngân sách GPU dồi dào và cần **tối ưu tuyệt đối** cho 1 task duy nhất
- Task khác **hoàn toàn** so với pre-training gốc (VD: model ngôn ngữ tự nhiên → code generation từ đầu)
- Dataset **rất lớn** (hàng triệu mẫu, đa dạng) — full fine-tuning sẽ tận dụng hết data

**Dùng RAG thay vì fine-tuning (bao gồm LoRA) khi:**
- Bạn chỉ cần model **truy xuất thông tin từ knowledge base riêng** mà không cần thay đổi style/hành vi
- Dữ liệu **cập nhật liên tục** (báo cáo hàng ngày, tin tức) — RAG update vector DB dễ hơn re-train
- Không có GPU để train — RAG chỉ cần embedding model nhỏ + vector search

(Xem thêm: [Fine-tuning Hay RAG? Khi Nào Dùng Cái Nào](/blog/fine-tuning-vs-rag-khi-nao-dung/) — phân tích chi tiết 2 hướng tiếp cận.)

## Thực hành: Fine-tune Llama-2 7B với LoRA

### Bước 1: Chuẩn bị môi trường

**GPU tối thiểu:** RTX 3060 12GB, khuyến nghị RTX 4090 24GB hoặc A4000.

```bash
pip install transformers peft datasets accelerate bitsandbytes
```

- `peft` — thư viện PEFT của Hugging Face (hỗ trợ LoRA, Prefix, ...)
- `bitsandbytes` — cho 8-bit/4-bit quantization (giảm VRAM thêm 50%)

### Bước 2: Load model + LoRA config

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
import torch

model_name = "meta-llama/Llama-2-7b-hf"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,  # 8-bit quantization → giảm VRAM ~50%
    device_map="auto",
    torch_dtype=torch.float16
)
model = prepare_model_for_kbit_training(model)

lora_config = LoraConfig(
    r=16,                      # rank của adapter (8-64, thường 16)
    lora_alpha=32,             # scaling factor (thường = 2×r)
    target_modules=["q_proj", "v_proj"],  # áp vào attention layers
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 4.2M || all params: 6.7B || trainable%: 0.06%
```

**Giải thích:**
- `r=16` — rank càng cao → adapter càng lớn, học được nhiều hơn nhưng tốn VRAM. 8-32 cho task đơn giản, 64 cho task phức tạp.
- `lora_alpha` — scale ΔW lên (thường = 2×r). Cao hơn → adapter có ảnh hưởng mạnh hơn.
- `target_modules` — LoRA thường áp vào query/value projection của attention. Có thể thêm `k_proj`, `o_proj` nếu cần.

### Bước 3: Chuẩn bị dataset

```python
from datasets import load_dataset

# VD: dataset instruction-following
dataset = load_dataset("yahma/alpaca-cleaned")  # 52k instruction samples

def format_prompt(example):
    return f"### Instruction:\n{example['instruction']}\n### Response:\n{example['output']}"

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

def tokenize(batch):
    texts = [format_prompt(ex) for ex in batch]
    return tokenizer(texts, truncation=True, max_length=512, padding="max_length")

tokenized = dataset.map(tokenize, batched=True, remove_columns=dataset.column_names)
```

**Dataset tốt cho LoRA:**
- 1k-100k mẫu (đủ để adapter học task, không quá lớn)
- Chất lượng cao (đã clean, format đồng nhất)
- Phân phối cân đối (nếu train chatbot y tế, cần đủ các loại câu hỏi)

### Bước 4: Training

```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./lora-llama2-7b",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,  # effective batch = 16
    learning_rate=2e-4,              # cao hơn full fine-tuning (1e-5)
    fp16=True,
    logging_steps=10,
    save_steps=200,
    save_total_limit=3
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized["train"]
)

trainer.train()
model.save_pretrained("./lora-llama2-7b-final")
```

**Thời gian ước tính:**
- RTX 4090 24GB: ~2.5 giờ (10k steps, batch 16, Llama-2 7B)
- A100 40GB: ~1.5 giờ
- RTX 3060 12GB (với 4-bit quant): ~4 giờ

**Chi phí cloud:**
- RunPod GPU RTX 4090: ~$0.50/giờ → ~$1.25 cho 1 lần train
- Vast.ai RTX 3090: ~$0.30/giờ → ~$1.20
- Lambda Labs A100: ~$1.10/giờ → ~$1.65

So với full fine-tuning (A100 8h = ~$16), LoRA rẻ hơn **10 lần**.

### Bước 5: Inference với adapter

```python
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")
model = PeftModel.from_pretrained(base_model, "./lora-llama2-7b-final")

prompt = "### Instruction:\nGiải thích photosynthesis cho học sinh lớp 5\n### Response:\n"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=256)
print(tokenizer.decode(outputs[0]))
```

**Lợi ích:**
- File adapter chỉ ~17MB → chia sẻ/deploy cực nhanh
- 1 model gốc + 10 adapter = 10 model tùy biến khác nhau (dễ quản lý)
- Có thể merge adapter vào model gốc nếu muốn deploy single-file

## QLoRA: Kết hợp LoRA + Quantization 4-bit

QLoRA (Quantized LoRA) đưa VRAM cần thiết xuống **thêm 50%** bằng cách:
1. Load model gốc ở dạng **4-bit quantization** (NF4 — NormalFloat)
2. Train adapter LoRA ở **bfloat16** (chất lượng cao)
3. Dùng **paged optimizers** để swap VRAM khi cần

**Kết quả:** Fine-tune Llama-2 7B trên **RTX 3060 12GB** (không cần A100).

```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,  # double quantization
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)
# VRAM: ~4-5GB (thay vì 14GB FP16)
```

**Trade-off:** Tốc độ inference chậm hơn ~20-30% so với FP16, nhưng vẫn khả dụng cho production (đặc biệt khi deploy trên GPU consumer).

## Kỹ thuật nâng cao: Multi-adapter và Adapter Fusion

**Multi-adapter:** Load nhiều LoRA adapter cùng lúc cho các task khác nhau.

```python
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained(model_name)
model = PeftModel.from_pretrained(base_model, "./adapter-medical")
model.load_adapter("./adapter-legal", adapter_name="legal")
model.load_adapter("./adapter-code", adapter_name="code")

# Switch adapter theo task
model.set_adapter("legal")
# hoặc ensemble: model.set_adapter(["medical", "legal"])
```

**Adapter Fusion:** Học một layer meta kết hợp nhiều adapter (cho multi-task).

**Use case thực tế:**
- 1 model Llama-2 7B base + 5 adapter cho 5 khách hàng (healthcare, legal, finance, HR, customer support)
- Mỗi adapter ~20MB, dễ version control, A/B test, rollback
- Deploy: load base 1 lần, swap adapter theo request (~100ms)

## Lỗi thường gặp và cách khắc phục

### 1. CUDA Out of Memory

**Triệu chứng:** `RuntimeError: CUDA out of memory`

**Giải pháp:**
- Giảm `per_device_train_batch_size` (từ 4 → 2 → 1)
- Tăng `gradient_accumulation_steps` để giữ effective batch size
- Bật `load_in_8bit` hoặc `load_in_4bit`
- Giảm `r` (rank) từ 64 → 16 → 8
- Giảm `max_length` trong tokenizer (1024 → 512)

### 2. Adapter không học gì (loss không giảm)

**Nguyên nhân:** `lora_alpha` quá thấp hoặc `learning_rate` không phù hợp.

**Giải pháp:**
- Đảm bảo `lora_alpha = 2×r` (rule of thumb)
- Tăng learning rate: full fine-tuning dùng 1e-5, LoRA nên 2e-4 đến 5e-4
- Kiểm tra `target_modules` có đúng layer không (q_proj, v_proj là phổ biến nhất)

### 3. Model quên kiến thức gốc (catastrophic forgetting)

**Triệu chứng:** Sau fine-tune, model tốt ở task mới nhưng kém đi ở task chung.

**Giải pháp:**
- Giảm số epoch (3 → 1-2)
- Mix thêm general data vào training set (10-20%)
- Giảm `lora_alpha` để adapter ảnh hưởng nhẹ hơn

### 4. Inference chậm sau khi thêm adapter

**Nguyên nhân:** Adapter chưa merge vào model gốc.

**Giải pháp:** Merge adapter để giảm overhead.

```python
model = model.merge_and_unload()
model.save_pretrained("./merged-model")
```

## So sánh công cụ và thư viện

| Thư viện | Hỗ trợ PEFT | Ease of Use | Community |
|----------|-------------|-------------|-----------|
| **Hugging Face PEFT** | LoRA, Prefix, Adapter, IA³ | ⭐⭐⭐⭐⭐ Dễ nhất | Lớn nhất |
| **LLaMA-Factory** | LoRA, QLoRA, Full FT | ⭐⭐⭐⭐ WebUI + CLI | Trung bình |
| **Axolotl** | LoRA, QLoRA, FSDP | ⭐⭐⭐ YAML config | Nhỏ, chuyên sâu |
| **OpenLLM** | LoRA | ⭐⭐⭐⭐ Deployment focus | Trung bình |
| **Unsloth** | LoRA optimized | ⭐⭐⭐⭐ Nhanh 2-5× | Mới, đang lên |

**Khuyến nghị:**
- Người mới: **Hugging Face PEFT** (tài liệu tốt, tích hợp sẵn Trainer)
- Cần WebUI: **LLaMA-Factory** (no-code fine-tuning)
- Cần tốc độ tối đa: **Unsloth** (tối ưu kernel, nhanh hơn PEFT 2-5×)

## Chi phí thực tế cho startup/cá nhân

**Tình huống 1:** Bạn cần chatbot customer support riêng từ GPT-3.5.

- **Không fine-tune:** Gọi API GPT-3.5 với context dài → ~$0.002/1k tokens → 1M token/tháng = $2,000
- **Fine-tune Full:** Không khả thi (OpenAI không cho fine-tune GPT-3.5 từ tháng 8/2024)
- **Fine-tune LoRA (Llama-2 7B):** 1 lần train $1.5 (cloud GPU 3h) + host local hoặc RunPod inference $0.0002/1k token → 1M token = $200
- **Tiết kiệm:** ~90% chi phí, control hoàn toàn model

**Tình huống 2:** Dịch vụ SaaS cho 10 khách hàng, mỗi khách cần model riêng.

- **Full fine-tune:** 10 model × 14GB = 140GB lưu trữ + 10× chi phí train
- **LoRA:** 1 base model 14GB + 10 adapter × 20MB = 14.2GB + chi phí train ~$15 (10 lần @ $1.5)
- **Deploy:** Load 1 base + swap adapter theo request → infrastructure gọn, dễ scale

## Kết luận: LoRA đã dân chủ hóa fine-tuning LLM

Trước LoRA, fine-tuning LLM là đặc quyền của các công ty lớn với ngân sách GPU khủng. Giờ đây, bất kỳ ai có GPU consumer (thậm chí RTX 3060) cũng có thể tùy biến Llama-2, Mistral, hoặc Qwen cho task riêng — với chi phí chỉ bằng 1/10 full fine-tuning.

**Tóm lại:**
- LoRA giảm tham số huấn luyện từ hàng tỷ xuống hàng triệu (99%+)
- Chi phí cloud từ $15-20 xuống $1-3 cho 1 lần train
- VRAM từ 28GB xuống 6GB (thậm chí 4GB với QLoRA)
- Adapter chỉ 17MB — dễ chia sẻ, version control, deploy

Nếu bạn đang xây dựng ứng dụng AI cần model tùy biến (chatbot, content generation, code assistant), LoRA là cách tiếp cận hiệu quả nhất năm 2026 — không còn là câu hỏi "có nên fine-tune không" mà là "fine-tune với LoRA như thế nào".

**Đọc thêm:**

- [Local LLM: Chạy AI Mạnh Mẽ Trên Máy Tính Cá Nhân 2026](/blog/local-llm-chay-ai-tren-may-tinh-ca-nhan-2026/) — Hướng dẫn chạy LLM đã fine-tune (kể cả LoRA adapter) trên máy cá nhân không cần cloud, phù hợp khi đã có adapter muốn deploy local.
- [Transfer Learning: Tái Sử Dụng Model AI Tiết Kiệm 90% Chi Phí](/blog/transfer-learning-tai-su-dung-model-ai/) — Nguyên lý transfer learning mà LoRA kế thừa: tái dùng kiến thức từ model gốc thay vì train from scratch, áp dụng rộng hơn cả NLP.
- [Quantization Trong AI: Giảm Kích Thước Model 10 Lần Mà Vẫn Giữ Chất Lượng](/blog/quantization-ai-models/) — Kỹ thuật quantization (8-bit, 4-bit NF4) mà QLoRA sử dụng để giảm VRAM, quan trọng khi kết hợp với LoRA để chạy trên GPU consumer.
