import { readFileSync, writeFileSync } from "node:fs";
import { applyWatermarkBuffer } from "C:/Users/Administrator/aicoworker/openclaw/skills/blog-writing-mastery/scripts/lib-watermark.mjs";
const jobs=[
  ["_raw-prompt.png","hero-prompt-engineering-co-ban.webp"],
  ["_raw-llm.png","hero-chay-llm-local.webp"],
  ["_raw-review.png","hero-review-claude-gpt-gemini.webp"],
];
const dir="C:/Users/Administrator/aicoworker/openclaw/workspace-builtwebsite/vu-ai-vn/public/images/posts/";
for(const [src,dst] of jobs){
  const buf=readFileSync(dir+src);
  const wm=await applyWatermarkBuffer(buf,"vu.ai.vn",{pos:"br",quality:82});
  writeFileSync(dir+dst,wm);
  console.log("WM "+dst+" "+wm.length+" bytes");
}
