---
title: "Agentic AI Workflows: LangChain, LangGraph và Tương Lai Tự Động Hóa 2026"
description: "Khám phá cách xây dựng AI workflows phức tạp với LangChain và LangGraph. Hướng dẫn chi tiết về agentic AI, tool use và orchestration cho developer."
pubDate: 2026-08-23
category: cong-nghe
lang: vi
cover: /images/posts/hero-agentic-ai-workflows-langchain-langgraph-2026.webp
draft: false
---

**Agentic AI workflows** là cách mới để xây dựng hệ thống AI tự động hóa phức tạp. Nó thực thi nhiệm vụ, gọi tool, lập kế hoạch và điều phối — vượt xa chatbot thông thường chỉ trả lời câu hỏi. LangChain và LangGraph là hai framework mã nguồn mở giúp developer xây workflows này nhanh, dễ maintain và scale được.

Nếu bạn đã quen với LLM đơn giản (hỏi-đáp), bài này sẽ mở ra cách nghĩ mới. 

AI không chỉ "chat" — nó có thể thành agent làm việc thay bạn.

## Agentic AI Workflow là gì?

Agentic AI workflow là một hệ thống AI mà trong đó agent (tác nhân AI) có khả năng:
- **Lập kế hoạch**: phân tích nhiệm vụ, chia nhỏ thành các bước
- **Gọi tool/API**: truy cập database, gọi API bên ngoài, chạy code
- **Nhớ ngữ cảnh**: lưu trữ và truy xuất thông tin từ nhiều lượt tương tác
- **Điều phối nhiều agent**: phân công công việc cho nhiều agent chuyên biệt

Khác với chatbot thông thường chỉ trả lời text, agentic workflow biến LLM thành "nhân viên AI" thực thi công việc từ đầu đến cuối. Hoàn chỉnh. Tự động.

**Ví dụ thực tế**: Thay vì hỏi "Email nào quan trọng hôm nay?", agent có thể tự đọc inbox, phân loại, soạn email trả lời nháp và đặt lịch họp — tất cả tự động.

## LangChain là gì và tại sao cần nó?

LangChain là framework Python/JavaScript giúp xây dựng ứng dụng LLM theo kiểu "chain" (chuỗi xử lý). Thay vì gọi API LLM thủ công từng lần, LangChain cung cấp:

### 1. Chains — Chuỗi xử lý logic
Kết nối nhiều bước xử lý thành một pipeline:
```
User input → Prompt template → LLM → Output parser → Tool call → LLM → Final answer
```

### 2. Agents — Tự động chọn tool
Agent tự quyết định tool nào cần gọi dựa trên nhiệm vụ. Bạn cung cấp danh sách tool (search, calculator, database query), agent tự chọn.

### 3. Memory — Nhớ ngữ cảnh
- **Conversation memory**: nhớ lịch sử chat
- **Entity memory**: ghi nhận thực thể (người, địa điểm)
- **Summary memory**: tóm tắt cuộc hội thoại dài

### 4. Retrieval — Tìm kiếm thông tin
Tích hợp vector database (Pinecone, Weaviate, Chroma) để agent truy xuất tri thức từ tài liệu riêng.

**Khi nào dùng LangChain?**
- Bạn cần xây prototype nhanh với nhiều bước logic
- Ứng dụng cần gọi nhiều tool/API
- Bạn muốn code dễ đọc, dễ maintain hơn so với gọi API thô

**Hạn chế**: Chains của LangChain có cấu trúc tuyến tính. Khó biểu diễn logic phân nhánh phức tạp, vòng lặp hoặc điều kiện động. 

Đó là lý do LangGraph ra đời.

## LangGraph: Khi workflow cần điều phối phức tạp

LangGraph là layer trên LangChain, sử dụng **graph (đồ thị)** để biểu diễn workflow. Mỗi node là một bước xử lý, mỗi edge là điều kiện chuyển tiếp.

### Kiến trúc LangGraph
```
     ┌─────────┐
     │  Start  │
     └────┬────┘
          │
     ┌────▼────┐
     │ Node A  │ (LLM phân tích)
     └────┬────┘
          │
      ┌───┴───┐
      │       │
  ┌───▼───┐ ┌─▼──────┐
  │Tool 1 │ │ Tool 2 │
  └───┬───┘ └─┬──────┘
      │       │
      └───┬───┘
     ┌────▼────┐
     │ Node B  │ (Tổng hợp)
     └────┬────┘
          │
     ┌────▼────┐
     │   End   │
     └─────────┘
```

### Tính năng nổi bật
1. **State management**: Mỗi node đọc/ghi vào shared state, dễ debug
2. **Conditional routing**: Agent tự quyết định node tiếp theo dựa trên kết quả
3. **Human-in-the-loop**: Dừng workflow chờ input từ người (approve, sửa)
4. **Persistence**: Lưu state workflow, tiếp tục sau khi crash/restart

**Use case điển hình**:
- **Multi-agent orchestration**: Agent A research, Agent B viết nội dung, Agent C review
- **Complex decision tree**: Workflow phân nhánh theo từng tình huống
- **Long-running tasks**: Chạy trong nhiều giờ, lưu checkpoint, resume được

## So sánh LangChain vs LangGraph

| Tiêu chí | LangChain | LangGraph |
|----------|-----------|-----------|
| **Cấu trúc** | Chain (tuyến tính) | Graph (đồ thị) |
| **Logic phức tạp** | Khó | Dễ (điều kiện, vòng lặp) |
| **State management** | Đơn giản | Mạnh mẽ, persist được |
| **Human-in-the-loop** | Khó tích hợp | Built-in |
| **Độ phức tạp code** | Thấp (prototype nhanh) | Trung bình (cần thiết kế graph) |
| **Khi nào dùng** | Workflow đơn giản, 1-5 bước | Workflow phức tạp, nhiều agent |

Dùng LangChain cho chatbot, RAG đơn giản. 

Dùng LangGraph khi cần orchestration nhiều bước với logic phân nhánh. Đơn giản thế.

## Xây dựng Agentic Workflow thực tế với LangGraph

### Bước 1: Định nghĩa nodes (các bước xử lý)
Mỗi node là một function nhận state, trả về state mới:
```python
def research_node(state):
    query = state["user_query"]
    results = search_tool.run(query)
    state["research_data"] = results
    return state

def write_node(state):
    data = state["research_data"]
    draft = llm.generate(f"Viết bài từ: {data}")
    state["draft"] = draft
    return state
```

### Bước 2: Thiết kế graph
```python
from langgraph.graph import StateGraph

workflow = StateGraph(state_schema)
workflow.add_node("research", research_node)
workflow.add_node("write", write_node)
workflow.add_node("review", review_node)

# Định nghĩa edge (điều kiện chuyển)
workflow.add_edge("research", "write")
workflow.add_conditional_edge(
    "write",
    lambda state: "review" if state["needs_review"] else "end"
)
workflow.set_entry_point("research")
```

### Bước 3: Chạy workflow
```python
result = workflow.run({"user_query": "AI trends 2026"})
print(result["draft"])
```

### Best practices
1. **Chia nhỏ node**: Mỗi node làm 1 việc, dễ test riêng
2. **Log state mỗi bước**: Debug dễ hơn khi workflow dài
3. **Timeout cho tool**: Tránh workflow treo khi tool chậm
4. **Fallback logic**: Khi một nhánh fail, có plan B

## Tool Use trong Agentic AI

Agent mạnh nhờ **tool** (công cụ) mà nó gọi được. LangChain/LangGraph hỗ trợ tích hợp tool dễ dàng.

### Các loại tool phổ biến
- **Search**: Google Search, Brave Search, Bing API
- **Database**: SQL query, vector search
- **API**: Weather, stock price, CRM, email
- **Code execution**: Python REPL, sandbox
- **Web scraping**: Playwright, Selenium

### Định nghĩa tool trong LangChain
```python
from langchain.tools import Tool

def calculator(expression):
    return eval(expression)

calc_tool = Tool(
    name="Calculator",
    func=calculator,
    description="Tính toán biểu thức toán học"
)
```

Agent tự quyết định khi nào gọi tool dựa trên **description** — vì vậy description phải rõ ràng.

### Function calling vs ReAct
- **Function calling** (OpenAI, Anthropic): LLM trả về JSON structured call, framework tự gọi
- **ReAct** (Reasoning + Acting): LLM tự viết text "Action: [tool_name]", framework parse và gọi

LangChain hỗ trợ cả hai. Function calling nhanh hơn, ReAct linh hoạt hơn.

## Memory và Context Management

Workflow dài cần nhớ ngữ cảnh qua nhiều lượt. LangChain cung cấp nhiều loại memory.

### 1. ConversationBufferMemory
Lưu toàn bộ lịch sử chat. Đơn giản nhưng tốn token khi hội thoại dài.

### 2. ConversationSummaryMemory
Tóm tắt lịch sử cũ, chỉ giữ summary + vài turn gần nhất. Tiết kiệm token.

### 3. VectorStoreMemory
Lưu mỗi turn vào vector DB, truy xuất theo semantic search. Phù hợp với hội thoại rất dài (hàng trăm turn).

### 4. EntityMemory
Ghi nhận entity (người, công ty, sản phẩm) từ hội thoại, lưu thành knowledge graph nhỏ.

**Khi nào dùng loại nào?**
- Chat ngắn (< 10 turn): Buffer
- Chat vừa (10-50 turn): Summary
- Chat dài hoặc multi-session: VectorStore
- Cần nhớ thực thể cụ thể: Entity

## Multi-Agent Systems: Phân công công việc

Một workflow phức tạp thường cần nhiều agent chuyên biệt.

### Kiến trúc multi-agent điển hình
1. **Manager Agent**: Nhận yêu cầu, phân tích, giao việc cho sub-agents
2. **Researcher Agent**: Tìm kiếm, thu thập data
3. **Writer Agent**: Viết nội dung, code
4. **Reviewer Agent**: Đánh giá chất lượng, phê duyệt

### Giao tiếp giữa agents
- **Shared state**: Tất cả agent đọc/ghi state chung (LangGraph)
- **Message passing**: Agent gửi message qua queue (RabbitMQ, Redis)
- **Hierarchical**: Manager gọi sub-agent như function call

**Lợi ích**:
- Mỗi agent tối ưu cho một nhiệm vụ
- Scale dễ (add thêm agent)
- Dễ test riêng từng agent

**Thách thức**:
- Phối hợp phức tạp, dễ deadlock
- Chi phí API tăng (nhiều LLM call)
- Debug khó khi có 5+ agents

## Khi nào nên dùng Agentic Workflows?

### Dùng khi:
✅ Nhiệm vụ cần nhiều bước logic phức tạp (không chỉ 1-2 prompt)  
✅ Cần gọi nhiều tool/API liên tiếp  
✅ Workflow phân nhánh theo điều kiện động  
✅ Cần nhớ ngữ cảnh qua nhiều lượt tương tác  
✅ Long-running tasks (chạy hàng phút/giờ)  

### Không nên dùng khi:
❌ Nhiệm vụ đơn giản, 1-2 prompt giải quyết  
❌ Latency là ưu tiên số 1 (agentic chậm hơn direct LLM call)  
❌ Budget hạn chế (nhiều LLM call = tốn tiền)  
❌ Không cần tool use hay branching logic  

**Rule of thumb**: Nếu bạn viết code có > 3 lần gọi LLM tuần tự với logic if-else ở giữa → đó là dấu hiệu cần agentic workflow.

## Thách thức và giải pháp

### 1. Chi phí API cao
Mỗi node gọi LLM. Workflow 10 bước = 10 LLM calls. Tốn kém.

**Giải pháp**:
- Dùng model nhỏ (GPT-4o-mini, Claude Haiku) cho node đơn giản
- Cache kết quả tool call
- Semantic caching cho query lặp lại

### 2. Latency cao
Workflow chạy tuần tự, mỗi bước 2-5 giây. User chờ lâu. Trải nghiệm tệ.

**Giải pháp**:
- Chạy song song các node độc lập (LangGraph hỗ trợ)
- Streaming output (trả kết quả từng phần)
- Background processing (webhook khi xong)

### 3. Reliability thấp
Một tool fail → cả workflow dừng. Dễ vỡ.

**Giải pháp**:
- Retry với exponential backoff
- Fallback tool (Google search fail → dùng Bing)
- Checkpoint state để resume

### 4. Debug khó
Workflow dài, không biết node nào sai. Lạc lối trong cây quyết định.

**Giải pháp**:
- Log state mỗi node
- LangSmith (tracing tool của LangChain) — visualize toàn bộ flow
- Unit test từng node riêng

## Xu hướng Agentic AI 2026

1. **No-code agent builders**: Flowise, Langflow — kéo thả xây workflow không cần code
2. **Specialized agent frameworks**: AutoGPT, BabyAGI, SuperAGI — agent tự lập kế hoạch dài hạn
3. **Agent marketplaces**: Mua/bán agent có sẵn cho use case cụ thể
4. **Multi-modal agents**: Agent xử lý text, ảnh, video, audio cùng lúc
5. **On-device agents**: Chạy trên laptop/phone không cần cloud

**Dự đoán**: Trong 2-3 năm tới, agentic workflows sẽ trở thành chuẩn cho ứng dụng LLM phức tạp — giống như REST API là chuẩn cho web service hiện nay.

## Kết luận

Agentic AI workflows đánh dấu bước tiến từ "AI trả lời câu hỏi" sang "AI thực thi công việc". LangChain và LangGraph là hai công cụ mạnh để xây dựng hệ thống này.

**Takeaway**:
- LangChain: cho workflow tuyến tính, prototype nhanh
- LangGraph: cho logic phức tạp, multi-agent, long-running tasks
- Tool use là xương sống của agent — càng nhiều tool, agent càng mạnh
- Multi-agent giải quyết được bài toán phức tạp nhưng khó debug

Nếu bạn đang xây ứng dụng AI vượt ra ngoài chatbot đơn giản, đây là lúc thử agentic workflows. Bắt đầu từ một use case nhỏ (ví dụ: tự động trả lời email), rồi mở rộng dần.

**Đọc thêm:**

- [AI Tạo Sinh (Generative AI): Toàn Cảnh Cho Người Việt 2026](/blog/ai-tao-sinh-generative-ai-toan-canh/) — Nền tảng về các loại AI tạo sinh, bối cảnh lớn trước khi đi sâu vào agentic workflows.
- [Function Calling & Tool Use: Khi AI Biết Gọi API và Dùng Công Cụ](/blog/function-calling-tool-use-ai/) — Cơ chế cốt lõi giúp agent gọi tool, tiền đề kỹ thuật cho mọi agentic workflow.
- [Multi-Agent Systems: AI Đa Nhiệm Tự Động Hóa Công Việc Phức Tạp](/blog/multi-agent-systems-ai-tu-dong-hoa/) — Kiến trúc phân tán với nhiều agent chuyên biệt, bước tiếp theo sau khi thành thạo single-agent workflows.
