import { statSync } from 'node:fs';
import sharp from 'sharp';
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Thiếu GEMINI_API_KEY'); process.exit(1); }
const MODEL = 'gemini-2.5-flash-image';
const STYLE = 'minimalist flat vector illustration, warm earthy palette (terracotta #b8763e, beige, soft sage green, muted teal), clean tech aesthetic, no text, wide horizontal 16:9 composition';
const JOBS = [
  { n:'hero-ai-agent', p:`an AI agent concept, a friendly robot assistant connected to tools and data, ${STYLE}` },
  { n:'in-ai-agent', p:`how an AI agent works, perceive-think-act loop diagram with arrows, ${STYLE}` },
  { n:'hero-ai-agent-work', p:`AI agents automating office work, a robot helping a person at a desk with tasks, ${STYLE}` },
  { n:'in-ai-agent-work', p:`AI agent workflow in business, tasks flowing through automated stages, ${STYLE}` },
  { n:'hero-bao-mat-dev', p:`cybersecurity basics for developers, a shield protecting code and a lock, ${STYLE}` },
  { n:'in-bao-mat-dev', p:`secure coding checklist, a padlock with checkmarks and secure password fields, ${STYLE}` },
  { n:'hero-chon-cong-cu-ai', p:`choosing the right AI tool, a person selecting among different AI app icons, ${STYLE}` },
  { n:'in-chon-cong-cu-ai', p:`comparison of AI tools, several tool cards being weighed and compared, ${STYLE}` },
  { n:'hero-deploy-cf', p:`deploying a website to Cloudflare Pages, uploading files to a cloud with orange cloud, ${STYLE}` },
  { n:'in-deploy-cf', p:`deployment pipeline, code going from git repository to live website via cloud, ${STYLE}` },
  { n:'hero-git-github', p:`Git and GitHub basics, branching version control tree with commits, ${STYLE}` },
  { n:'in-git-github', p:`git workflow, commit-push-pull-merge cycle diagram with branches, ${STYLE}` },
  { n:'hero-llm', p:`how a large language model works, a neural network brain processing text tokens, ${STYLE}` },
  { n:'in-llm', p:`LLM token prediction, words flowing through layers predicting the next word, ${STYLE}` },
  { n:'hero-nocode', p:`no-code low-code development, building apps with drag and drop blocks, ${STYLE}` },
  { n:'in-nocode', p:`visual app builder, connecting blocks and components without writing code, ${STYLE}` },
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
