import { statSync } from 'node:fs';
import sharp from 'sharp';
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Thiếu GEMINI_API_KEY'); process.exit(1); }
const MODEL = 'gemini-2.5-flash-image';
const STYLE = 'minimalist flat vector illustration, warm earthy palette (terracotta #b8763e, beige, soft sage green, muted teal), calm, no text, wide horizontal 16:9 composition';
const JOBS = [
  { hero:'hero-thien', in:'in-thien',
    heroP:`meditation and mindfulness for beginners, a calm person sitting cross-legged breathing peacefully, soft aura, ${STYLE}`,
    inP:`mindful breathing technique, gentle curved lines showing inhale and exhale flow around a calm silhouette, ${STYLE}` },
  { hero:'hero-rag', in:'in-rag',
    heroP:`RAG retrieval augmented generation concept, an AI model retrieving documents from a knowledge database then answering, ${STYLE}`,
    inP:`RAG pipeline diagram, query goes to a vector database, retrieves relevant chunks, feeds an LLM to generate answer, arrows and boxes, ${STYLE}` },
  { hero:'hero-claude-gpt', in:'in-claude-gpt',
    heroP:`comparison between two AI chat assistants side by side, two friendly chat bubbles facing each other, ${STYLE}`,
    inP:`a comparison table concept between two AI models, two columns with checkmarks, ${STYLE}` },
];
async function gen(prompt){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body={contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['IMAGE'],imageConfig:{aspectRatio:'16:9'}}};
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0,200)}`);
  const data=await res.json();
  const part=(data?.candidates?.[0]?.content?.parts??[]).find(p=>p.inlineData?.data);
  if(!part) throw new Error('no image');
  return Buffer.from(part.inlineData.data,'base64');
}
const dir='public/images/posts/';
for(const j of JOBS){
  for(const [name,prompt] of [[j.hero,j.heroP],[j.in,j.inP]]){
    let ok=false;
    for(let a=0;a<3&&!ok;a++){
      try{
        const buf=await gen(prompt);
        await sharp(buf).resize(1200).webp({quality:82}).toFile(dir+name+'.webp');
        console.log(`✓ ${name}.webp (${(statSync(dir+name+'.webp').size/1024).toFixed(0)}KB)`);
        ok=true;
      }catch(e){ console.log(`… retry ${name} (${a+1}): ${e.message}`); await new Promise(r=>setTimeout(r,3000)); }
    }
    if(!ok) console.log(`✗ FAILED ${name}`);
  }
}
console.log('DONE');
