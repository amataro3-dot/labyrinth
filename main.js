import*as C from"./core.js?v=10";
const{db,ref,set,push,get,onValue,runTransaction,onDisconnect,serverTimestamp,N,cl,wk,nb,reach,cpuBoard,cpuMove}=C;
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let me,name,rid,R={},local=0,lvl=2,lastEv=0,lastTn=0,stT=0,cpuT=0,busy=0,go=0,lastPh="",tool="S",E={S:"",G:"",W:[]},allLog=0,lgHold=0,lgTouch=0,betView=0,cdReg=0,so=0,go2=0,DS="",dwr={};
const setp=(o,p,v)=>{const k=p.split("/");let x=o;k.slice(0,-1).forEach(a=>x=x[a]??={});v===null?delete x[k.at(-1)]:x[k.at(-1)]=v};
const put=(p,v)=>{if(local){setp(R,p,v);draw()}else return set(ref(db,`rooms/${rid}/${p}`),v)};
const psh=(p,v)=>{if(local){setp(R,p+"/"+Date.now()+Math.random().toString(36).slice(2,6),v);draw()}else return push(ref(db,`rooms/${rid}/${p}`),v)};
const P=u=>R.players?.[u]?.name||"?",PN=u=>R.g?.names?.[u]||P(u);
const MULTI=()=>R.set?.mode==="multi",MC=["c1","c2","c3","c4","c5","c6","c7"],mcnt=s=>MC.filter(k=>s[k]).length,DBL=()=>R.set?.mode==="double",SK=()=>DBL()?["a","a2","b","b2"]:MULTI()?["q",...MC]:["a","b"],TM={tA:["a","a2"],tB:["b","b2"]},SL={a:"A1",a2:"A2",b:"B1",b2:"B2"};
const isF=u=>!!u&&SK().some(k=>R.slots?.[k]===u);
const mem=t=>TM[t].map(k=>R.slots?.[k]).filter(Boolean);
const tOf=u=>DBL()?(TM.tA.some(k=>R.slots?.[k]===u)?"tA":TM.tB.some(k=>R.slots?.[k]===u)?"tB":null):(isF(u)?u:null);
const gids=()=>DBL()?["tA","tB"]:MULTI()?[R.slots?.q]:[R.slots?.a,R.slots?.b];
const gname=id=>DBL()?mem(id).map(P).join("&"):P(id);
const slab=u=>{const k=Object.keys(R.slots||{}).find(x=>R.slots[x]===u);return k?(DBL()?SL[k]:MULTI()?(k==="q"?"出題者":"参加"):"対戦"):"観戦"};
const wr=(g,id)=>g.mem?.[id]?.[0]||id;
const blab=id=>{const pl=R.phase==="play"&&R.g,mm=DBL()&&((pl&&pl.mem?.[id])||mem(id));return mm?`${id==="tA"?"A":"B"}(${mm.map(u=>((pl&&pl.names?.[u])||P(u))+"さん").join("、")})`:""};
const msgs=o=>Object.entries(o||{}).sort((x,y)=>x[0]<y[0]?-1:1).map(e=>e[1]);
const show=id=>["title","lobby","setup","bonus","game"].forEach(s=>$("#"+s).hidden=s!==id);
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
const nameOk=()=>(name=$("#nm").value.trim().slice(0,10))?(LS.set("lab_name",name),1):(alert("なまえを入力してね"),0);
for(let i=10;i<=20;i++)$("#wn").add(new Option(i+"枚",i));
for(let i=10;i<=20;i++)$("#cw").add(new Option("壁"+i+"枚",i));
for(let i=15;i<=20;i++)$("#tl").add(new Option(i+"周",i));

const ck=s=>String(s).replace(/[.$#\[\]\/]/g,"_");
const cn=nm=>R.coins?.[ck(nm)]?.n??0;

/* ---- title / join ---- */
$("#mk").onclick=async()=>{if(!nameOk())return;me??=await C.login();let id;
 do{id=String(1000+Math.floor(Math.random()*9000))}while((await get(ref(db,"rooms/"+id))).exists());
 await set(ref(db,"rooms/"+id),{admin:me,phase:"lobby",set:{walls:10,spec:true}});join(id)};
$("#jn").onclick=async()=>{if(!nameOk())return;me??=await C.login();const id=$("#rid").value.trim(),s=await get(ref(db,"rooms/"+id));
 if(!s.exists())return alert("ルームが見つかりません");
 if(Object.keys(s.val().players||{}).length>=8)return alert("満員です(最大8人)");join(id)};
$("#cp").onclick=()=>{if(!nameOk())return;me="me";local=1;lvl=+$("#lv").value;const cw=+$("#cw").value;
 R={admin:me,phase:"setup",set:{walls:cw,spec:false,coin:false},players:{me:{name,t:1},cpu:{name:"コンピューター",t:2}},slots:{a:me,b:"cpu"},boards:{cpu:cpuBoard(cw)}};draw()};
async function join(id){const cs=(await get(ref(db,`rooms/${id}/set/coin`))).val();
 if(cs){const ps=(await get(ref(db,`rooms/${id}/players`))).val()||{};if(Object.entries(ps).some(([u,p])=>u!==me&&ck(p.name)===ck(name)))return alert("その名前は使われています。べつの名前にしてね")}
 rid=id;const pr=ref(db,`rooms/${id}/players/${me}`);
 await set(pr,{name,t:Date.now()});onDisconnect(pr).remove();lastEv=-1;LS.set("lab_room",id);
 await new Promise(r=>{onValue(ref(db,".info/serverTimeOffset"),s=>{so=s.val()||0;r()},{onlyOnce:true});setTimeout(r,2000)});
 if(cs){const cr=ref(db,`rooms/${id}/coins/${ck(name)}`),c=(await get(cr)).val();
  if(!c||c.n===undefined||(c.off&&Date.now()+so-c.off>300000))await set(cr,{n:5});else if(c.off)await set(ref(db,`rooms/${id}/coins/${ck(name)}/off`),null)}
 onValue(ref(db,"rooms/"+id),s=>{R=s.val();if(!R){LS.del("lab_room");alert("ルームが閉じられました");return location.reload()}watch();draw()})}

/* ---- housekeeping (admin交代・離脱処理) ---- */
const gone={};let wt=0;
function watch(){const pl=R.players||{},ids=Object.keys(pl).sort((a,b)=>pl[a].t-pl[b].t),s=R.slots||{},now=Date.now();let wait=0;
 if(lastEv===-1){lastEv=R.g?.ev?.id||0;lastTn=R.g?.tn?.id||0}
 if(!pl[me]){const pr=ref(db,`rooms/${rid}/players/${me}`);set(pr,{name,t:now});onDisconnect(pr).remove()}
 const miss=u=>{if(pl[u]){delete gone[u];return 0}gone[u]??=now;if(now-gone[u]<10000){wait=1;return 0}return 1};
 if(miss(R.admin)&&ids[0]===me)put("admin",me);
 if(MULTI())mwatch(miss,pl,ids,s);else for(const k of SK())if(s[k]&&miss(s[k])){const ok2=DBL()?(TM.tA.includes(k)?TM.tB:TM.tA):[k==="a"?"b":"a"],o=ok2.map(x=>s[x]).find(u=>u&&pl[u]);
  if(R.phase==="lobby"){if(R.admin===me||(!pl[R.admin]&&ids[0]===me))put("slots/"+k,null)}
  else if(o===me&&!["end","reveal"].includes(R.g?.stage)){put("slots/"+k,null);
   if(R.phase==="setup"||R.phase==="bonus"){put("phase","lobby");alert("相手が退出しました")}
   else{const mt=tOf(me);psh("log",PN(mt)+":WIN(FORFEIT)");put("g/res",mt);put("g/stage","end")}}}
 if(wait&&!wt)wt=setTimeout(()=>{wt=0;watch()},10200)}

/* ---- lobby ---- */
function lobby(){const pl=R.players||{},ids=Object.keys(pl).sort((x,y)=>pl[x].t-pl[y].t),ad=R.admin===me,s=R.slots||{},mine=isF(me),dbl=DBL(),multi=MULTI(),full=multi?!!(s.q&&mcnt(s)>=2):SK().every(k=>s[k]);
 $("#lid").textContent=rid;
 $("#plist").innerHTML=ids.map(u=>`<li>${esc(pl[u].name)}${u===R.admin?" 👑":""}${u===me?"(自分)":""}${R.set.coin?" 🪙"+cn(pl[u].name):""} <b>${slab(u)}</b></li>`).join("");
 $("#pst").textContent=multi?(full?`出題者 ${P(s.q)} / 挑戦者${mcnt(s)}人`:"出題者1人と挑戦者2人以上が必要です"):dbl?(full?`${gname("tA")} vs ${gname("tB")}`:"A1・A2・B1・B2の4人がそろうとスタートできます"):full?`${P(s.a)} vs ${P(s.b)}`:(s.a||s.b)?"対戦者を待ってます…":"対戦者はまだいません";
 $("#bp").hidden=mine||!!full;$("#bx").hidden=!mine;
 $("#sr").hidden=dbl||multi;$("#dbl").hidden=!dbl;$("#mul").hidden=!multi;$("#tw").hidden=!multi;
 $("#m1").classList.toggle("on",!dbl&&!multi);$("#m2").classList.toggle("on",dbl);$("#m3").classList.toggle("on",multi);$("#m3").disabled=ids.length<3&&!multi;
 if($("#tl").value!=(R.set.turns||15))$("#tl").value=R.set.turns||15;
 if(multi){$("#mls").textContent=`出題者:${s.q?P(s.q):"-"} / 挑戦者(${mcnt(s)}人):${MC.filter(k=>s[k]).map(k=>P(s[k])).join("、")||"-"}`;$("#mq").hidden=mine||!!s.q;$("#mj").hidden=mine||mcnt(s)>=7;$("#mx").hidden=!mine}
 if(dbl)["a","a2","b","b2"].forEach(k=>{$("#n_"+k).textContent=s[k]?P(s[k]):"";$("#d_"+k).classList.toggle("on",s[k]===me)});
 $("#adm").hidden=!ad;$("#st").disabled=!full;
 if($("#wn").value!=R.set.walls)$("#wn").value=R.set.walls;$("#sp").checked=!!R.set.spec;$("#cb").checked=!!R.set.coin;$("#sp").disabled=!!R.set.coin;$("#bw").disabled=!R.set.coin||MULTI();$("#bw").checked=!!R.set.bonus;
 $("#aset").textContent=ad?"":`${dbl?"ダブルス":multi?"マルチ":"シングル"} / 壁${R.set.walls}枚${multi?` / 周の上限 ${R.set.turns||15}`:""} / 観戦者の壁表示：${R.set.spec?"あり":"なし"} / コインバトル：${R.set.coin?"オン":"オフ"}${R.set.coin?` / ボーナスウォール：${R.set.bonus?"オン":"オフ"}`:""}`}
$("#bp").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.a===me||s.b===me)return s;if(!s.a)s.a=me;else if(!s.b)s.b=me;else return;return s});
$("#bx").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.a===me)delete s.a;if(s.b===me)delete s.b;return s});
["a","a2","b","b2"].forEach(k=>$("#d_"+k).onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s[k]&&s[k]!==me)return;const had=s[k]===me;for(const x in s)if(s[x]===me)delete s[x];if(!had)s[k]=me;return s}));
const setMode=async x=>{if((R.set.mode||"single")===x)return;if(x==="multi"&&Object.keys(R.players||{}).length<3)return alert("マルチは3人以上そろってから選べます");await put("slots",null);await put("set/mode",x)};
$("#m1").onclick=()=>setMode("single");$("#m2").onclick=()=>setMode("double");$("#m3").onclick=()=>setMode("multi");
$("#tl").onchange=e=>put("set/turns",+e.target.value);
$("#mq").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.q)return;for(const k in s)if(s[k]===me)delete s[k];s.q=me;return s});
$("#mj").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.q===me||MC.some(k=>s[k]===me))return s;const k=MC.find(x=>!s[x]);if(!k)return;s[k]=me;return s});
$("#mx").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};for(const k in s)if(s[k]===me)delete s[k];return s});
$("#wn").onchange=e=>put("set/walls",+e.target.value);
$("#sp").onchange=e=>put("set/spec",e.target.checked);
$("#cb").onchange=async e=>{const on=e.target.checked,pl=R.players||{};
 if(on){const ks=Object.values(pl).map(p=>ck(p.name));if(new Set(ks).size<ks.length){alert("同じ名前の人がいるので、コインバトルは始められません");e.target.checked=false;return}
  for(const u in pl)await put("coins/"+ck(pl[u].name),{n:5});await put("set/spec",true);await put("set/coin",true)}
 else{if(!confirm("コインが消えますが本当にやめますか？")){e.target.checked=true;return}await put("coins",null);await put("set/bonus",false);await put("set/coin",false)}};
$("#bw").onchange=e=>put("set/bonus",e.target.checked);
$("#st").onclick=async()=>{await put("boards",null);await put("g",null);await put("log",null);await put("bets",null);await put("prog",null);await put("bonus",null);await put("bq",null);await put("bt",null);await put("bgo",null);await put("tb",null);
 if(DBL()){const tb={};for(const t of["tA","tB"]){const mm=mem(t),sh=[...mm].sort(()=>Math.random()-.5);tb[t]={m:mm,s:sh[0],g:sh[1],f:mm[Math.random()<.5?0:1]}}await put("tb",tb)}
 await put("phase","setup")};

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
 const pc={};for(const p of o.pieces||[]){if(!p.pos)continue;const[r,c]=p.pos.split(",").map(Number),n=pc[p.pos]=(pc[p.pos]||0)+1,dx=((n-1)%3-1)*9,dy=Math.floor((n-1)/3)*9;
  h+=`<circle cx="${O+c*Z+27+dx}" cy="${O+r*Z+27+dy}" r="11" fill="${p.col}" stroke="#fff"/><text x="${O+c*Z+27+dx}" y="${O+r*Z+32+dy}" fill="#fff" font-size="13" text-anchor="middle">${esc(p.t)}</text>`}
 if(o.edge)for(let r=0;r<N;r++)for(let c=0;c<N;c++){
  if(r<N-1)h+=`<rect data-k="h${r}${c}" x="${O+c*Z+8}" y="${O+(r+1)*Z-8}" width="${Z-16}" height="16" fill="transparent"/>`;
  if(c<N-1)h+=`<rect data-k="v${r}${c}" x="${O+(c+1)*Z-8}" y="${O+r*Z+8}" width="16" height="${Z-16}" fill="transparent"/>`}
 el.innerHTML=h;
 el.onclick=e=>{const d=e.target.dataset;if(d.k&&o.edge)o.edge(d.k);else if(d.c&&o.tap)o.tap(d.c)}}

/* ---- setup ---- */
const pushProg=()=>{if(local||DBL()||!isF(me)||(MULTI()&&me!==R.slots?.q))return;const o={S:E.S,G:E.G,n:E.W.length};if(R.set?.spec)o.w=[...E.W];put("prog/"+me,o)};
async function settle(){const g=R.g,[a,b]=g.order,res=g.res,bt=Object.values(R.bets||{}),d={},nm={};
 const add=(n,v)=>{const k=ck(n);d[k]=(d[k]||0)+v;nm[k]=n};
 if(res!=="draw"){(g.mem?.[res]||[res]).forEach(u=>add(g.names[u],2));(g.mem?.[res===a?b:a]||[res===a?b:a]).forEach(u=>add(g.names[u],-2))}
 bt.forEach(x=>add(x.n,x.c===res?1:-1));
 await psh("log","🎯HIT: "+(bt.filter(x=>x.c===res).map(x=>x.n).join(", ")||"none"));
 const o=[];
 for(const k in d){const old=cn(nm[k]),nw=Math.max(0,old+d[k]);if(nw!==old){await put("coins/"+k+"/n",nw);o.push(nm[k]+" "+(nw>old?"+":"")+(nw-old))}}
 if(o.length)await psh("log","🪙 "+o.join(", "))}
function setup(){const F=isF(me),dbl=DBL(),t=tOf(me),cnt=R.set.walls,tb=R.tb?.[t]||{},
 done=dbl?(!!R.boards?.[t]?.ok||!!tb.rd?.[me]):!!R.boards?.[me]?.ok,W=F&&!done&&(!MULTI()||me===R.slots?.q);
 $("#sed").hidden=!(W&&!dbl);$("#ded").hidden=!(W&&dbl);
 if(W&&dbl)dedit(t);
 else $("#sinfo").textContent=W?`S・G・壁${cnt}枚を決めてね(壁 ${E.W.length}/${cnt})`:F?(MULTI()?"出題者が盤面を作っています…":"相手の準備を待っています…"):"対戦者が盤面を作っています…";
 ["S","G","W"].forEach(t=>$("#t"+t).classList.toggle("on",tool===t));
 if(W&&!dbl)bd($("#sb"),{S:E.S,G:E.G,w:E.W},{all:1,
  tap:c=>{if(tool==="S"){E.S=c;if(E.G===c)E.G=""}else if(tool==="G"){E.G=c;if(E.S===c)E.S=""}else return;pushProg();draw()},
  edge:tool==="W"?k=>{const i=E.W.indexOf(k);if(i>=0)E.W.splice(i,1);else if(E.W.length<cnt)E.W.push(k);pushProg();draw()}:0});
 $("#wt").hidden=W||local;if(!W&&!local)wait(F);
 dfin();
 const ids=gids();
 if(!go&&(R.admin===me||local)&&ids.every(x=>x&&R.boards?.[x]?.ok)){go=1;R.set.coin&&R.set.bonus&&!local&&!MULTI()?startBonus():startGame()}}
function dfin(){if(!DBL()||R.admin!==me)return;
 for(const t of["tA","tB"]){const b=R.tb?.[t];if(b?.m&&b.m.every(u=>b.rd?.[u])&&!R.boards?.[t]?.ok&&!dwr[t]){dwr[t]=1;put("boards/"+t,{S:b.S,G:b.G,w:b.w||[],ok:1})}}}
function dedit(t){const tb=R.tb?.[t]||{},cnt=R.set.walls,w=tb.w||[],S=tb.S||"",G=tb.G||"",n=w.length,m=tb.m||[],
 placer=n%2===0?tb.f:m.find(x=>x!==tb.f),both=!!(S&&G),all=both&&n>=cnt,role=me===tb.s?"S":"G",myDone=role==="S"?!!S:!!G;
 if(S&&S===G&&me===tb.g){put(`tb/${t}/G`,null);return}
 const canTap=!both&&!myDone,canEdge=both&&n<cnt&&me===placer;
 let msg="";
 if(!both)msg=myDone?`決定ずみ!相手が${role==="S"?"ゴール":"スタート"}を決めるまで待ってね`:`あなたは${role==="S"?"スタート(S)":"ゴール(G)"}担当です。マスをタップして「決定」`;
 else if(!all)msg=me===placer?`あなたの番です(壁 ${n}/${cnt})。置きたい場所をタップして「決定」`:`${P(placer)}さんが壁を置いています(壁 ${n}/${cnt})`;
 else msg="壁が全部置かれました。「準備完了」を押してね";
 $("#sinfo").textContent=msg;
 if(DS&&(DS.includes(",")?!canTap:!canEdge))DS="";
 $("#dok").hidden=!(canTap||canEdge);$("#drd").hidden=!all;
 const ed=DS&&!DS.includes(",");
 bd($("#db"),{S,G,w:ed?[...w,DS]:w},{all:1,hit:ed?[DS]:[],pos:DS&&DS.includes(",")?DS:undefined,col:"#8e44ad",
  tap:canTap?c=>{DS=c;draw()}:0,
  edge:canEdge?k=>{if(!w.includes(k)){DS=k;draw()}}:0})}
$("#dok").onclick=async()=>{const t=tOf(me),tb=R.tb?.[t]||{},w=tb.w||[];if(!DS)return alert("先にマスや壁をタップしてね");
 if(DS.includes(",")){const isS=me===tb.s;if(DS===(isS?tb.G:tb.S))return alert("同じ場所は選べません");await put(`tb/${t}/${isS?"S":"G"}`,DS)}
 else{if(!reach(new Set([...w,DS]),tb.S,tb.G))return alert("ゴールへの道がなくなるので、そこには置けません");await put(`tb/${t}/w`,[...w,DS])}
 DS="";draw()};
$("#drd").onclick=()=>put(`tb/${tOf(me)}/rd/${me}`,1);
function wait(F){const u=gids(),spec=R.set.spec,cnt=R.set.walls,coin=!!R.set.coin,bets=R.bets||{},my=bets[me]?.c;
 $("#stat").innerHTML=u.map(x=>`<div>${R.boards?.[x]?.ok?"✓ "+esc(gname(x))+"さん"+(MULTI()?"(出題者)":"")+"準備完了":esc(gname(x))+"さん"+(MULTI()?"(出題者)":"")+"作成中"}</div>`).join("");
 $("#vw").hidden=F;
 if(!F){betView=Math.min(betView,u.length-1);const x=u[betView],B=R.boards?.[x]?.ok?R.boards[x]:((DBL()?R.tb:R.prog)?.[x]||{}),n=(B.ok||DBL())?(B.w||[]).length:(B.n||0);
  $("#v0").textContent=gname(u[0])+"さん";$("#v1").textContent=u[1]?gname(u[1])+"さん":"";$("#v0").hidden=$("#v1").hidden=u.length<2;
  $("#v0").classList.toggle("on",betView===0);$("#v1").classList.toggle("on",betView===1);
  bd($("#vb"),{S:B.S,G:B.G,w:spec?(B.w||[]):[]},{all:1});
  $("#vc").textContent=`${gname(x)}さんの壁 ${n}/${cnt}`+(spec?"":"(壁の位置はひみつ)")}
 const canBet=coin&&!F&&!MULTI();
 $("#bet").hidden=!canBet;$("#rkw").hidden=!coin;
 if(canBet){const mc=cn(name),k=x=>Object.values(bets).filter(b=>b.c===x).length;
  $("#mc").textContent=`🪙 あなたのコイン:${mc}枚`+(mc<1?"(0枚なので賭けられません)":"(1枚賭けます)");
  $("#bo").innerHTML=[[u[0],blab(u[0])||gname(u[0])+"さん"],[u[1],blab(u[1])||gname(u[1])+"さん"],["draw","引き分け"]].map(([c,t])=>`<button data-c="${esc(c)}" class="${my===c?"on":""}"${mc<1?" disabled":""}>${esc(t)}<br>${k(c)}票</button>`).join("")}
 if(coin)$("#rk").innerHTML=rankHtml();
 $("#bhint").textContent=R.set.bonus?"全員の壁ができるまで変えられます(誰に賭けたかは見えません)":"ゲームが始まるまで変えられます(誰に賭けたかは見えません)"}
$("#v0").onclick=()=>{betView=0;draw()};$("#v1").onclick=()=>{betView=1;draw()};
$("#bo").onclick=e=>{const b=e.target.closest("button");if(b&&R.phase==="setup"&&R.set.coin&&!local&&!isF(me)&&cn(name)>=1)put("bets/"+me,{c:b.dataset.c,n:name})};
["S","G","W"].forEach(t=>$("#t"+t).onclick=()=>{tool=t;draw()});
$("#rd").onclick=()=>{if(!E.S||!E.G||E.S===E.G||E.W.length!==R.set.walls||!reach(new Set(E.W),E.S,E.G))
 return alert("S・G・壁の数を確認してね。SからGへ必ず行ける道が必要です");put(`boards/${me}`,{S:E.S,G:E.G,w:E.W,ok:1})};
async function startGame(){if(MULTI())return mstartGame();const ids=gids(),[a,b]=[...ids].sort(()=>Math.random()-.5),B=R.boards,d=DBL(),mm=d?{tA:mem("tA"),tB:mem("tB")}:{[a]:[a],[b]:[b]},names={};
 if(d)["tA","tB"].forEach(t=>{names[t]=mem(t).map(P).join("&");mem(t).forEach(u=>names[u]=P(u))});else{names[a]=P(a);names[b]=P(b)}
 await put("g",{order:[a,b],turn:0,stage:"start",names,mem:mm,f:{[a]:Math.random()<.5?0:1,[b]:Math.random()<.5?0:1},cnt:{[a]:0,[b]:0},pos:{[a]:B[b].S,[b]:B[a].S},path:{[a]:[B[b].S],[b]:[B[a].S]},ev:{id:Date.now(),k:""}});
 await psh("log",names[a]+":START");await put("phase","play")}

/* ---- bonus wall ---- */
const rankHtml=()=>Object.values(R.players||{}).map(p=>[p.name,cn(p.name)]).sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0])).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x[0])}</td><td>🪙${x[1]}</td></tr>`).join("");
async function startBonus(){const sp=Object.keys(R.players||{}).filter(u=>!isF(u));
 if(!sp.length)return startGame();
 const q={};sp.forEach(u=>q[u]=R.players[u].name);
 await put("bonus",null);await put("bgo",null);await put("bq",q);await put("bt",Date.now()+so+15000);await put("phase","bonus")}
const claim=async()=>(await runTransaction(ref(db,`rooms/${rid}/bgo`),v=>v?undefined:1)).committed;
const bInfo=()=>{const q=R.bq||{},pk=R.bonus||{},left=Math.ceil(((R.bt||0)-(Date.now()+so))/1000),todo=Object.keys(q).filter(u=>R.players?.[u]&&!pk[u]);return{q,pk,left,todo,sel:!isF(me)&&!!q[me]&&!pk[me]&&left>0}};
function bTick(){const i=bInfo(),t=Math.max(0,i.left);
 $("#bmsg").textContent=`ボーナスウォールを指定して下さい(あと${t}秒)  緑の壁をタップ`;
 $("#bw1").textContent=isF(me)?`準備完了!(あと${t}秒)`:`作成中…(あと${t}秒)`;
 $("#bwho").innerHTML=i.todo.map(u=>`<div>${esc(i.q[u])}さん(観戦者)ボーナスウォール指定中…</div>`).join("");
 if(!go2&&((R.admin===me&&(i.left<=0||!i.todo.length))||(isF(me)&&i.left<=-4))){go2=1;claim().then(ok=>ok&&startGame())}}
function pickW(o,k){if((R.boards?.[o]?.w||[]).includes(k))put("bonus/"+me,{o,k,n:name})}
function bonus(){const[a,b]=gids(),F=isF(me),i=bInfo(),B=R.boards||{};
 $("#bsel").hidden=!i.sel;$("#bwait").hidden=i.sel;
 if(i.sel){$("#bt1").textContent=gname(a)+"さんの盤面";$("#bt2").textContent=gname(b)+"さんの盤面";
  bd($("#bb1"),B[a],{all:1,edge:k=>pickW(a,k)});bd($("#bb2"),B[b],{all:1,edge:k=>pickW(b,k)})}
 $("#bpl").hidden=!F;if(F)$("#brk").innerHTML=rankHtml();
 bTick()}
setInterval(()=>{if(R.phase==="bonus")bTick()},500);
async function bonusHit(p,k,first){if(!first||local||!R.set.coin||!R.set.bonus)return;const g=R.g,[a,b]=g.order,o=p===a?b:a;
 for(const x of Object.values(R.bonus||{}))if(x.o===o&&x.k===k){await put("coins/"+ck(x.n)+"/n",cn(x.n)+1);await psh("log","💥 "+x.n+"さんのボーナスウォール命中 +1")}}

/* ---- multi ---- */
const MCOL=["#2874a6","#c0392b","#27ae60","#f39c12","#8e44ad","#16a085","#d35400"];
function mwatch(miss,pl,ids,s){const keys=SK();
 for(const k of keys){const u=s[k];if(!u||!miss(u))continue;
  if(R.phase==="lobby"){if(R.admin===me||(!pl[R.admin]&&ids[0]===me))put("slots/"+k,null);continue}
  if(keys.map(x=>s[x]).find(x=>x&&pl[x])!==me)continue;
  const g=R.g;
  if(R.phase==="setup"){put("slots/"+k,null);if(k==="q"||mcnt(s)-1<2){put("phase","lobby");alert("参加者が退出しました")}continue}
  if(R.phase==="play"&&g?.multi&&!["end","reveal"].includes(g.stage)){
   put("slots/"+k,null);
   if(k==="q"){put("phase","lobby");alert("出題者が退出したので中止しました");continue}
   put("g/left/"+u,1);
   if(!g.order.some(x=>x!==u&&!g.left?.[x]&&!(g.arr||[]).includes(x))){mfinish({...g,left:{...(g.left||{}),[u]:1}});continue}
   if(g.mv===u&&g.stage==="play")mnext(u,{[u]:1})}}}
async function mstartGame(){const s=R.slots,B=R.boards,q=s.q,order=MC.map(k=>s[k]).filter(Boolean).sort(()=>Math.random()-.5),names={},pos={},path={};
 [q,...order].forEach(u=>names[u]=P(u));order.forEach(u=>{pos[u]=B[q].S;path[u]=[B[q].S]});
 await put("g",{multi:1,q,order,names,pos,path,turn:0,mv:order[0],st:0,rn:1,lim:R.set.turns||15,stage:"start",ev:{id:Date.now(),k:""}});
 await psh("log",names[q]+":START(出題者)");await put("phase","play")}
function mstart(){const g=R.g,mv=g.order.find(x=>!g.left?.[x]);if(!mv){mfinish(g);return}
 put("g/stage","play");put("g/mv",mv);put("g/st",0);psh("log","— 第1周 —");psh("log",PN(mv)+":TURN");put("g/tn",{id:Date.now(),u:mv})}
async function mnext(u,extra){const g=R.g,left={...(g.left||{}),...(extra||{})},arr=g.arr||[],ord=g.order,i=ord.indexOf(u),alive=x=>!left[x]&&!arr.includes(x);
 let j=ord.findIndex((x,n)=>n>i&&alive(x)),rn=g.rn||1;
 if(j<0){if(arr.length||rn>=g.lim||!ord.some(alive))return mfinish(g);
  rn++;j=ord.findIndex(alive);await put("g/rn",rn);await psh("log","— 第"+rn+"周 —")}
 const mv=ord[j];await put("g/mv",mv);await put("g/st",0);await psh("log",PN(mv)+":TURN");await put("g/tn",{id:Date.now(),u:mv})}
async function mfinish(g){const arr=g.arr||[];
 await psh("log","🏁 "+(arr.length?arr.map((u,i)=>(i+1)+"位 "+PN(u)).join(", "):"出題者 "+PN(g.q)+" の勝ち(誰もゴールできず)"));await put("g/stage","end")}
async function mstep(u,to){if(busy)return;busy=1;
 try{const g=R.g,B=R.boards[g.q],from=g.pos[u],k=wk(from,to),pre=`${PN(u)}:${cl(from)} to ${cl(to)}...`;
  if((B.w||[]).includes(k)){const h=g.hit||[];if(!h.includes(k))await put("g/hit",[...h,k]);await psh("log",pre+"MISS");await put("g/ev",{id:Date.now(),k:"ng"});await mnext(u)}
  else{await put(`g/pos/${u}`,to);await put(`g/path/${u}`,[...(g.path?.[u]||[]),to]);await psh("log",pre+"OK");await put("g/ev",{id:Date.now(),k:"ok"});
   if(to===B.G){await put("g/arr",[...(g.arr||[]),u]);await psh("log",PN(u)+":GOAL");await put("g/tn",{id:Date.now(),u,m:PN(u)+"さんゴール！！"});await mnext(u)}
   else if((g.st||0)+1>=2)await mnext(u);else await put("g/st",(g.st||0)+1)}
 }finally{busy=0}}
async function msettle(){const g=R.g,arr=g.arr||[],d={},nm={};
 const add=(u,v)=>{const n=g.names[u],k=ck(n);d[k]=(d[k]||0)+v;nm[k]=n};
 if(arr.length){arr.forEach((u,i)=>add(u,i===0?2:i===1?1:0));g.order.filter(u=>!arr.includes(u)).forEach(u=>add(u,-1));add(g.q,-1)}
 else{add(g.q,3);g.order.forEach(u=>add(u,-2))}
 const o=[];for(const k in d){const old=cn(nm[k]),nw=Math.max(0,old+d[k]);if(nw!==old){await put("coins/"+k+"/n",nw);o.push(nm[k]+" "+(nw>old?"+":"")+(nw-old))}}
 if(o.length)await psh("log","🪙 "+o.join(", "))}
function mplay(g){const q=g.q,B=R.boards?.[q]||{w:[]},rev=g.stage==="reveal",isQ=me===q,ch=g.order.includes(me),spec=R.set?.spec,arr=g.arr||[];
 $("#t2").hidden=$("#b2").hidden=true;$("#mst").hidden=false;$("#bs").hidden=true;
 $("#t1").textContent=`出題者:${PN(q)}さん  第${g.rn||1}/${g.lim}周`;
 const pcs=g.order.map((u,i)=>({pos:g.pos?.[u],col:MCOL[i%7],t:(PN(u)||"?").slice(0,1)})),mine=ch&&g.stage==="play"&&g.mv===me&&!arr.includes(me);
 bd($("#b1"),B,{path:ch?g.path?.[me]:null,hit:g.hit||[],pieces:pcs,all:rev||isQ||(!ch&&spec),
  tap:mine?c=>{if(nb(g.pos[me]).includes(c))mstep(me,c)}:0});
 $("#mst").innerHTML=(g.stage==="play"?`<b>${esc(PN(g.mv))}さんのターン</b>(残り${2-(g.st||0)}マス)<br>`:"")+g.order.map((u,i)=>`<span style="color:${MCOL[i%7]}">●</span>${esc(PN(u))}${arr.includes(u)?"🏁":g.left?.[u]?"✕":""}`).join("　");
 const lgE=$("#lg"),keep=lgE.scrollTop,hold=lgHold||Date.now()-lgTouch<3000;
 lgE.innerHTML=msgs(R.log).slice(-300).map(x=>`<div${x.startsWith("💬")?' class="cm"':""}>${esc(x)}</div>`).join("");
 lgE.classList.toggle("all",!!allLog);lgE.scrollTop=hold?keep:lgE.scrollHeight;
 $("#back").hidden=!(rev&&R.admin===me);
 if(!local&&R.set.coin&&(g.stage==="end"||g.stage==="reveal")&&!g.hl&&me===q){g.hl=1;put("g/hl",1);msettle()}
 if(g.stage==="start"&&!stT&&me===q)stT=setTimeout(()=>{stT=0;if(R.g?.stage==="start")mstart()},2000)}
function mOv(g){const st=g.stage,arr=g.arr||[];
 if(st==="start")return `<div class="big">出題者 ${esc(PN(g.q))}さん<br>挑戦者 ${g.order.map(u=>esc(PN(u))).join(" → ")}</div>`;
 if(st==="end"){if(!arr.length)return `<div class="huge">出題者 ${esc(PN(g.q))}さんの勝ち！！</div><div class="sm">誰もゴールできませんでした</div>`;
  if(R.set.coin)return `<div class="big">${arr.map((u,i)=>(i+1)+"位 "+esc(PN(u))+"さん").join("<br>")}</div>`;
  return arr.length===1?`<div class="big">${esc(PN(arr[0]))}さんの勝ち！！</div>`:`<div class="big">同着！！<br>${arr.map(u=>esc(PN(u))+"さん").join("<br>")}</div>`}
 return ""}

/* ---- play ---- */
async function turn(i,last){const g=R.g,t=g.order[i],mm=g.mem?.[t]||[t],mv=mm[((g.f?.[t]||0)+(g.cnt?.[t]||0))%mm.length];
 await put("g/turn",i);await put("g/mv",mv);await put("g/cnt/"+t,(g.cnt?.[t]||0)+1);await psh("log",PN(mv)+(last?":LAST TURN":":TURN"));await put("g/tn",{id:Date.now(),u:mv,last:last?1:0})}
async function step(p,to){if(busy)return;busy=1;
 try{const g=R.g,[a,b]=g.order,B=R.boards[p===a?b:a],from=g.pos[p],k=wk(from,to),pre=`${PN(g.mv||p)}:${cl(from)} to ${cl(to)}...`;
  if((B.w||[]).includes(k)){
   const first=!(g.hit?.[p]||[]).includes(k);await put(`g/hit/${p}`,[...(g.hit?.[p]||[]),k]);await psh("log",pre+"MISS");await bonusHit(p,k,first);await put("g/ev",{id:Date.now(),k:"ng"});
   if(g.sd){await put("g/res",a);await psh("log",PN(a)+":WIN");await put("g/stage","end")}else await turn(1-g.turn)
  }else{
   await put(`g/pos/${p}`,to);await put(`g/path/${p}`,[...(g.path?.[p]||[]),to]);await psh("log",pre+"OK");await put("g/ev",{id:Date.now(),k:"ok"});
   if(to===B.G){await put("g/who",p);await psh("log",PN(p)+":GOAL");
    if(g.sd){await put("g/res","draw");await put("g/after","end")}
    else if(p===a)await put("g/after","sudden");
    else{await put("g/res",p);await put("g/after","end")}
    await put("g/stage","goal")}}
 }finally{busy=0;if(local)cpu()}}
function cpu(){const g=R.g;if(!local||busy||cpuT||!g||g.stage!=="play"||g.order[g.turn]!=="cpu")return;
 cpuT=setTimeout(()=>{cpuT=0;const g=R.g;if(g.stage!=="play"||g.order[g.turn]!=="cpu")return;
  step("cpu",cpuMove(lvl,g.pos.cpu,new Set(g.hit?.cpu||[]),new Set(g.path.cpu),R.boards[me].G))},700)}
function play(){const g=R.g;if(g.multi)return mplay(g);$("#t2").hidden=$("#b2").hidden=false;$("#mst").hidden=true;const[a,b]=g.order,mt=Object.keys(g.mem||{}).find(t=>g.mem[t].includes(me)),F=!!mt,rev=g.stage==="reveal",B=R.boards||{},spec=R.set?.spec;
 const[d1,s1,d2,s2]=F?[a===mt?b:a,mt,mt,a===mt?b:a]:[a,b,b,a];
 $("#t1").textContent=F?"Crack a Grid(相手の盤面)":PN(d1)+"の盤面";
 $("#t2").textContent=F?"Design a Grid(自分の盤面)":PN(d2)+"の盤面";
 bd($("#b1"),B[d1],{path:g.path?.[s1],pos:g.pos?.[s1],hit:g.hit?.[s1],all:rev||(!F&&spec),col:"#2874a6",
  tap:F?c=>{if(g.stage==="play"&&g.mv===me&&nb(g.pos[mt]).includes(c))step(mt,c)}:0});
 bd($("#b2"),B[d2],{path:g.path?.[s2],pos:g.pos?.[s2],hit:g.hit?.[s2],all:F||rev||spec,col:"#c0392b"});
 const lgE=$("#lg"),keep=lgE.scrollTop,hold=lgHold||Date.now()-lgTouch<3000;
 lgE.innerHTML=msgs(R.log).slice(-300).map(x=>`<div${x.startsWith("💬")?' class="cm"':""}>${esc(x)}</div>`).join("");
 lgE.classList.toggle("all",!!allLog);lgE.scrollTop=hold?keep:lgE.scrollHeight;
 $("#back").hidden=!(rev&&(R.admin===me||local));
 {const e=$("#bs");e.hidden=local||!R.set.coin;
  if(!e.hidden){const bt=R.bets||{},c=k=>Object.values(bt).filter(x=>x.c===k).length,my=bt[me];
   e.textContent=`🎲 ${blab(a)||PN(a)} ${c(a)}票 / ${blab(b)||PN(b)} ${c(b)}票 / 引き分け ${c("draw")}票`+(F?"":` ・あなた:`+(my?(my.c==="draw"?"引き分け":(blab(my.c)||PN(my.c))):"なし"))+` ・🪙${cn(name)}`}}
 if(!local&&R.set.coin&&(g.stage==="end"||g.stage==="reveal")&&g.res&&!g.hl&&me===wr(g,g.res==="draw"?a:g.res)){g.hl=1;put("g/hl",1);settle()}
 if(g.stage==="start"&&!stT&&(local||me===wr(g,a)))stT=setTimeout(()=>{stT=0;if(R.g?.stage==="start"){put("g/stage","play");turn(0)}},2000)}
$("#al").onclick=()=>{allLog=!allLog;draw()};
{const e=$("#lg"),rel=()=>{lgHold=0;lgTouch=Date.now();setTimeout(()=>{if(!lgHold&&Date.now()-lgTouch>=2900)e.scrollTop=e.scrollHeight},3000)};
 e.addEventListener("touchstart",()=>lgHold=1,{passive:true});e.addEventListener("touchend",rel);e.addEventListener("touchcancel",rel);e.addEventListener("wheel",rel,{passive:true})}
$("#back").onclick=async()=>{if(local)return location.reload();await put("phase","lobby");await put("g",null);await put("boards",null);await put("bets",null);await put("prog",null);await put("bonus",null);await put("bq",null);await put("bt",null);await put("bgo",null);await put("tb",null)};

/* ---- overlay / fx ---- */
function ov(){const g=R.g||{},st=g.stage,b=g.order?.[1];let h="";
 if(R.phase==="play"&&g.multi)h=mOv(g);
 else if(R.phase==="play"){
  if(st==="start")h=`<div class="big">${esc(PN(g.order[0]))}さん先攻！<br>${esc(PN(b))}さん後攻です！</div>`;
  else if(st==="goal")h=`<div class="big">${esc(PN(g.who))}さんゴール！！</div>`;
  else if(st==="sudden")h=`<div class="huge">サドンデス！！！</div><div class="sm">${esc(PN(b))}さん、ゴール出来なかったら負け！</div>`;
  else if(st==="end")h=g.res==="draw"?`<div class="huge">引き分け！！</div>`:`<div class="big">${esc(PN(g.res))}さんの勝ち！！</div>`}
 $("#ov").innerHTML=h;$("#ov").hidden=!h;
 if(g.ev&&g.ev.id!==lastEv){lastEv=g.ev.id;if(g.ev.k){const f=$("#fx"),sp=$("#stamp"),ng=g.ev.k==="ng";f.textContent=g.ev.k==="ok"?"〇":"✕";f.className=g.ev.k;f.hidden=false;sp.hidden=!ng;setTimeout(()=>{f.hidden=true;sp.hidden=true},ng?1000:500)}}}
$("#ov").onclick=()=>{const g=R.g,st=g?.stage,n={goal:g?.after,sudden:"play",end:"reveal"}[st];if(!n)return;
 const lg=local||me===wr(g,g.order[0]);
 if(st==="goal"&&n==="sudden"&&lg)psh("log","SUDDEN DEATH");
 if(st==="goal"&&n==="end"&&lg)psh("log",g.res==="draw"?"DRAW":PN(g.res)+":WIN");
 if(st==="end"&&lg)psh("log","REVEAL");
 if(st==="sudden"&&!g.sd){put("g/sd",1);turn(1,1)}put("g/stage",n)};
function tnfx(){const g=R.g;if(g?.tn&&g.tn.id!==lastTn){lastTn=g.tn.id;const t=$("#tn");t.textContent=g.tn.m||PN(g.tn.u)+(g.tn.last?"さんのラストターン！！":"さんのターン！！");t.hidden=false;setTimeout(()=>t.hidden=true,1100)}}

/* ---- chat ---- */
function chats(){const m=msgs(R.chat).slice(-30).map(x=>`<div><b>${esc(x.n)}</b> ${esc(x.t)}</div>`).join(""),can=R.phase==="lobby"||!isF(me);
 document.querySelectorAll(".chat").forEach(c=>{const d=c.querySelector(".msgs");d.innerHTML=m;d.scrollTop=d.scrollHeight;c.querySelector(".cin").hidden=!can;c.hidden=local||!can})}
document.querySelectorAll(".chat").forEach(c=>{const i=c.querySelector("input"),send=()=>{const t=i.value.trim();if(t){R.phase==="lobby"?psh("chat",{n:name,t}):psh("log","💬"+name+":"+t);i.value=""}};
 c.querySelector("button").onclick=send;i.onkeydown=e=>e.key==="Enter"&&send()});

/* ---- main render ---- */
function draw(){if(!R||!R.phase)return;const ph=R.phase;
 if(!local&&name){const cr=onDisconnect(ref(db,`rooms/${rid}/coins/${ck(name)}/off`));
  if(R.set?.coin&&!cdReg){cdReg=1;cr.set(serverTimestamp())}else if(!R.set?.coin&&cdReg){cdReg=0;cr.cancel()}}
 if(ph!==lastPh){lastPh=ph;if(ph==="setup"){E={S:"",G:"",W:[]};tool="S";DS="";dwr={};pushProg()}}
 if(ph!=="setup")go=0;if(ph!=="bonus")go2=0;
 show(ph==="lobby"?"lobby":ph==="setup"?"setup":ph==="bonus"?"bonus":"game");
 if(ph==="lobby")lobby();else if(ph==="setup")setup();else if(ph==="bonus")bonus();else if(R.g)play();
 ov();tnfx();chats();if(local)cpu()}

/* ---- 自動復帰 ---- */
$("#nm").value=LS.get("lab_name")||"";
(async()=>{const rm=LS.get("lab_room");name=LS.get("lab_name")||"";if(!rm||!name)return;
 try{me??=await C.login();if((await get(ref(db,"rooms/"+rm))).exists())join(rm);else LS.del("lab_room")}catch(e){}})();
$("#out").onclick=async()=>{LS.del("lab_room");try{if(rid)await set(ref(db,`rooms/${rid}/players/${me}`),null)}catch(e){}location.reload()};
