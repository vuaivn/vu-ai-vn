import { statSync } from 'node:fs';
import sharp from 'sharp';
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Thiếu GEMINI_API_KEY'); process.exit(1); }
const MODEL = 'gemini-2.5-flash-image';
const STYLE = 'minimalist flat vector illustration, warm earthy palette (terracotta #b8763e, beige, soft sage green, muted teal), clean product-review aesthetic, no text, wide horizontal 16:9 composition';
const JOBS = [
  { n:'hero-cursor', p:`review of an AI code editor, a modern IDE window with AI assistant helping write code, ${STYLE}` },
  { n:'in-cursor', p:`AI pair programming in a code editor, suggestions appearing while coding, ${STYLE}` },
  { n:'hero-figma', p:`review of a collaborative design tool, a design canvas with shapes, frames and cursors collaborating, ${STYLE}` },
  { n:'in-figma', p:`UI design workflow, components and frames arranged on a design board, ${STYLE}` },
  { n:'hero-copilot', p:`review of an AI coding assistant, a helpful copilot suggesting code inside an editor, ${STYLE}` },
  { n:'in-copilot', p:`AI autocompleting code, ghost text suggestions in a code file, ${STYLE}` },
  { n:'hero-midjourney', p:`review of an AI image generation tool, an artist palette turning prompts into images, ${STYLE}` },
  { n:'in-midjourney', p:`text prompt transforming into generated artwork, creative AI image process, ${STYLE}` },
  { n:'hero-n8n', p:`review of a workflow automation platform, connected nodes automating tasks in a flow, ${STYLE}` },
  { n:'in-n8n', p:`automation workflow diagram, trigger and action nodes connected by lines, ${STYLE}` },
  { n:'hero-notion', p:`review of an all-in-one workspace with AI, organized notes docs and databases with AI helper, ${STYLE}` },
  { n:'in-notion', p:`connected workspace, pages databases and tasks linked together neatly, ${STYLE}` },
  { n:'hero-obsidian', p:`review of a knowledge management note app, a network graph of linked notes, ${STYLE}` },
  { n:'in-obsidian', p:`linked note-taking, a web of interconnected ideas and backlinks, ${STYLE}` },
  { n:'hero-perplexity', p:`review of an AI answer engine, a search assistant providing answers with cited sources, ${STYLE}` },
  { n:'in-perplexity', p:`AI search with citations, a question producing a sourced answer, ${STYLE}` },
];
async function gen(prompt){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body={contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['IMAGE'],imageConfig:{aspectRatio:'16:9'}}};
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0,150)}`);
  const data=await res.json();
  const part=(data?.candidates?.[0]?.content?.parts??[]).find(p=>p.inlineData?.data);
  if(!part) throw new Error('no image');
  return Buffer.from(part.inlineData.data,'base64');
}
const dir='public/images/posts/';
let fail=0;
for(const j of JOBS){
  let ok=false;
  for(let a=0;a<3&&!ok;a++){
    try{ const buf=await gen(j.p); await sharp(buf).resize(1200).webp({quality:82}).toFile(dir+j.n+'.webp');
      console.log(`✓ ${j.n}.webp (${(statSync(dir+j.n+'.webp').size/1024).toFixed(0)}KB)`); ok=true;
    }catch(e){ console.log(`… retry ${j.n} (${a+1}): ${e.message}`); await new Promise(r=>setTimeout(r,3000)); }
  }
  if(!ok){ console.log(`✗ FAILED ${j.n}`); fail++; }
}
console.log(`DONE (fail=${fail})`);
