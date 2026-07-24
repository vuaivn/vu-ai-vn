import { writeFileSync } from "node:fs";
const CDP="http://127.0.0.1:9333";
const list=await(await fetch(`${CDP}/json`)).json();
const page=list.find(t=>t.type==="page"&&/gemini/.test(t.url));
const ws=new WebSocket(page.webSocketDebuggerUrl);
let id=0;const p=new Map();
const send=(m,pr={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:pr}))});
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&p.has(m.id)){p.get(m.id)(m);p.delete(m.id)}};
const evalJs=async(ex)=>(await send("Runtime.evaluate",{expression:ex,returnByValue:true,awaitPromise:true})).result?.result?.value;
ws.onopen=async()=>{
  await send("Runtime.enable");
  const n=await evalJs(`[...document.querySelectorAll('img')].filter(i=>(i.naturalWidth||0)>=512&&(i.src||'').startsWith('blob:')).length`);
  for(let k=0;k<n;k++){
    const out=await evalJs(`(()=>{const arr=[...document.querySelectorAll('img')].filter(i=>(i.naturalWidth||0)>=512&&(i.src||'').startsWith('blob:'));const im=arr[${k}];const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);return c.toDataURL('image/png').split(',')[1]})()`);
    writeFileSync(`C:/Users/Administrator/aicoworker/openclaw/workspace-builtwebsite/vu-ai-vn/public/images/posts/_blob${k}.png`,Buffer.from(out,"base64"));
    console.log("blob"+k+" saved");
  }
  ws.close();process.exit(0);
};
