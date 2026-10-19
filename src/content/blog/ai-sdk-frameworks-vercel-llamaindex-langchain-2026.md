---
title: "AI SDK & Frameworks: Vercel AI SDK, LlamaIndex, LangChain So Sánh 2026"
description: "So sánh 3 framework AI phổ biến nhất 2026: Vercel AI SDK cho web dev, LlamaIndex cho RAG, LangChain cho agents. Code thực tế + use case từng cái."
pubDate: 2026-10-19
category: cong-nghe
lang: vi
cover: /images/posts/hero-ai-sdk-frameworks-vercel-llamaindex-langchain-2026.webp
draft: false
---

**Vercel AI SDK** thắng khi bạn cần streaming UI + React Server Components tích hợp sẵn. **LlamaIndex** thắng khi bạn build RAG system với nhiều data source. **LangChain** thắng khi bạn cần orchestrate agents phức tạp với memory + tools. 

Chọn sai framework? Codebase phình to trong vài tuần.

## AI SDK & Frameworks Là Gì?

AI SDK/framework là layer trừu tượng giữa code của bạn và LLM API (OpenAI, Anthropic, Google...). Thay vì gọi API thô, bạn dùng framework để:
- Kết nối nhiều LLM cùng lúc (model-agnostic)
- Xử lý streaming, retry, fallback tự động
- Tích hợp RAG, agents, tools, memory
- Có sẵn UI components (một số framework)

**Tại sao cần?** Gọi OpenAI API trực tiếp thì đơn giản. Nhưng khi bạn cần multi-turn chat + RAG + function calling + streaming UI + fallback giữa GPT-4 và Claude, codebase tự viết nhanh chóng rối như tổ chim. Framework giải quyết 80% boilerplate này — để bạn tập trung vào logic thật.

**3 framework phổ biến nhất 2026:**
1. **Vercel AI SDK** — web-first, React/Next.js native, streaming UI cực mượt
2. **LlamaIndex** — RAG-first, data ingestion + query engine mạnh nhất
3. **LangChain** — agent-first, orchestration phức tạp, ecosystem lớn nhất

## Vercel AI SDK: Tốt Nhất Cho Web Developers

[Vercel AI SDK](https://sdk.vercel.ai/) (trước đây là AI SDK by Vercel) sinh ra cho Next.js/React devs muốn ship chatbot/AI features nhanh nhất có thể.

**Điểm mạnh:**
- **Streaming UI tích hợp sâu**: `useChat()`, `useCompletion()` hooks + React Server Components → streaming responses render trực tiếp vào UI không cần setup gì
- **Edge runtime ready**: chạy được trên Vercel Edge Functions (latency thấp)
- **TypeScript-first**: types đầy đủ, autocomplete tốt
- **Model-agnostic nhưng đơn giản**: hỗ trợ OpenAI, Anthropic, Google, Mistral, Llama... qua một interface thống nhất
- **Nhẹ**: không có quá nhiều abstraction layers như LangChain

**Code thực tế** (Next.js App Router + streaming chat):
```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
  });
  
  return result.toDataStreamResponse();
}

// app/page.tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

**3 dòng code phía server**, hook `useChat()` phía client → xong. Bạn có chatbot streaming đầy đủ. Thật sự không có framework nào đơn giản hơn cho web use case.

**Khi nào dùng Vercel AI SDK:**
- Bạn build web app (Next.js/React/Vue/Svelte)
- Cần streaming responses vào UI
- Muốn ship nhanh, không cần orchestration phức tạp
- Deploy lên Vercel hoặc edge runtime

**Khi nào KHÔNG dùng:**
- Backend-only service (Python/Node backend thuần)
- Cần RAG với nhiều data sources phức tạp → LlamaIndex thắng
- Cần multi-agent workflows → LangChain thắng

Vercel AI SDK có thêm `ai/rsc` (React Server Components streaming) và `generateObject()` cho structured output, nhưng core value vẫn là: **đơn giản nhất cho web devs**.

## LlamaIndex: Tốt Nhất Cho RAG Systems

[LlamaIndex](https://www.llamaindex.ai/) (trước đây là GPT Index) được thiết kế từ đầu cho một mục đích: **ingest data của bạn → query nó bằng LLM**.

**Điểm mạnh:**
- **Data connectors**: 100+ loaders sẵn (PDF, Notion, Google Drive, SQL, API, web scraping...)
- **Indexing engine mạnh**: vector index, tree index, keyword index, knowledge graph... tự động optimize
- **Query engine tinh tế**: có sẵn query transformations, multi-step reasoning, sub-question decomposition
- **Cả Python + TypeScript**: LlamaIndex.TS cho JS devs
- **Tích hợp sâu với vector DBs**: Pinecone, Weaviate, Qdrant, Chroma... plug-and-play

**Code thực tế** (Python — RAG từ folder documents):
```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Load docs từ folder
documents = SimpleDirectoryReader("./data").load_data()

# Tạo index (tự động chunking + embedding + vector store)
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("Tóm tắt nội dung chính của tài liệu")
print(response)
```

**5 dòng code**. Xong. 

Bạn có RAG system hoàn chỉnh. LlamaIndex tự động:
- Chia documents thành chunks
- Embed chunks (dùng OpenAI embeddings mặc định)
- Lưu vào vector store (mặc định in-memory, hoặc config Pinecone/Weaviate...)
- Retrieve relevant chunks khi query
- Synthesize câu trả lời từ LLM

**Agents trong LlamaIndex:**
LlamaIndex có `ReActAgent`, `OpenAIAgent` để build agents với tools, nhưng **không mạnh bằng LangChain** trong phần orchestration phức tạp. LlamaIndex agents tập trung vào "query my data", không phải "chain 10 bước multi-agent workflow".

**Khi nào dùng LlamaIndex:**
- Bạn cần RAG (chatbot trả lời từ documents/database riêng)
- Data sources nhiều loại (PDF + SQL + Notion + API...)
- Muốn query engine tinh tế (multi-step reasoning, sub-questions...)
- Python-first hoặc TypeScript đều được

**Khi nào KHÔNG dùng:**
- Bạn chỉ cần gọi LLM đơn giản (overkill)
- Cần streaming UI cho web → Vercel AI SDK đơn giản hơn
- Cần orchestrate agents với memory + complex chains → LangChain thắng

LlamaIndex còn có **LlamaHub** (thư viện loaders) và **LlamaParse** (parse PDF/documents phức tạp). Nếu bạn làm RAG, LlamaIndex là framework **ít ma thuật nhất** — rõ ràng từng bước ingest → index → query.

## LangChain: Tốt Nhất Cho Agents & Orchestration

[LangChain](https://www.langchain.com/) là framework "lớn" nhất — agents, chains, memory, tools, callbacks, LangSmith monitoring... Bạn có thể build gần như mọi thứ, nhưng trả giá bằng độ phức tạp.

**Điểm mạnh:**
- **Agents & tools**: ReAct, Plan-and-Execute, OpenAI Functions agents + tích hợp sẵn hàng trăm tools (search, calculator, APIs...)
- **Chains**: LCEL (LangChain Expression Language) để compose chains phức tạp
- **Memory**: conversation memory, entity memory, summary memory...
- **Ecosystem**: LangSmith (tracing/monitoring), LangServe (deploy APIs), LangGraph (multi-agent workflows)
- **Cả Python + JS**: LangChain.js cho Node/web

**Code thực tế** (Python — agent với tools):
```python
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from langchain.utilities import SerpAPIWrapper

# Define tools
search = SerpAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description="Useful for searching current information"
    )
]

# Init agent
llm = OpenAI(temperature=0)
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")

# Run
result = agent.run("What's the weather in Hanoi today?")
print(result)
```

Agent tự động:
- Nhận câu hỏi
- Quyết định cần search Google (gọi tool Search)
- Đọc kết quả
- Trả lời user

**LangGraph** (phần mới nhất):
Khi bạn cần multi-agent workflows (agent A → agent B → loop back nếu cần), LangGraph là layer trên LangChain cho phép định nghĩa state machine của agents. Cực mạnh cho automation phức tạp.

**Khi nào dùng LangChain:**
- Bạn cần agents với nhiều tools
- Orchestration phức tạp (multi-step, conditional branches, loops)
- Muốn monitoring/tracing với LangSmith
- Build chatbot có memory dài hạn
- Cần LangGraph cho multi-agent systems

**Khi nào KHÔNG dùng:**
- Bạn chỉ cần chatbot đơn giản → Vercel AI SDK nhanh hơn
- Chỉ cần RAG thuần → LlamaIndex rõ ràng hơn
- Sợ abstraction hell (LangChain có tiếng là "quá nhiều layers")

LangChain **mạnh nhất** trong agents + orchestration, nhưng **learning curve cao nhất**. Nếu bạn mới bắt đầu, có thể thấy choáng.

## So Sánh Trực Tiếp: Vercel AI SDK vs LlamaIndex vs LangChain

| Tiêu chí | Vercel AI SDK | LlamaIndex | LangChain |
|----------|---------------|------------|-----------|
| **Use case chính** | Web UI streaming | RAG systems | Agents & orchestration |
| **Learning curve** | Thấp nhất | Trung bình | Cao nhất |
| **Streaming UI** | ⭐⭐⭐⭐⭐ Native React hooks | ⭐⭐ Có hỗ trợ nhưng không mượt như Vercel | ⭐⭐⭐ Có callbacks nhưng cần setup nhiều |
| **RAG** | ⭐⭐ Không tập trung vào RAG | ⭐⭐⭐⭐⭐ Mạnh nhất | ⭐⭐⭐⭐ Có đầy đủ nhưng phức tạp |
| **Agents/Tools** | ⭐⭐ Có `tools` object nhưng đơn giản | ⭐⭐⭐ Có ReActAgent nhưng không mạnh bằng LangChain | ⭐⭐⭐⭐⭐ Mạnh nhất, đa dạng nhất |
| **Ecosystem** | Vercel Edge, Next.js | LlamaHub (loaders) | LangSmith, LangServe, LangGraph |
| **TypeScript support** | ⭐⭐⭐⭐⭐ TypeScript-first | ⭐⭐⭐⭐ LlamaIndex.TS tốt | ⭐⭐⭐⭐ LangChain.js tốt nhưng Python docs nhiều hơn |
| **Monitoring** | Vercel Analytics | Có callbacks cơ bản | LangSmith (tracing/debugging chuyên nghiệp) |
| **Khi nào dùng** | Web chatbot, streaming UI | RAG từ nhiều data sources | Multi-agent workflows, complex chains |

**Kết luận nhanh:**
- **Ship chatbot lên web nhanh nhất?** → Vercel AI SDK
- **Query dữ liệu riêng (RAG)?** → LlamaIndex
- **Agents phức tạp + orchestration?** → LangChain

## Có Thể Dùng Kết Hợp Không?

**Có**. Nhiều project dùng **hybrid approach**:

**Ví dụ 1**: Next.js app + LlamaIndex + Vercel AI SDK
- Dùng **LlamaIndex** ở backend để index documents → query engine
- Dùng **Vercel AI SDK** để stream responses vào React UI
- Best of both worlds: RAG mạnh (LlamaIndex) + UI mượt (Vercel AI SDK)

**Ví dụ 2**: LangChain agents + LlamaIndex RAG
- Dùng **LangChain** để orchestrate agents
- Một trong những tools của agent là "query company docs" → gọi **LlamaIndex** query engine
- LangChain làm layer điều phối, LlamaIndex làm layer RAG

**Lưu ý**: Càng nhiều framework = càng nhiều dependencies. Nếu use case đơn giản, **pick one** để giữ codebase sạch.

## Xu Hướng 2026: Framework Nào Đang Thắng Thế?

**Vercel AI SDK**: tăng trưởng cực nhanh trong web dev community, nhất là sau khi Vercel tích hợp sâu vào Next.js 15. Nếu bạn là React dev, đây là framework "mặc định".

**LlamaIndex**: vững vàng trong RAG use cases. TypeScript version (LlamaIndex.TS) đang được đẩy mạnh, nhưng Python vẫn là ngôn ngữ chính.

**LangChain**: vẫn là "ông lớn" nhưng đang đối mặt với phản hồi "quá phức tạp". LangGraph (multi-agent workflows) là điểm sáng, nhưng learning curve cao khiến nhiều người chuyển sang framework nhẹ hơn cho use cases đơn giản.

**Xu hướng chung**: **Specialized frameworks đang lên** — thay vì một framework làm tất, devs chọn framework tốt nhất cho ĐÚNG use case của họ. Vercel AI SDK cho web, LlamaIndex cho RAG, LangChain cho agents phức tạp.

## Nên Bắt Đầu Từ Framework Nào?

**Nếu bạn là web developer (Next.js/React):**
→ Bắt đầu với **Vercel AI SDK**. Đơn giản nhất, ship nhanh nhất. Khi cần RAG/agents phức tạp, lúc đó mới nghĩ đến LlamaIndex/LangChain.

**Nếu bạn làm Python backend:**
→ Bắt đầu với **LlamaIndex** nếu cần RAG, hoặc **LangChain** nếu cần agents. LlamaIndex ít ma thuật hơn, dễ debug hơn.

**Nếu bạn mới bắt đầu AI development:**
→ Thử **Vercel AI SDK** trước (nếu biết React) hoặc **LlamaIndex** (nếu biết Python). LangChain để sau khi bạn đã hiểu cơ bản.

**Rule of thumb**: **Start simple**. Đừng dùng LangChain cho chatbot hello world. Đừng dùng LlamaIndex nếu chỉ cần gọi OpenAI API 1 lần. Pick framework đúng độ phức tạp với problem của bạn.

## Kết: Không Có Framework "Tốt Nhất" — Chỉ Có "Phù Hợp Nhất"

**Vercel AI SDK** thắng khi bạn cần streaming UI + web-first.  
**LlamaIndex** thắng khi bạn cần RAG với data riêng.  
**LangChain** thắng khi bạn cần orchestrate agents phức tạp.

Framework nào "tốt nhất" phụ thuộc 100% vào use case. Hiểu rõ điểm mạnh từng cái → chọn đúng → tiết kiệm hàng chục giờ development.

Bạn đang build gì? Web chatbot? RAG system? Multi-agent workflow? Câu trả lời cho câu hỏi đó chính là framework bạn nên chọn.

**Đọc thêm:**
- [Prompt Engineering: Viết Lệnh Để AI Hiểu Bạn](/blog/prompt-engineering-viet-lenh-ai-hieu-ban/) — Nền tảng để dùng bất kỳ AI SDK nào hiệu quả, vì cuối cùng tất cả đều về prompt quality.
- [RAG Nâng Cao: Xây Dựng Hệ Thống Q&A Thông Minh Từ Dữ Liệu Riêng](/blog/rag-nang-cao-xay-dung-he-thong-qa-thong-minh/) — Deep dive vào RAG architecture, giúp bạn hiểu rõ hơn tại sao LlamaIndex sinh ra cho use case này.
- [Function Calling & Tool Use: Khi AI Biết Gọi API và Dùng Công Cụ](/blog/function-calling-tool-use-ai/) — Cơ chế agents trong LangChain/LlamaIndex đều dựa trên function calling — hiểu nó giúp bạn debug agents tốt hơn.
