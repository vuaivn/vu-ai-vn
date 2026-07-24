import { writeFileSync } from "node:fs";
const CDP="http://127.0.0.1:9333";
const PROMPT=process.argv[2];
const OUT=process.argv[3];
const list=await(await fetch(`${CDP}/json`)).json();
const page=list.find(t=>t.type==="page"&&/gemini/.test(t.url));
const ws=new WebSocket(page.webSocketDebuggerUrl);
let id=0;const p=new Map();
const send=(m,pr={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:pr}))});
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&p.has(m.id)){p.get(m.id)(m);p.delete(m.id)}};
const evalJs=async(ex,aw=true)=>(await send("Runtime.evaluate",{expression:ex,returnByValue:true,awaitPromise:aw})).result?.result?.value;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ws.onopen=async()=>{
  await send("Runtime.enable");
  // baseline blob srcs
  const base=await evalJs(`JSON.stringify([...document.querySelectorAll('img')].filter(i=>(i.src||'').startsWith('blob:')).map(i=>i.src))`,false);
  await evalJs(`window.__b=${base};`,false);
  // type
  await evalJs(`(()=>{const el=document.querySelector('div[contenteditable="true"], .ql-editor');el.focus();document.execCommand('selectAll',false,null);document.execCommand('insertText',false,${JSON.stringify(PROMPT)});return 1})()`,false);
  await sleep(700);
  // send
  await evalJs(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>/g\\u1eedi|send/i.test((x.getAttribute('aria-label')||'')+(x.textContent||'')));if(b){b.click();return 'C'}const el=document.querySelector('div[contenteditable="true"], .ql-editor');el?.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,bubbles:true}));return 'E'})()`,false);
  let got=null;
  for(let i=0;i<60;i++){
    await sleep(2000);
    const out=await evalJs(`(()=>{const base=window.__b||[];const cand=[...document.querySelectorAll('img')].filter(i=>(i.naturalWidth||0)>=512&&(i.src||'').startsWith('blob:')&&!base.includes(i.src));const im=cand.pop();if(!im)return JSON.stringify({w:1});const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);return JSON.stringify({ok:1,w:im.naturalWidth,h:im.naturalHeight,data:c.toDataURL('image/png').split(',')[1]})})()`,false);
    const o=JSON.parse(out);
    if(o.ok){got=o;break;}
  }
  if(!got){console.error("TIMEOUT");ws.close();process.exit(4);}
  writeFileSync(OUT,Buffer.from(got.data,"base64"));
  console.log(`SAVED ${OUT} ${got.w}x${got.h}`);
  ws.close();process.exit(0);
};
