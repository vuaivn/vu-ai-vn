import { statSync } from 'node:fs';
import sharp from 'sharp';
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Thiếu GEMINI_API_KEY'); process.exit(1); }
const MODEL = 'gemini-2.5-flash-image';
const STYLE = 'minimalist flat vector illustration, warm earthy palette (terracotta #b8763e, beige, soft sage green, muted teal), clean tech aesthetic, no text, wide horizontal 16:9 composition';
const JOBS = [
  { n:'hero-astro-fw', p:`review of the Astro web framework, a fast rocket launching a lightweight website, ${STYLE}` },
  { n:'in-astro-fw', p:`Astro islands architecture, static HTML with small interactive islands, ${STYLE}` },
  { n:'hero-vscode', p:`review of VS Code editor, a modern popular code editor window with extensions, ${STYLE}` },
  { n:'in-vscode', p:`code editor features, extensions debugging and integrated terminal, ${STYLE}` },
  { n:'hero-prompt', p:`prompt engineering basics, a person crafting clear instructions to an AI with chat bubbles, ${STYLE}` },
  { n:'in-prompt', p:`four principles of good prompts, structured instruction with context and examples, ${STYLE}` },
  { n:'hero-tu-dong-hoa', p:`automating work with AI, a robot assistant handling repetitive tasks automatically, ${STYLE}` },
  { n:'in-tu-dong-hoa', p:`AI automation workflow, tasks flowing through automated stages saving time, ${STYLE}` },
  { n:'hero-vector-db', p:`vector database concept, data points as vectors stored and searched by similarity, ${STYLE}` },
  { n:'in-vector-db', p:`semantic similarity search, nearest neighbor vectors in embedding space, ${STYLE}` },
  { n:'hero-xay-web-astro', p:`building a website with Astro, assembling a fast static site from components, ${STYLE}` },
  { n:'in-xay-web-astro', p:`Astro project structure, components pages and content collections building a site, ${STYLE}` },
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
