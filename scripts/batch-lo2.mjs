import { statSync } from 'node:fs';
import sharp from 'sharp';
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Thiếu GEMINI_API_KEY'); process.exit(1); }
const MODEL = 'gemini-2.5-flash-image';
const STYLE = 'minimalist flat vector illustration, warm earthy palette (terracotta #b8763e, beige, soft sage green, muted teal), calm inspiring mood, no text, wide horizontal 16:9 composition';
const JOBS = [
  { n:'hero-can-bang', p:`work-life balance, a person calmly balancing between work and personal life on a seesaw, ${STYLE}` },
  { n:'in-can-bang', p:`balanced daily routine, a harmonious circle of work, rest, family and health, ${STYLE}` },
  { n:'hero-chao-mung', p:`welcome to a personal tech and self-growth blog, an open friendly workspace with laptop and plant, ${STYLE}` },
  { n:'in-chao-mung', p:`journey of growth and creating value, a winding path leading toward a bright goal, ${STYLE}` },
  { n:'hero-smart-goal', p:`SMART goal setting, a target with an arrow and a clear checklist plan, ${STYLE}` },
  { n:'in-smart-goal', p:`five SMART criteria, five connected steps specific measurable achievable relevant time-bound, ${STYLE}` },
  { n:'hero-hoc-tap', p:`lifelong learning, a person reading and growing with books and a sprouting plant of knowledge, ${STYLE}` },
  { n:'in-hoc-tap', p:`continuous learning cycle, curiosity practice reflection improvement in a loop, ${STYLE}` },
  { n:'hero-ky-luat', p:`self-discipline, a focused person following a structured path with steady habits, ${STYLE}` },
  { n:'in-ky-luat', p:`building discipline, small daily consistent actions stacking into strength, ${STYLE}` },
  { n:'hero-thoi-gian', p:`time management, a calm person organizing tasks around a clock efficiently, ${STYLE}` },
  { n:'in-thoi-gian', p:`prioritization matrix, urgent versus important task quadrants, ${STYLE}` },
  { n:'hero-tu-duy', p:`growth mindset, a brain sprouting into a strong tree, believing in progress, ${STYLE}` },
  { n:'in-tu-duy', p:`the power of yet, a person climbing stairs toward improvement not perfection, ${STYLE}` },
  { n:'hero-tri-hoan', p:`overcoming procrastination, a person breaking free from delay and starting a task, ${STYLE}` },
  { n:'in-tri-hoan', p:`beating procrastination, breaking a big task into small first steps, ${STYLE}` },
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
