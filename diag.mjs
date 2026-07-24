const CDP="http://127.0.0.1:9333";
const list=await(await fetch(`${CDP}/json`)).json();
const page=list.find(t=>t.type==="page"&&/gemini/.test(t.url));
const ws=new WebSocket(page.webSocketDebuggerUrl);
let id=0;const p=new Map();
const send=(m,pr={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:pr}))});
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&p.has(m.id)){p.get(m.id)(m);p.delete(m.id)}};
ws.onopen=async()=>{
  await send("Runtime.enable");
  const r=await send("Runtime.evaluate",{expression:`JSON.stringify({
    editor: !!document.querySelector('div[contenteditable="true"], .ql-editor'),
    imgs:[...document.querySelectorAll('img')].map(i=>({s:(i.src||'').slice(0,24),w:i.naturalWidth})).filter(x=>x.w>100),
    tail: document.body.innerText.slice(-500)
  })`,returnByValue:true});
  console.log(r.result.result.value);
  ws.close();process.exit(0);
};
