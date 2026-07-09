import { statSync } from 'node:fs';
import sharp from 'sharp';
const KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-image';
const STYLE = 'minimalist flat vector illustration, warm earthy palette (terracotta #b8763e, beige, soft sage green, muted teal), calm, no text, wide horizontal 16:9 composition';
const JOBS = [
  { n:'hero-thoi-quen', p:`building good habits, small daily actions stacking into a lasting routine, a calendar with checkmarks and a growing streak, ${STYLE}` },
  { n:'in-thoi-quen', p:`the habit loop, cue routine reward cycle forming an automatic habit, ${STYLE}` },
];
async function gen(prompt){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body={contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['IMAGE'],imageConfig:{aspectRatio:'16:9'}}};
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok) throw new Error(`API ${res.status}`);
  const data=await res.json();
  const part=(data?.candidates?.[0]?.content?.parts??[]).find(p=>p.inlineData?.data);
  return Buffer.from(part.inlineData.data,'base64');
}
for(const j of JOBS){
  const buf=await gen(j.p);
  await sharp(buf).resize(1200).webp({quality:82}).toFile('public/images/posts/'+j.n+'.webp');
  console.log(`✓ ${j.n}.webp (${(statSync('public/images/posts/'+j.n+'.webp').size/1024).toFixed(0)}KB)`);
}
console.log('DONE');
