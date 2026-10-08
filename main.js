import*as C from"./core.js";
const{db,ref,set,push,get,onValue,runTransaction,onDisconnect,N,cl,wk,nb,reach,cpuBoard,cpuMove}=C;
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let me,name,rid,R={},local=0,lvl=2,lastEv=0,stT=0,cpuT=0,busy=0,go=0,lastPh="",tool="S",E={S:"",G:"",W:[]},allLog=0;
const setp=(o,p,v)=>{const k=p.split("/");let x=o;k.slice(0,-1).forEach(a=>x=x[a]??={});v===null?delete x[k.at(-1)]:x[k.at(-1)]=v};
const put=(p,v)=>{if(local){setp(R,p,v);draw()}else return set(ref(db,`rooms/${rid}/${p}`),v)};
const psh=(p,v)=>{if(local){setp(R,p+"/"+Date.now()+Math.random().toString(36).slice(2,6),v);draw()}else return push(ref(db,`rooms/${rid}/${p}`),v)};
const P=u=>R.players?.[u]?.name||"?",PN=u=>R.g?.names?.[u]||P(u);
const isF=u=>!!u&&(R.slots?.a===u||R.slots?.b===u);
const msgs=o=>Object.entries(o||{}).sort((x,y)=>x[0]<y[0]?-1:1).map(e=>e[1]);
const show=id=>["title","lobby","setup","game"].forEach(s=>$("#"+s).hidden=s!==id);
const nameOk=()=>(name=$("#nm").value.trim().slice(0,10))||(alert("なまえを入力してね"),0);
for(let i=10;i<=15;i++)$("#wn").add(new Option(i+"枚",i));

/* ---- title / join ---- */
$("#mk").onclick=async()=>{if(!nameOk())return;me??=await C.login();let id;
 do{id=String(1000+Math.floor(Math.random()*9000))}while((await get(ref(db,"rooms/"+id))).exists());
 await set(ref(db,"rooms/"+id),{admin:me,phase:"lobby",set:{walls:10,spec:true}});join(id)};
$("#jn").onclick=async()=>{if(!nameOk())return;me??=await C.login();const id=$("#rid").value.trim(),s=await get(ref(db,"rooms/"+id));
 if(!s.exists())return alert("ルームが見つかりません");
 if(Object.keys(s.val().players||{}).length>=8)return alert("満員です(最大8人)");join(id)};
$("#cp").onclick=()=>{if(!nameOk())return;me="me";local=1;lvl=+$("#lv").value;
 R={admin:me,phase:"setup",set:{walls:10,spec:false},players:{me:{name,t:1},cpu:{name:"コンピューター",t:2}},slots:{a:me,b:"cpu"},boards:{cpu:cpuBoard(10)}};draw()};
async function join(id){rid=id;const pr=ref(db,`rooms/${id}/players/${me}`);
 await set(pr,{name,t:Date.now()});onDisconnect(pr).remove();lastEv=-1;
 onValue(ref(db,"rooms/"+id),s=>{R=s.val();if(!R){alert("ルームが閉じられました");return location.reload()}watch();draw()})}

/* ---- housekeeping (admin交代・離脱処理) ---- */
function watch(){const pl=R.players||{},ids=Object.keys(pl).sort((a,b)=>pl[a].t-pl[b].t),s=R.slots||{};
 if(lastEv===-1)lastEv=R.g?.ev?.id||0;
 if(!pl[R.admin]&&ids[0]===me)put("admin",me);
 for(const k of["a","b"])if(s[k]&&!pl[s[k]]){const o=s[k==="a"?"b":"a"];
  if(R.phase==="lobby"){if(R.admin===me||(!pl[R.admin]&&ids[0]===me))put("slots/"+k,null)}
  else if(o===me&&!["end","reveal"].includes(R.g?.stage)){put("slots/"+k,null);
   if(R.phase==="setup"){put("phase","lobby");alert("相手が退出しました")}
   else{psh("log",P(me)+":WIN(FORFEIT)");put("g/res",me);put("g/stage","end")}}}}

/* ---- lobby ---- */
function lobby(){const pl=R.players||{},ids=Object.keys(pl).sort((x,y)=>pl[x].t-pl[y].t),ad=R.admin===me,s=R.slots||{},mine=isF(me),full=s.a&&s.b;
 $("#lid").textContent=rid;
 $("#plist").innerHTML=ids.map(u=>`<li>${esc(pl[u].name)}${u===R.admin?" 👑":""}${u===me?"(自分)":""} <b>${isF(u)?"対戦":"観覧"}</b></li>`).join("");
 $("#pst").textContent=full?`${P(s.a)} vs ${P(s.b)}`:(s.a||s.b)?"対戦者を待ってます…":"対戦者はまだいません";
 $("#bp").hidden=mine||!!full;$("#bx").hidden=!mine;
 $("#adm").hidden=!ad;$("#st").disabled=!full;
 if($("#wn").value!=R.set.walls)$("#wn").value=R.set.walls;$("#sp").checked=!!R.set.spec;
 $("#aset").textContent=ad?"":`壁${R.set.walls}枚 / 観覧者の壁表示：${R.set.spec?"あり":"なし"}`}
$("#bp").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.a===me||s.b===me)return s;if(!s.a)s.a=me;else if(!s.b)s.b=me;else return;return s});
$("#bx").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.a===me)delete s.a;if(s.b===me)delete s.b;return s});
$("#wn").onchange=e=>put("set/walls",+e.target.value);
$("#sp").onchange=e=>put("set/spec",e.target.checked);
$("#st").onclick=async()=>{await put("boards",null);await put("g",null);await put("phase","setup")};

/* ---- board drawing ---- */
function bd(el,B,o){B=B||{w:[]};const Z=54,O=30,hit=o.hit||[],pa=new Set(o.path||[]);let h="";
 for(let i=0;i<N;i++)h+=`<text class="lb" x="${O+i*Z+27}" y="20">${i+1}</text><text class="lb" x="14" y="${O+i*Z+33}">${"ABCDEF"[i]}</text>`;
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){const s=r+","+c,f=s===B.S?"#d5f5e3":s===B.G?"#fdebd0":pa.has(s)?"#d6eaf8":"#f4f6f7";
  h+=`<rect data-c="${s}" x="${O+c*Z}" y="${O+r*Z}" width="${Z}" height="${Z}" fill="${f}" stroke="#ccd"/>`;
  if(s===B.S)h+=`<text x="${O+c*Z+27}" y="${O+r*Z+36}" fill="#1e8449" font-size="26">S</text>`;
  if(s===B.G)h+=`<text x="${O+c*Z+27}" y="${O+r*Z+36}" fill="#e67e22" font-size="26">G</text>`}
 const ln=(k,col)=>{const i=+k[1],j=+k[2];return k[0]==="h"?`<line x1="${O+j*Z}" y1="${O+(i+1)*Z}" x2="${O+(j+1)*Z}" y2="${O+(i+1)*Z}" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`:`<line x1="${O+(j+1)*Z}" y1="${O+i*Z}" x2="${O+(j+1)*Z}" y2="${O+(i+1)*Z}" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`};
 for(const k of B.w||[]){if(hit.includes(k))h+=ln(k,"#e74c3c");else if(o.all)h+=ln(k,"#27ae60")}
 if(o.pos){const[r,c]=o.pos.split(",").map(Number);h+=`<circle cx="${O+c*Z+27}" cy="${O+r*Z+27}" r="11" fill="${o.col}"/>`}
 if(o.edge)for(let r=0;r<N;r++)for(let c=0;c<N;c++){
  if(r<N-1)h+=`<rect data-k="h${r}${c}" x="${O+c*Z+8}" y="${O+(r+1)*Z-8}" width="${Z-16}" height="16" fill="transparent"/>`;
  if(c<N-1)h+=`<rect data-k="v${r}${c}" x="${O+(c+1)*Z-8}" y="${O+r*Z+8}" width="16" height="${Z-16}" fill="transparent"/>`}
 el.innerHTML=h;
 el.onclick=e=>{const d=e.target.dataset;if(d.k&&o.edge)o.edge(d.k);else if(d.c&&o.tap)o.tap(d.c)}}
/* ---- setup ---- */
function setup(){const F=isF(me),done=R.boards?.[me]?.ok,cnt=R.set.walls;
 $("#sed").hidden=!F||!!done;
 $("#sinfo").textContent=!F?"対戦者が盤面を作っています…":done?"相手の準備を待っています…":`S・G・壁${cnt}枚を決めてね(壁 ${E.W.length}/${cnt})`;
 ["S","G","W"].forEach(t=>$("#t"+t).classList.toggle("on",tool===t));
 if(F&&!done)bd($("#sb"),{S:E.S,G:E.G,w:E.W},{all:1,
  tap:c=>{if(tool==="S"){E.S=c;if(E.G===c)E.G=""}else if(tool==="G"){E.G=c;if(E.S===c)E.S=""}else return;draw()},
  edge:tool==="W"?k=>{const i=E.W.indexOf(k);if(i>=0)E.W.splice(i,1);else if(E.W.length<cnt)E.W.push(k);draw()}:0});
 const s=R.slots||{};
 if(!go&&(R.admin===me||local)&&s.a&&s.b&&R.boards?.[s.a]?.ok&&R.boards?.[s.b]?.ok){go=1;startGame()}}
["S","G","W"].forEach(t=>$("#t"+t).onclick=()=>{tool=t;draw()});
$("#rd").onclick=()=>{if(!E.S||!E.G||E.S===E.G||E.W.length!==R.set.walls||!reach(new Set(E.W),E.S,E.G))
 return alert("S・G・壁の数を確認してね。SからGへ必ず行ける道が必要です");put(`boards/${me}`,{S:E.S,G:E.G,w:E.W,ok:1})};
async function startGame(){const[a,b]=[R.slots.a,R.slots.b].sort(()=>Math.random()-.5),B=R.boards;
 await put("g",{order:[a,b],turn:0,stage:"start",names:{[a]:P(a),[b]:P(b)},pos:{[a]:B[b].S,[b]:B[a].S},path:{[a]:[B[b].S],[b]:[B[a].S]},ev:{id:Date.now(),k:""}});
 await psh("log",P(a)+":START");await put("phase","play")}

/* ---- play ---- */
async function step(p,to){if(busy)return;busy=1;
 try{const g=R.g,[a,b]=g.order,B=R.boards[p===a?b:a],from=g.pos[p],k=wk(from,to),pre=`${PN(p)}:${cl(from)} to ${cl(to)}...`;
  if((B.w||[]).includes(k)){
   await put(`g/hit/${p}`,[...(g.hit?.[p]||[]),k]);await psh("log",pre+"MISS");await put("g/ev",{id:Date.now(),k:"ng"});
   if(g.sd){await put("g/res",a);await put("g/stage","end")}else await put("g/turn",1-g.turn)
  }else{
   await put(`g/pos/${p}`,to);await put(`g/path/${p}`,[...(g.path?.[p]||[]),to]);await psh("log",pre+"OK");await put("g/ev",{id:Date.now(),k:"ok"});
   if(to===B.G){await put("g/who",p);
    if(g.sd){await put("g/res","draw");await put("g/after","end")}
    else if(p===a)await put("g/after","sudden");
    else{await put("g/res",p);await put("g/after","end")}
    await put("g/stage","goal")}}
 }finally{busy=0;if(local)cpu()}}
function cpu(){const g=R.g;if(!local||busy||cpuT||!g||g.stage!=="play"||g.order[g.turn]!=="cpu")return;
 cpuT=setTimeout(()=>{cpuT=0;const g=R.g;if(g.stage!=="play"||g.order[g.turn]!=="cpu")return;
  step("cpu",cpuMove(lvl,g.pos.cpu,new Set(g.hit?.cpu||[]),new Set(g.path.cpu),R.boards[me].G))},700)}
function play(){const g=R.g,[a,b]=g.order,F=isF(me),rev=g.stage==="reveal",B=R.boards||{},spec=R.set?.spec;
 const[d1,s1,d2,s2]=F?[a===me?b:a,me,me,a===me?b:a]:[a,b,b,a];
 $("#t1").textContent=F?"Crack a Grid(相手の盤面)":PN(d1)+"の盤面";
 $("#t2").textContent=F?"Design a Grid(自分の盤面)":PN(d2)+"の盤面";
 bd($("#b1"),B[d1],{path:g.path?.[s1],pos:g.pos?.[s1],hit:g.hit?.[s1],all:rev||(!F&&spec),col:"#2874a6",
  tap:F?c=>{if(g.stage==="play"&&g.order[g.turn]===me&&nb(g.pos[me]).includes(c))step(me,c)}:0});
 bd($("#b2"),B[d2],{path:g.path?.[s2],pos:g.pos?.[s2],hit:g.hit?.[s2],all:F||rev||spec,col:"#c0392b"});
 $("#gs").textContent=g.stage==="play"?PN(g.order[g.turn])+"の番"+(g.sd?"(サドンデス)":""):rev?"壁を公開！":"";
 $("#lg").innerHTML=msgs(R.log).slice(allLog?-300:-5).map(x=>"<div>"+esc(x)+"</div>").join("");
 $("#lg").classList.toggle("all",!!allLog);
 $("#back").hidden=!(rev&&(R.admin===me||local));
 if(g.stage==="start"&&!stT&&(local||me===a))stT=setTimeout(()=>{stT=0;if(R.g?.stage==="start")put("g/stage","play")},2000)}
$("#al").onclick=()=>{allLog=!allLog;draw()};
$("#back").onclick=async()=>{if(local)return location.reload();await put("phase","lobby");await put("g",null);await put("boards",null)};
/* ---- overlay / fx ---- */
function ov(){const g=R.g||{},st=g.stage,b=g.order?.[1];let h="";
 if(R.phase==="play"){
  if(st==="start")h=`<div class="big">${esc(PN(g.order[0]))}さん先攻！<br>${esc(PN(b))}さん後攻です！</div>`;
  else if(st==="goal")h=`<div class="big">${esc(PN(g.who))}さんゴール！！</div>`;
  else if(st==="sudden")h=`<div class="huge">サドンデス！！！</div><div class="sm">${esc(PN(b))}さん、ゴール出来なかったら負け！</div>`;
  else if(st==="end")h=g.res==="draw"?`<div class="huge">引き分け！！</div>`:`<div class="big">${esc(PN(g.res))}さんの勝ち！！</div>`}
 $("#ov").innerHTML=h;$("#ov").hidden=!h;
 if(g.ev&&g.ev.id!==lastEv){lastEv=g.ev.id;if(g.ev.k){const f=$("#fx");f.textContent=g.ev.k==="ok"?"〇":"✕";f.className=g.ev.k;f.hidden=false;setTimeout(()=>f.hidden=true,500)}}}
$("#ov").onclick=()=>{const g=R.g,st=g?.stage,n={goal:g?.after,sudden:"play",end:"reveal"}[st];if(!n)return;
 if(st==="sudden"){put("g/sd",1);put("g/turn",1)}put("g/stage",n)};

/* ---- chat ---- */
function chats(){const m=msgs(R.chat).slice(-30).map(x=>`<div><b>${esc(x.n)}</b> ${esc(x.t)}</div>`).join(""),can=R.phase==="lobby"||!isF(me);
 document.querySelectorAll(".chat").forEach(c=>{const d=c.querySelector(".msgs");d.innerHTML=m;d.scrollTop=d.scrollHeight;c.querySelector(".cin").hidden=!can;c.hidden=local})}
document.querySelectorAll(".chat").forEach(c=>{const i=c.querySelector("input"),send=()=>{const t=i.value.trim();if(t){psh("chat",{n:name,t});i.value=""}};
 c.querySelector("button").onclick=send;i.onkeydown=e=>e.key==="Enter"&&send()});

/* ---- main render ---- */
function draw(){if(!R||!R.phase)return;const ph=R.phase;
 if(ph!==lastPh){lastPh=ph;if(ph==="setup"){E={S:"",G:"",W:[]};tool="S"}}
 if(ph!=="setup")go=0;
 show(ph==="lobby"?"lobby":ph==="setup"?"setup":"game");
 if(ph==="lobby")lobby();else if(ph==="setup")setup();else if(R.g)play();
 ov();chats();if(local)cpu()}
