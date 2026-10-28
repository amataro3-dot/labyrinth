import*as C from"./core.js?v=20";
const{db,ref,set,push,get,onValue,runTransaction,onDisconnect,serverTimestamp,N,cl,wk,nb,reach,cpuBoard,cpuMove}=C;
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let me,name,rid,R={},ROOM={},VF="",fpick={},ffd={},local=0,lvl=2,lastEv=0,lastTn=0,stT=0,cpuT=0,busy=0,go=0,lastPh="",tool="S",E={S:"",G:"",W:[]},allLog=0,lgHold=0,lgTouch=0,betView=0,cdReg=0,so=0,go2=0,DS="",dwr={};
const setp=(o,p,v)=>{const k=p.split("/");let x=o;k.slice(0,-1).forEach(a=>x=x[a]??={});v===null?delete x[k.at(-1)]:x[k.at(-1)]=v};
/* ---- フロア対戦: 部屋の中に A〜D の試合の置き場所(fl/A など)を作り、見ているフロアのデータを R に重ねる ---- */
const FL=["A","B","C","D"],FK=["phase","slots","boards","tb","prog","g","log","bets","bonus","bq","bt","bgo"];
const FLM=()=>!local&&ROOM?.phase==="floor";
const fdone=f=>f?.g?.stage==="reveal";
const fkeys=m=>m==="double"?["a","a2","b","b2"]:["a","b"];
const myFl=()=>Object.keys(ROOM.fl||{}).find(F=>Object.values(ROOM.fl[F].slots||{}).includes(me))||"";
const actFl=()=>{const F=myFl();return F&&!fdone(ROOM.fl[F])?F:""};
const fview=F=>{const f=ROOM.fl?.[F]||{},V={...ROOM};FK.forEach(k=>V[k]=f[k]);V.set={...(ROOM.set||{}),mode:f.mode};V.flF=F;return V};
function rebuild(){if(local)return;if(!FLM()){R=ROOM;VF="";return}
 const fl=ROOM.fl||{},ks=Object.keys(fl).sort(),a=actFl();let v=a||VF;
 if(!a){const bq=ks.find(F=>fl[F].phase==="bonus"&&fl[F].bq?.[me]&&!fl[F].bonus?.[me]);if(bq)v=bq}
 if(!fl[v])v=ks.find(F=>fl[F].bets?.[me])||ks[0]||"";
 if(v!==VF){VF=v;const g=fl[v]?.g;lastEv=g?.ev?.id||0;lastTn=g?.tn?.id||0;betView=0}
 R=fview(VF)}
const fp=p=>FLM()&&VF&&FK.includes(p.split("/")[0])?`fl/${VF}/${p}`:p;
const put=(p,v)=>{if(local){setp(R,p,v);draw()}else return set(ref(db,`rooms/${rid}/${fp(p)}`),v)};
const psh=(p,v)=>{if(local){setp(R,p+"/"+Date.now()+Math.random().toString(36).slice(2,6),v);draw()}else return push(ref(db,`rooms/${rid}/${fp(p)}`),v)};
const rput=(p,v)=>set(ref(db,`rooms/${rid}/${p}`),v),rpsh=(p,v)=>push(ref(db,`rooms/${rid}/${p}`),v);
/* その試合を進める係: ふつうは管理者。フロア対戦では、そのフロアにいる最初の対戦者 */
const isDrv=()=>FLM()?SK().map(k=>R.slots?.[k]).find(u=>u&&R.players?.[u])===me:R.admin===me;
/* どこかのフロアで対戦している人 */
const fAny=u=>Object.values(ROOM.fl||{}).some(f=>Object.values(f.slots||{}).includes(u));
const P=u=>R.players?.[u]?.name||"?",PN=u=>R.g?.names?.[u]||P(u);
const MULTI=()=>R.set?.mode==="multi",MC=["c1","c2","c3","c4","c5","c6","c7"],mcnt=s=>MC.filter(k=>s[k]).length,DBL=()=>R.set?.mode==="double",SK=()=>DBL()?["a","a2","b","b2"]:MULTI()?["q",...MC]:["a","b"],TM={tA:["a","a2"],tB:["b","b2"]},SL={a:"A1",a2:"A2",b:"B1",b2:"B2"};
const isF=u=>!!u&&SK().some(k=>R.slots?.[k]===u);
const mem=t=>TM[t].map(k=>R.slots?.[k]).filter(Boolean);
const tOf=u=>DBL()?(TM.tA.some(k=>R.slots?.[k]===u)?"tA":TM.tB.some(k=>R.slots?.[k]===u)?"tB":null):(isF(u)?u:null);
const gids=()=>DBL()?["tA","tB"]:MULTI()?[R.slots?.q]:[R.slots?.a,R.slots?.b];
const gname=id=>DBL()?mem(id).map(P).join("&"):P(id);
const fmode=F=>R.set?.fm?.[F]||"single",flab=(m,k)=>m==="double"?SL[k]:(k==="a"?"1":"2");
const ffull=F=>fkeys(fmode(F)).every(k=>R.fs?.[F]?.[k]&&R.players?.[R.fs[F][k]]);
const slab=u=>{if(R.set?.mode==="floor"&&R.phase==="lobby"){for(const F of FL)for(const k in R.fs?.[F]||{})if(R.fs[F][k]===u)return F+"-"+flab(fmode(F),k);return "観戦"}const k=Object.keys(R.slots||{}).find(x=>R.slots[x]===u);return k?(DBL()?SL[k]:MULTI()?(k==="q"?"出題者":"参加"):"対戦"):"観戦"};
const wr=(g,id)=>g.mem?.[id]?.[0]||id;
const blab=id=>{const pl=R.phase==="play"&&R.g,mm=DBL()&&((pl&&pl.mem?.[id])||mem(id));return mm?`${id==="tA"?"A":"B"}(${mm.map(u=>((pl&&pl.names?.[u])||P(u))+"さん").join("、")})`:""};
const msgs=o=>Object.entries(o||{}).sort((x,y)=>x[0]<y[0]?-1:1).map(e=>e[1]);
const show=id=>["title","lobby","setup","bonus","tour","game"].forEach(s=>$("#"+s).hidden=s!==id);
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
const nameOk=()=>(name=$("#nm").value.trim().slice(0,10))?(LS.set("lab_name",name),1):(alert("なまえを入力してね"),0);
for(let i=10;i<=20;i++)$("#wn").add(new Option(i+"枚",i));
for(let i=10;i<=20;i++)$("#cw").add(new Option("壁"+i+"枚",i));
for(let i=15;i<=20;i++)$("#tl").add(new Option(i+"周",i));

const ck=s=>String(s).replace(/[.$#\[\]\/]/g,"_");
const cn=nm=>R.coins?.[ck(nm)]?.n??0;
const PAL=["#e6194b","#3cb44b","#4363d8","#f58231","#911eb7","#008080","#b8860b","#e91e8c"];
const colOf=n=>PAL[R.colors?.[ck(n)]]||"";
const nh=n=>{const c=colOf(n);return c?`<span style="color:${c};font-weight:700">${esc(n)}</span>`:esc(n)};
const gnh=id=>DBL()?mem(id).map(u=>nh(P(u))).join("&amp;"):nh(P(id));
const lgc=x=>{let m;
 if(m=x.match(/^🎯HIT: (.*)$/u))return "🎯HIT: "+m[1].split(", ").map(nh).join(", ");
 if(m=x.match(/^🪙 (.*)$/u))return "🪙 "+m[1].split(", ").map(t=>{const i=t.lastIndexOf(" ");return i<0?esc(t):nh(t.slice(0,i))+esc(t.slice(i))}).join(", ");
 if(m=x.match(/^💥 (.+?)(さんのボーナスウォール命中 .*)$/u))return "💥 "+nh(m[1])+esc(m[2]);
 if(m=x.match(/^🏁 (.*)$/u))return "🏁 "+m[1].split(", ").map(t=>{const k=t.match(/^(\d+位 )(.+)$/u);return k?esc(k[1])+nh(k[2]):esc(t)}).join(", ");
 if(m=x.match(/^((?:💬)?)([^:]+):([\s\S]*)$/u)){const ps=m[2].split("&"),nm=ps.every(p=>colOf(p))?ps.map(nh).join("&amp;"):nh(m[2]);return m[1]+nm+":"+esc(m[3])}
 return esc(x)};

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
 await runTransaction(ref(db,`rooms/${id}/colors`),cur=>{cur=cur||{};const k=ck(name);if(cur[k]!=null)return cur;const used=new Set(Object.values(cur)),free=PAL.map((_,i)=>i).filter(i=>!used.has(i)),pool=free.length?free:PAL.map((_,i)=>i);cur[k]=pool[Math.floor(Math.random()*pool.length)];return cur});
 onValue(ref(db,"rooms/"+id),s=>{ROOM=s.val();if(!ROOM){LS.del("lab_room");alert("ルームが閉じられました");return location.reload()}rebuild();watch();draw()})}

/* ---- housekeeping (admin交代・離脱処理) ---- */
const gone={};let wt=0;
function watch(){const pl=R.players||{},ids=Object.keys(pl).sort((a,b)=>pl[a].t-pl[b].t),s=R.slots||{},now=Date.now();let wait=0;
 if(lastEv===-1){lastEv=R.g?.ev?.id||0;lastTn=R.g?.tn?.id||0}
 if(!pl[me]){const pr=ref(db,`rooms/${rid}/players/${me}`);set(pr,{name,t:now});onDisconnect(pr).remove()}
 const miss=u=>{if(pl[u]){delete gone[u];return 0}gone[u]??=now;if(now-gone[u]<10000){wait=1;return 0}return 1};
 if(miss(R.admin)&&ids[0]===me)put("admin",me);
 if(FLM())fwatch(miss,pl);
 else if(R.set?.mode==="floor"){if(R.phase==="lobby"&&(R.admin===me||(!pl[R.admin]&&ids[0]===me)))for(const F in R.fs||{})for(const k in R.fs[F]||{})if(miss(R.fs[F][k]))rput(`fs/${F}/${k}`,null)}
 else if(MULTI())mwatch(miss,pl,ids,s);else for(const k of SK())if(s[k]&&miss(s[k])){const ok2=DBL()?(TM.tA.includes(k)?TM.tB:TM.tA):[k==="a"?"b":"a"],o=ok2.map(x=>s[x]).find(u=>u&&pl[u]);
  if(R.phase==="lobby"){if(R.admin===me||(!pl[R.admin]&&ids[0]===me))put("slots/"+k,null)}
  else if(o===me&&!["end","reveal"].includes(R.g?.stage)){put("slots/"+k,null);
   if(R.phase==="setup"||R.phase==="bonus"){if(R.t?.st==="match"){R.t.k==="tour"?tafter(me):tforf(s[k])}else{put("phase","lobby");alert("相手が退出しました")}}
   else{const mt=tOf(me);psh("log",PN(mt)+":WIN(FORFEIT)");put("g/res",mt);put("g/stage","end")}}}
 if(wait&&!wt)wt=setTimeout(()=>{wt=0;watch()},10200)}
/* フロアで抜けた人: 相手側の人が不戦勝にする。全員いなくなったフロアは管理者が引き分けで閉じる */
function fsyn(F,res){const f=ROOM.fl[F],s=f.slots||{},nm=u=>ROOM.players?.[u]?.name||f.nm?.[u]||"?",names={};let order,mem;
 if(f.mode==="double"){order=["tA","tB"];mem={tA:[s.a,s.a2],tB:[s.b,s.b2]};for(const t of order){names[t]=mem[t].map(nm).join("&");mem[t].forEach(u=>names[u]=nm(u))}}
 else{order=[s.a,s.b];mem={[s.a]:[s.a],[s.b]:[s.b]};order.forEach(u=>names[u]=nm(u))}
 return{order,names,mem,stage:"reveal",res,ff:1,hl:1,ev:{id:Date.now(),k:""}}}
function fwatch(miss,pl){const fl=ROOM.fl||{};
 for(const F of Object.keys(fl)){const f=fl[F];if(fdone(f)||f.g?.stage==="end")continue;
  const s=f.slots||{},dbl=f.mode==="double",ks=fkeys(f.mode),tag=F+":"+(f.g?.ev?.id||"s");if(ffd[tag])continue;
  if(!ks.some(k=>s[k]&&pl[s[k]])){if(R.admin===me&&ks.every(k=>!s[k]||miss(s[k]))){ffd[tag]=1;rput(`fl/${F}/g`,fsyn(F,"draw"));rput(`fl/${F}/phase`,"play")}continue}
  for(const k of ks){const u=s[k];if(!u||!miss(u))continue;
   const side=dbl?(TM.tA.includes(k)?TM.tB:TM.tA):[k==="a"?"b":"a"],o=side.map(x=>s[x]).find(x=>x&&pl[x]);if(o!==me)break;
   const mt=dbl?(TM.tA.includes(k)?"tB":"tA"):me,nm=f.g?.names?.[mt]||(dbl?side.map(x=>s[x]).map(x=>pl[x]?.name||"?").join("&"):name);
   ffd[tag]=1;rpsh(`fl/${F}/log`,nm+":WIN(FORFEIT)");
   if(f.phase==="play"&&f.g){rput(`fl/${F}/g/res`,mt);rput(`fl/${F}/g/stage`,"end")}
   else{rput(`fl/${F}/g`,fsyn(F,mt));rput(`fl/${F}/phase`,"play")}
   break}}}

/* ---- lobby ---- */
function lobby(){const pl=R.players||{},ids=Object.keys(pl).sort((x,y)=>pl[x].t-pl[y].t),ad=R.admin===me,s=R.slots||{},mine=isF(me),dbl=DBL(),multi=MULTI(),flm=R.set.mode==="floor",full=flm?FL.some(ffull):multi?!!(s.q&&mcnt(s)>=2):SK().every(k=>s[k]);
 $("#lid").textContent=rid;
 $("#plist").innerHTML=ids.map(u=>`<li>${nh(pl[u].name)}${u===R.admin?" 👑":""}${u===me?"(自分)":""}${R.set.coin?" 🪙"+cn(pl[u].name):""} <b>${slab(u)}</b></li>`).join("");
 $("#pst").textContent=flm?(full?`そろったフロア:${FL.filter(ffull).join("・")}(スタートで同時に始まります)`:"フロアの席を押してね。人がそろったフロアから始まります"):multi?(full?`出題者 ${P(s.q)} / 挑戦者${mcnt(s)}人`:"出題者1人と挑戦者2人以上が必要です"):dbl?(full?`${gname("tA")} vs ${gname("tB")}`:"A1・A2・B1・B2の4人がそろうとスタートできます"):full?`${P(s.a)} vs ${P(s.b)}`:(s.a||s.b)?"対戦者を待ってます…":"対戦者はまだいません";
 $("#bp").hidden=mine||!!full;$("#bx").hidden=!mine;
 $("#sr").hidden=dbl||multi||flm;$("#flr").hidden=!flm;if(flm)flobby(ad);$("#dbl").hidden=!dbl;$("#mul").hidden=!multi;$("#tw").hidden=!multi;
 $("#m1").classList.toggle("on",!dbl&&!multi&&!flm);$("#m4").classList.toggle("on",flm);$("#m2").classList.toggle("on",dbl);$("#m3").classList.toggle("on",multi);$("#m3").disabled=ids.length<3&&!multi;
 if($("#tl").value!=(R.set.turns||15))$("#tl").value=R.set.turns||15;
 if(multi){$("#mls").textContent=`出題者:${s.q?P(s.q):"-"} / 挑戦者(${mcnt(s)}人):${MC.filter(k=>s[k]).map(k=>P(s[k])).join("、")||"-"}`;$("#mq").hidden=mine||!!s.q;$("#mj").hidden=mine||mcnt(s)>=7;$("#mx").hidden=!mine}
 if(dbl)["a","a2","b","b2"].forEach(k=>{$("#n_"+k).textContent=s[k]?P(s[k]):"";$("#d_"+k).classList.toggle("on",s[k]===me)});
 $("#adm").hidden=!ad;$("#st").disabled=!full;
 {const tt=R.set.tt||"",part=ids.filter(u=>!R.obs?.[u]);$("#tt").value=tt;$("#cb").disabled=tt==="tour";$("#tlob").hidden=!tt;$("#md").hidden=!!tt;$("#pst").hidden=!!tt;
  $("#parw").hidden=!(ad&&tt&&tt!=="tour"||ad&&tt==="tour");$("#par").checked=PAR();
  if(tt){["sr","dbl","mul","tw","st","flr"].forEach(x=>$("#"+x).hidden=true);$("#tw").hidden=tt!=="off";
   $("#tpl").innerHTML=ids.map(u=>`<div>${nh(pl[u].name)} ${R.obs?.[u]?"👀観戦":"✔参加"}</div>`).join("")+`<div>参加者 ${part.length}人(4人以上で開始できます)</div>`;
   $("#tobs").textContent=R.obs?.[me]?"参加にする":"観戦にする";$("#tgo").hidden=!ad;$("#tgo").disabled=part.length<4;tcfgSync(tt,ad)}
  else{$("#st").hidden=false;$("#tcfg").hidden=true}}
 if($("#wn").value!=R.set.walls)$("#wn").value=R.set.walls;$("#sp").checked=!!R.set.spec;$("#cb").checked=!!R.set.coin;$("#sp").disabled=!!R.set.coin;$("#bw").disabled=!R.set.coin||MULTI();$("#bw").checked=!!R.set.bonus;
 $("#aset").textContent=ad?"":`${flm?"フロア対戦":dbl?"ダブルス":multi?"マルチ":"シングル"} / 壁${R.set.walls}枚${multi?` / 周の上限 ${R.set.turns||15}`:""} / 観戦者の壁表示：${R.set.spec?"あり":"なし"} / コインバトル：${R.set.coin?"オン":"オフ"}${R.set.coin?` / ボーナスウォール：${R.set.bonus?"オン":"オフ"}`:""}`}
$("#bp").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.a===me||s.b===me)return s;if(!s.a)s.a=me;else if(!s.b)s.b=me;else return;return s});
$("#bx").onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s.a===me)delete s.a;if(s.b===me)delete s.b;return s});
["a","a2","b","b2"].forEach(k=>$("#d_"+k).onclick=()=>runTransaction(ref(db,`rooms/${rid}/slots`),s=>{s=s||{};if(s[k]&&s[k]!==me)return;const had=s[k]===me;for(const x in s)if(s[x]===me)delete s[x];if(!had)s[k]=me;return s}));
const setMode=async x=>{if((R.set.mode||"single")===x)return;if(x==="multi"&&Object.keys(R.players||{}).length<3)return alert("マルチは3人以上そろってから選べます");await put("slots",null);await put("fs",null);await put("set/mode",x)};
$("#m1").onclick=()=>setMode("single");$("#m2").onclick=()=>setMode("double");$("#m3").onclick=()=>setMode("multi");$("#m4").onclick=()=>setMode("floor");
/* ロビーのフロアの席(A〜D)。ホストはフロアごとにシングル/ダブルスを選ぶ */
function flobby(ad){const pl=R.players||{};
 $("#flr").innerHTML=FL.map(F=>{const m=fmode(F),s=R.fs?.[F]||{},ok=ffull(F);
  return `<div class="fl${ok?" full":""}"><div class="flh"><b>${F}フロア${ok?" ✔":""}</b>${ad?`<button data-f="${F}" data-fm="single" class="${m==="single"?"on":""}">シングル</button><button data-f="${F}" data-fm="double" class="${m==="double"?"on":""}">ダブルス</button>`:`<span>${m==="double"?"ダブルス":"シングル"}</span>`}</div>
<div class="fls">${fkeys(m).map(k=>`<div class="fseat"><button data-f="${F}" data-k="${k}" class="${s[k]===me?"on":""}">${flab(m,k)}</button><span>${s[k]&&pl[s[k]]?nh(pl[s[k]].name):""}</span></div>`).join("")}</div></div>`}).join("")}
$("#flr").onclick=async e=>{const b=e.target.closest("button");if(!b)return;const F=b.dataset.f;
 if(b.dataset.fm){if(R.admin!==me||fmode(F)===b.dataset.fm)return;await put("fs/"+F,null);await put("set/fm/"+F,b.dataset.fm);return}
 const k=b.dataset.k;runTransaction(ref(db,`rooms/${rid}/fs`),s=>{s=s||{};const had=s[F]?.[k]===me;if(s[F]?.[k]&&!had)return;
  for(const x in s)for(const y in s[x]||{})if(s[x][y]===me)delete s[x][y];if(!had){s[F]=s[F]||{};s[F][k]=me}return s})};
/* フロア対戦のスタート: 人がそろったフロアを全部同時に始める */
async function fstart(){const fl={},pl=R.players||{};
 for(const F of FL){if(!ffull(F))continue;const m=fmode(F),s={},nm={};fkeys(m).forEach(k=>{s[k]=R.fs[F][k];nm[s[k]]=pl[s[k]].name});
  const o={mode:m,phase:"setup",slots:s,nm};
  if(m==="double"){o.tb={};for(const[t,mm]of[["tA",[s.a,s.a2]],["tB",[s.b,s.b2]]]){const sh=[...mm].sort(()=>Math.random()-.5);o.tb[t]={m:mm,s:sh[0],g:sh[1],f:mm[Math.random()<.5?0:1]}}}
  fl[F]=o}
 if(!Object.keys(fl).length)return alert("人がそろったフロアがありません");
 for(const k of["boards","g","log","bets","prog","bonus","bq","bt","bgo","tb"])await put(k,null);
 await rput("fl",fl);await rput("phase","floor")}
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
$("#tt").onchange=async e=>{const v=e.target.value;await put("set/tn",null);await put("set/tt",v)};
$("#tnn").onchange=e=>put("set/tn",+e.target.value);
$("#tobs").onclick=()=>put("obs/"+me,R.obs?.[me]?null:1);
$("#par").onchange=e=>put("set/par",e.target.checked);
$("#tgo").onclick=async()=>{const pl=R.players||{},part=Object.keys(pl).filter(u=>!R.obs?.[u]);if(part.length<4)return alert("参加者が4人以上必要です");
 const pn={};part.forEach(u=>pn[u]=pl[u].name);
 const tt=R.set.tt;if(!tt)return;if(tt==="tour"){await put("set/coin",false);await put("set/bonus",false);const t=tbuild(part,pn);if(PAR())t.batch=tnextKeys(t);await put("t",t)}else await put("t",tevent(tt,part,pn));await put("phase","tour")};
$("#st").onclick=async()=>{if(R.set.mode==="floor")return fstart();await put("boards",null);await put("g",null);await put("log",null);await put("bets",null);await put("prog",null);await put("bonus",null);await put("bq",null);await put("bt",null);await put("bgo",null);await put("tb",null);
 if(DBL()){const tb={};for(const t of["tA","tB"]){const mm=mem(t),sh=[...mm].sort(()=>Math.random()-.5);tb[t]={m:mm,s:sh[0],g:sh[1],f:mm[Math.random()<.5?0:1]}}await put("tb",tb)}
 await put("phase","setup")};

/* ---- board drawing ---- */
const lite=h=>{const n=parseInt(h.slice(1),16);return "#"+[16,8,0].map(s=>Math.round(255-(255-((n>>s)&255))*.4).toString(16).padStart(2,"0")).join("")};
function bd(el,B,o){B=B||{w:[]};const Z=54,O=30,hit=o.hit||[],pa=new Set(o.path||[]);let h="";
 for(let i=0;i<N;i++)h+=`<text class="lb" x="${O+i*Z+27}" y="20">${i+1}</text><text class="lb" x="14" y="${O+i*Z+33}">${"ABCDEF"[i]}</text>`;
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){const s=r+","+c,f=s===B.S?"#d5f5e3":s===B.G?"#fdebd0":pa.has(s)?(o.pcol?lite(o.pcol):"#d6eaf8"):"#f4f6f7";
  h+=`<rect data-c="${s}" x="${O+c*Z}" y="${O+r*Z}" width="${Z}" height="${Z}" fill="${f}" stroke="#ccd"/>`;
  if(s===B.S)h+=`<text x="${O+c*Z+27}" y="${O+r*Z+36}" fill="#1e8449" font-size="26">S</text>`;
  if(s===B.G)h+=`<text x="${O+c*Z+27}" y="${O+r*Z+36}" fill="#e67e22" font-size="26">G</text>`}
 for(const p of o.paths||[])for(const s of p.cells||[]){if(s===B.S||s===B.G)continue;const[r,c]=s.split(",").map(Number);h+=`<rect x="${O+c*Z}" y="${O+r*Z}" width="${Z}" height="${Z}" fill="${p.col}" fill-opacity=".3" pointer-events="none"/>`}
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
async function settle(){const F0=VF,lg=v=>F0&&FLM()?rpsh(`fl/${F0}/log`,v):psh("log",v),g=R.g,[a,b]=g.order,res=g.res,bt=Object.values(R.bets||{}),d={},nm={};
 const add=(n,v)=>{const k=ck(n);d[k]=(d[k]||0)+v;nm[k]=n};
 if(res!=="draw"){(g.mem?.[res]||[res]).forEach(u=>add(g.names[u],2));(g.mem?.[res===a?b:a]||[res===a?b:a]).forEach(u=>add(g.names[u],-2))}
 bt.forEach(x=>add(x.n,x.c===res?1:-1));
 await lg("🎯HIT: "+(bt.filter(x=>x.c===res).map(x=>x.n).join(", ")||"none"));
 const o=[];
 for(const k in d){const old=cn(nm[k]),nw=Math.max(0,old+d[k]);if(nw!==old){await put("coins/"+k+"/n",nw);o.push(nm[k]+" "+(nw>old?"+":"")+(nw-old))}}
 if(o.length)await lg("🪙 "+o.join(", "))}
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
 if(!go&&(isDrv()||local)&&ids.every(x=>x&&R.boards?.[x]?.ok)){go=1;R.set.coin&&R.set.bonus&&!local&&!MULTI()?startBonus():startGame()}}
function dfin(){if(!DBL()||!isDrv())return;
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
 $("#stat").innerHTML=u.map(x=>`<div>${R.boards?.[x]?.ok?"✓ "+gnh(x)+"さん"+(MULTI()?"(出題者)":"")+"準備完了":gnh(x)+"さん"+(MULTI()?"(出題者)":"")+"作成中"}</div>`).join("");
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
 $("#bhint").textContent=(FLM()?"賭けられるのは1フロアだけです。":"")+(R.set.bonus?"全員の壁ができるまで変えられます(誰に賭けたかは見えません)":"ゲームが始まるまで変えられます(誰に賭けたかは見えません)")}
$("#v0").onclick=()=>{betView=0;draw()};$("#v1").onclick=()=>{betView=1;draw()};
$("#bo").onclick=e=>{const b=e.target.closest("button");if(!(b&&R.phase==="setup"&&R.set.coin&&!local&&!isF(me)&&cn(name)>=1))return;
 if(FLM()){if(actFl())return;const fl=ROOM.fl||{},lk=Object.keys(fl).find(F=>F!==VF&&fl[F].bets?.[me]&&fl[F].phase!=="setup");
  if(lk)return alert(`${lk}フロアに賭けています(賭けられるのは1フロアだけ)`);for(const F in fl)if(F!==VF&&fl[F].bets?.[me])rput(`fl/${F}/bets/${me}`,null)}
 put("bets/"+me,{c:b.dataset.c,n:name})};
["S","G","W"].forEach(t=>$("#t"+t).onclick=()=>{tool=t;draw()});
$("#rd").onclick=()=>{if(!E.S||!E.G||E.S===E.G||E.W.length!==R.set.walls||!reach(new Set(E.W),E.S,E.G))
 return alert("S・G・壁の数を確認してね。SからGへ必ず行ける道が必要です");put(`boards/${me}`,{S:E.S,G:E.G,w:E.W,ok:1})};
async function startGame(){if(MULTI())return mstartGame();const ids=gids(),[a,b]=[...ids].sort(()=>Math.random()-.5),B=R.boards,d=DBL(),mm=d?{tA:mem("tA"),tB:mem("tB")}:{[a]:[a],[b]:[b]},names={};
 if(d)["tA","tB"].forEach(t=>{names[t]=mem(t).map(P).join("&");mem(t).forEach(u=>names[u]=P(u))});else{names[a]=P(a);names[b]=P(b)}
 await put("g",{order:[a,b],turn:0,stage:"start",names,mem:mm,f:{[a]:Math.random()<.5?0:1,[b]:Math.random()<.5?0:1},cnt:{[a]:0,[b]:0},pos:{[a]:B[b].S,[b]:B[a].S},path:{[a]:[B[b].S],[b]:[B[a].S]},ev:{id:Date.now(),k:""}});
 await psh("log",names[a]+":START");await put("phase","play")}

/* ---- tournament ---- */
let tbusy=0;
const tn=(t,u)=>t.pn?.[u]||P(u);
function tfill(t){for(let r=1;r<t.rr;r++)for(let j=0;j<t.Pw/2**(r+1);j++){const A=t.m[(r-1)+"-"+(2*j)],B=t.m[(r-1)+"-"+(2*j+1)],mm=t.m[r+"-"+j];mm.a=A?.w||"";mm.b=B?.w||""}}
/* 同時に始められる試合(トーナメント)。最大4つ */
function tnextKeys(t){const o=[];for(let r=0;r<t.rr;r++)for(let j=0;j<t.Pw/2**(r+1);j++){const mm=t.m[r+"-"+j];if(mm&&mm.a&&mm.b&&mm.b!=="bye"&&!mm.w&&o.length<4)o.push(r+"-"+j)}return o}
const PAR=()=>R.set?.par!==false;
function tnextKey(t){for(let r=0;r<t.rr;r++)for(let j=0;j<t.Pw/2**(r+1);j++){const mm=t.m[r+"-"+j];if(mm&&mm.a&&mm.b&&mm.b!=="bye"&&!mm.w)return r+"-"+j}return ""}
function tbuild(part,pn){const sh=[...part].sort(()=>Math.random()-.5),N=sh.length,Pw=N<=4?4:8,byes=Pw-N,rr=Math.log2(Pw),m={},kinds=[];
 let nb=byes,nr=Pw/2-byes,i=0;while(nb+nr>0){if(nb>0){kinds.push("b");nb--}if(nr>0){kinds.push("r");nr--}}
 kinds.forEach((k,j)=>{if(k==="b"){const a=sh[i++];m["0-"+j]={a,b:"bye",w:a}}else{const a=sh[i++],c=sh[i++];m["0-"+j]={a,b:c,w:""}}});
 for(let q=1;q<rr;q++)for(let j=0;j<Pw/2**(q+1);j++)m[q+"-"+j]={a:"",b:"",w:""};
 const t={k:"tour",st:"announce",pn,Pw,rr,m,cur:"",champ:""};tfill(t);t.cur=tnextKey(t);return t}
async function trecord(k,w){const t=JSON.parse(JSON.stringify(R.t));t.m[k].w=w;tfill(t);const nk=tnextKey(t);
 if(nk){t.st="announce";t.cur=nk}else{t.st="done";t.cur="";t.champ=w}await put("t",t)}
async function tmatch(a,b){for(const k of["boards","g","log","bets","prog","bonus","bq","bt","bgo","tb"])await put(k,null);
 await put("set/mode","single");await put("slots",{a,b});await put("t/st","match");await put("phase","setup")}
async function tafter(w){const t=R.t;if(tbusy||!t||t.st!=="match"||!t.cur)return;tbusy=1;
 try{await put("slots",null);await trecord(t.cur,w);await put("phase","tour")}finally{tbusy=0}}
const tname=(t,r)=>r===t.rr-1?"決勝":r===t.rr-2?"準決勝":(r+1)+"回戦";
function tdisp(){const t=R.t;if(!t)return "";if(t.k!=="tour")return tdisp2(t);let h="";
 const who=u=>u?(u==="bye"?"不戦勝":nh(tn(t,u))+"さん"):"?";
 for(let r=0;r<t.rr;r++){h+=`<div class="tr">${tname(t,r)}</div>`;
  for(let j=0;j<t.Pw/2**(r+1);j++){const k=r+"-"+j,mm=t.m[k]||{},cur=(t.batch||[t.cur]).includes(k)&&t.st!=="done";
   h+=`<div class="${cur?"tcur":""}">${cur?"▶ ":""}${mm.b==="bye"?who(mm.a)+"(不戦勝)":who(mm.a)+" VS "+who(mm.b)}${mm.w&&mm.b!=="bye"?" → 🏆"+nh(tn(t,mm.w)):""}</div>`}}
 return h}
function tour(){const t=R.t;if(!t)return;if(t.k!=="tour")return tour2(t);const adm=R.admin===me,mt=t.m?.[t.cur]||{},bt=t.batch||[];
 $("#tmsg2").innerHTML=t.st==="done"?`🏆 優勝 ${nh(tn(t,t.champ))}さん!`:bt.length>1?`次の試合(${bt.length}試合を同時に)<br>`+bt.map((k,i)=>{const m=t.m[k]||{};return `${FL[i]}フロア ${tname(t,+k.split("-")[0])}:${nh(tn(t,m.a))}さん VS ${nh(tn(t,m.b))}さん`}).join("<br>"):`次の試合(${tname(t,+String(t.cur).split("-")[0])})<br>${nh(tn(t,mt.a))}さん VS ${nh(tn(t,mt.b))}さん`;
 $("#tbrd").innerHTML=tdisp();
 $("#tstart").hidden=!(adm&&t.st==="announce");$("#tend").hidden=!(adm&&t.st==="done");
 $("#twait").textContent=adm?"":(t.st==="done"?"管理者が大会を終了するのを待っています…":"管理者が「開始」を押すのを待っています…")}
function tctl(rev,g){const t=R.t,on=!!t&&rev&&R.admin===me&&t.st==="match";$("#tpick").hidden=!on;if(!on)return;$("#tfl").innerHTML="";$("#tnx").disabled=false;
 if(t.k!=="tour"){$("#tmsg").textContent=`第${t.i+1}/${t.n}試合が終わりました`;$("#tnx").hidden=false;$("#tw1").hidden=$("#tw2").hidden=$("#twr").hidden=true;return}
 const mt=t.m?.[t.cur]||{},dr=g.res==="draw";
 $("#tmsg").textContent=dr?"引き分け!勝者を選んでください":`${PN(g.res)}さんの勝ち`;
 $("#tnx").hidden=dr;$("#tw1").hidden=$("#tw2").hidden=$("#twr").hidden=!dr;
 $("#tw1").textContent=tn(t,mt.a)+"さんの勝ち";$("#tw2").textContent=tn(t,mt.b)+"さんの勝ち"}
$("#tstart").onclick=async()=>{if(R.t.k!=="tour")return tstart2();if(R.t.batch?.length)return tstartF();const t=R.t,mt=t.m[t.cur],pl=R.players||{},ha=!!pl[mt.a],hb=!!pl[mt.b];
 if(!ha||!hb){await trecord(t.cur,ha?mt.a:hb?mt.b:[mt.a,mt.b][Math.floor(Math.random()*2)]);return}
 await tmatch(mt.a,mt.b)};
/* トーナメントをフロアで同時に: いない人がいる試合は不戦勝にして、残りをフロアへ */
async function tstartF(){const t=JSON.parse(JSON.stringify(R.t)),pl=R.players||{},go=[];
 for(const k of t.batch){const m=t.m[k],ha=!!pl[m.a],hb=!!pl[m.b];if(ha&&hb)go.push(k);else{m.w=ha?m.a:hb?m.b:rnd([m.a,m.b]);tfill(t)}}
 if(!go.length){tnextB(t);await put("t",t);return}
 const fl={};go.forEach((k,i)=>{const m=t.m[k];fl[FL[i]]={mode:"single",phase:"setup",slots:{a:m.a,b:m.b},nm:{[m.a]:tn(t,m.a),[m.b]:tn(t,m.b)},mk:k}});
 t.batch=go;t.st="match";await fgo(t,fl)}
function tnextB(t){const nx=tnextKeys(t);if(nx.length){t.st="announce";t.cur=nx[0];t.batch=nx}else{t.st="done";t.cur="";t.batch=null;t.champ=t.m[(t.rr-1)+"-0"].w}}
async function fgo(t,fl){fpick={};for(const k of["boards","g","log","bets","prog","bonus","bq","bt","bgo","tb","slots"])await put(k,null);await put("t",t);await rput("fl",fl);await rput("phase","floor")}
/* 全フロアが終わったら: 結果を大会に入れて次へ */
function ftctl(){const t=R.t,fl=ROOM.fl||{},ks=Object.keys(fl).sort(),on=!!t&&t.st==="match"&&R.admin===me&&ks.every(F=>fdone(fl[F]));
 $("#tpick").hidden=!on;if(!on)return;$("#tw1").hidden=$("#tw2").hidden=$("#twr").hidden=true;
 const nm=(F,u)=>fl[F].g?.names?.[u]||fl[F].nm?.[u]||ROOM.players?.[u]?.name||"?";let need=0,h="";
 ks.forEach(F=>{const g=fl[F].g||{};
  if(g.res==="draw"){if(t.k==="tour"){const m=t.m[fl[F].mk];if(!fpick[F])need++;
    h+=`<div>${F}フロア 引き分け → 勝者:${fpick[F]?esc(nm(F,fpick[F]))+"さん":"選んでください"}</div><div class="row"><button data-f="${F}" data-w="${m.a}">${esc(nm(F,m.a))}さん</button><button data-f="${F}" data-w="${m.b}">${esc(nm(F,m.b))}さん</button><button data-f="${F}" data-w="rnd">ランダム</button></div>`}
   else h+=`<div>${F}フロア 引き分け</div>`}
  else h+=`<div>${F}フロア ${esc(g.names?.[g.res]||"?")}さんの勝ち</div>`});
 $("#tmsg").textContent=t.k==="tour"?"全フロアの試合が終わりました":`第${t.i+1}〜${t.i+ks.length}/${t.n}試合が終わりました`;
 $("#tfl").innerHTML=h;$("#tnx").hidden=false;$("#tnx").disabled=need>0}
$("#tfl").onclick=e=>{const b=e.target.closest("button");if(!b)return;const F=b.dataset.f,m=R.t.m[ROOM.fl[F].mk];fpick[F]=b.dataset.w==="rnd"?rnd([m.a,m.b]):b.dataset.w;draw()};
async function fnext(){const t0=R.t,fl=ROOM.fl||{},ks=Object.keys(fl).sort();if(tbusy||!t0||t0.st!=="match")return;tbusy=1;
 try{let t;
  if(t0.k==="tour"){t=JSON.parse(JSON.stringify(t0));for(const F of ks){const g=fl[F].g||{},w=g.res==="draw"?fpick[F]:g.res;if(!w)return alert("引き分けの勝者を選んでください");t.m[fl[F].mk].w=w;tfill(t)}tnextB(t)}
  else{t=tcl();for(const F of ks)tapply(t,fl[F].lu,tres(fl[F].lu,fl[F].g||{}));t.i+=ks.length-1;tstep(t)}
  fpick={};await rput("fl",null);await put("t",t);await rput("phase","tour")}finally{tbusy=0}}
$("#tend").onclick=async()=>{await put("set/mode","single");await put("t",null);await put("obs",null);await put("set/tt","");await put("slots",null);await put("phase","lobby")};
$("#tnx").onclick=()=>FLM()?fnext():R.t.k==="tour"?tafter(R.g.res):tnext();
$("#tw1").onclick=()=>tafter(R.t.m[R.t.cur].a);
$("#tw2").onclick=()=>tafter(R.t.m[R.t.cur].b);
$("#twr").onclick=()=>{const mt=R.t.m[R.t.cur];tafter([mt.a,mt.b][Math.floor(Math.random()*2)])};
$("#tb").onclick=()=>{$("#tpc").innerHTML=tdisp();$("#tp").hidden=false};
$("#tpx").onclick=()=>{$("#tp").hidden=true};

/* ---- event (league / official) ---- */
const FN={single:"シングル",double:"ダブルス",multi:"マルチ"},pk=(a,b)=>[a,b].sort().join("|"),rnd=a=>a[Math.floor(Math.random()*a.length)],shuf=a=>[...a].sort(()=>Math.random()-.5);
let lastTT=null;
function tcfgSync(tt,ad){$("#tcfg").hidden=!(ad&&tt&&tt!=="tour");
 if(tt!==lastTT){lastTT=tt;const s=$("#tnn");s.innerHTML="";const add=(v,t)=>s.add(new Option(t,v));
  if(tt==="ls"){add(0,"総当たり(全部)");for(let i=1;i<=28;i++)add(i,i+"試合")}
  else if(tt==="ld"){for(let i=3;i<=20;i++)add(i,i+"試合")}
  else if(tt==="off"){for(let i=3;i<=10;i++)add(i,i+"試合")}}
 if(tt&&tt!=="tour")$("#tnn").value=R.set.tn??(tt==="ls"?0:tt==="ld"?6:3)}
const tcl=()=>{const t=JSON.parse(JSON.stringify(R.t));["rec","apps","qc","pt","pl"].forEach(k=>t[k]=t[k]||{});t.hist=t.hist||[];return t};
const tpres=t=>Object.keys(t.pn).filter(u=>R.players?.[u]);
function tsplit(t,f4){const o=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]],cost=p=>p.reduce((s,[i,j])=>s+(t.pt?.[pk(f4[i],f4[j])]||0),0),mn=Math.min(...o.map(cost)),p=rnd(o.filter(x=>cost(x)===mn));
 return{tA:shuf(p[0].map(i=>f4[i])),tB:shuf(p[1].map(i=>f4[i]))}}
function tpick(t,f,ex=new Set(),plx=t.pl){const pr=tpres(t).filter(u=>!ex.has(u)),few=k=>shuf(pr).sort((x,y)=>(t.apps?.[x]||0)-(t.apps?.[y]||0)).slice(0,k);
 if(f==="single"){if(pr.length<2)return null;
  if(t.k==="ls"){let best=[],bc=1e9;for(let i=0;i<pr.length;i++)for(let j=i+1;j<pr.length;j++){if(plx?.[pk(pr[i],pr[j])])continue;const c=(t.apps?.[pr[i]]||0)+(t.apps?.[pr[j]]||0);if(c<bc){bc=c;best=[[pr[i],pr[j]]]}else if(c===bc)best.push([pr[i],pr[j]])}
   return best.length?{f,ps:shuf(rnd(best))}:null}
  return{f,ps:few(2)}}
 if(f==="double"){if(pr.length<4)return null;return{f,...tsplit(t,few(4))}}
 if(f==="multi"){if(pr.length<3)return null;const q=shuf(pr).sort((x,y)=>(t.qc?.[x]||0)-(t.qc?.[y]||0)||(t.apps?.[x]||0)-(t.apps?.[y]||0))[0];return{f,q,cs:pr.filter(u=>u!==q)}}
 return null}
/* 同時にできる試合をまとめて選ぶ(同じ人が重ならないように。最大4試合、残りの試合数まで) */
function tbatch(t,f){const ex=new Set(),plx={...(t.pl||{})},o=[],mx=Math.min(4,t.n-t.i);
 while(o.length<mx){const lu=tpick(t,f,ex,plx);if(!lu)break;o.push(lu);luIds(lu).forEach(u=>ex.add(u));if(f==="single")plx[pk(lu.ps[0],lu.ps[1])]=1}return o}
function tre(t,f){let lu=null;t.batch=null;if(PAR()&&f!=="multi"){const b=tbatch(t,f);if(b.length){t.batch=b;lu=b[0]}}else lu=tpick(t,f);
 if(lu){t.cur=lu;t.st="announce"}else if(t.k==="off"){t.cur=null;t.st="choose"}else{t.st="done";t.cur=null}}
function tstep(t){t.i++;if(t.i>=t.n){t.st="done";t.cur=null}else if(t.k==="off"){t.st="choose";t.cur=null}else tre(t,t.k==="ls"?"single":"double")}
function tevent(tt,part,pn){const N=part.length,dv=tt==="ls"?0:tt==="ld"?6:3,v=R.set.tn??dv,pairs=N*(N-1)/2,n=tt==="ls"?(v>0?Math.min(v,pairs):pairs):v;
 const t={k:tt,st:"announce",pn,n,i:0,rec:{},apps:{},qc:{},pt:{},pl:{},hist:[],cur:null};
 part.forEach(u=>{t.rec[u]={w:0,l:0,d:0};t.apps[u]=0;t.qc[u]=0});
 if(tt==="off")t.st="choose";else tre(t,tt==="ls"?"single":"double");return t}
const luIds=lu=>lu.f==="single"?lu.ps:lu.f==="double"?[...lu.tA,...lu.tB]:[lu.q,...lu.cs];
const luHtml=(t,lu)=>{const n=u=>nh(tn(t,u))+"さん";return lu.f==="single"?n(lu.ps[0])+" VS "+n(lu.ps[1]):lu.f==="double"?"A("+lu.tA.map(n).join("、")+") VS B("+lu.tB.map(n).join("、")+")":"出題者 "+n(lu.q)+"<br>挑戦者 "+lu.cs.map(n).join("、")};
function trank(t){const co=!!R.set.coin,a=Object.keys(t.pn).map(u=>{const r=t.rec?.[u]||{};return{u,n:t.pn[u],c:co?cn(t.pn[u]):0,w:r.w||0,l:r.l||0,d:r.d||0,a:t.apps?.[u]||0}});
 a.sort((x,y)=>(y.c-x.c)||(y.w-x.w)||(y.d-x.d));let rk=0;
 a.forEach((x,i)=>{const p=a[i-1];if(!p||x.c!==p.c||x.w!==p.w||x.d!==p.d)rk=i+1;x.rk=rk});return a}
function tdisp2(t){const co=!!R.set.coin;let h=`<table class="tk"><tr><th>順位</th><th>名前</th>${co?"<th>🪙</th>":""}<th>勝-負-分</th><th>出場</th></tr>`;
 trank(t).forEach(x=>{h+=`<tr><td>${x.rk}</td><td>${nh(x.n)}</td>${co?`<td>${x.c}</td>`:""}<td>${x.w}-${x.l}-${x.d}</td><td>${x.a}</td></tr>`});h+="</table>";
 (t.hist||[]).forEach((e,i)=>{const g=k=>Object.keys(e.r||{}).filter(u=>e.r[u]===k).map(u=>nh(tn(t,u))).join("、");
  h+=`<div>第${i+1}試合 ${FN[e.f]}:${g("w")?" ○"+g("w"):""}${g("d")?" △"+g("d"):""}${g("l")?" ●"+g("l"):""}</div>`});return h}
function tour2(t){const adm=R.admin===me,done=t.st==="done",pr=tpres(t).length;let h;
 if(done)h="🏆 優勝 "+trank(t).filter(x=>x.rk===1).map(x=>nh(x.n)+"さん").join("、");
 else if(t.st==="choose"||!t.cur)h=`第${t.i+1}/${t.n}試合<br>形式を選んでください`;
 else if(t.batch?.length>1)h=`第${t.i+1}〜${t.i+t.batch.length}/${t.n}試合 ${FN[t.cur.f]}(同時)<br>`+t.batch.map((lu,i)=>`${FL[i]}フロア:${luHtml(t,lu)}`).join("<br>");
 else h=`第${t.i+1}/${t.n}試合 ${FN[t.cur.f]}<br>${luHtml(t,t.cur)}`;
 $("#tmsg2").innerHTML=h;$("#tbrd").innerHTML=tdisp2(t);
 $("#tfmt").hidden=!(adm&&t.k==="off"&&!done);[["tf1",2],["tf2",4],["tf3",3]].forEach(([id,k])=>$("#"+id).disabled=pr<k);
 $("#tstart").hidden=!(adm&&t.st==="announce"&&!!t.cur);$("#tend").hidden=!(adm&&done);
 $("#twait").textContent=adm?"":done?"管理者が大会を終了するのを待っています…":t.st==="choose"?"管理者が形式を選んでいます…":"管理者が「開始」を押すのを待っています…"}
async function tchoose(f){const t=tcl();if(t.st==="done"||t.st==="match")return;
 if(PAR()&&f!=="multi"){const b=tbatch(t,f);if(!b.length)return alert("その形式を行う人数が足りません");t.batch=b;t.cur=b[0];t.st="announce";await put("t",t);return}
 const lu=tpick(t,f);if(!lu)return alert("その形式を行う人数が足りません");t.batch=null;t.cur=lu;t.st="announce";await put("t",t)}
$("#tf1").onclick=()=>tchoose("single");$("#tf2").onclick=()=>tchoose("double");$("#tf3").onclick=()=>tchoose("multi");
async function tstart2(){const t=R.t;if(!t.cur||t.st!=="announce")return;
 const bt=t.batch?.length?t.batch:[t.cur];
 if(bt.some(lu=>luIds(lu).some(u=>!R.players?.[u]))){const t2=tcl();tre(t2,t.cur.f);await put("t",t2);return}
 if(!t.batch?.length)return tmatch2(t.cur);
 const fl={};bt.forEach((lu,i)=>{const o={mode:lu.f,phase:"setup",lu,nm:{}};luIds(lu).forEach(u=>o.nm[u]=tn(t,u));
  if(lu.f==="single")o.slots={a:lu.ps[0],b:lu.ps[1]};
  else{o.slots={a:lu.tA[0],a2:lu.tA[1],b:lu.tB[0],b2:lu.tB[1]};o.tb={};for(const[id,mm]of[["tA",lu.tA],["tB",lu.tB]]){const sh=shuf(mm);o.tb[id]={m:mm,s:sh[0],g:sh[1],f:rnd(mm)}}}
  fl[FL[i]]=o});
 const t2=tcl();t2.st="match";await fgo(t2,fl)}
async function tmatch2(lu){for(const k of["boards","g","log","bets","prog","bonus","bq","bt","bgo","tb","slots"])await put(k,null);
 if(lu.f==="single"){await put("set/mode","single");await put("slots",{a:lu.ps[0],b:lu.ps[1]})}
 else if(lu.f==="double"){await put("set/mode","double");await put("slots",{a:lu.tA[0],a2:lu.tA[1],b:lu.tB[0],b2:lu.tB[1]});
  const tb={};for(const[id,mm]of[["tA",lu.tA],["tB",lu.tB]]){const sh=shuf(mm);tb[id]={m:mm,s:sh[0],g:sh[1],f:rnd(mm)}}await put("tb",tb)}
 else{const sl={q:lu.q};lu.cs.forEach((u,i)=>sl["c"+(i+1)]=u);await put("set/mode","multi");await put("slots",sl)}
 await put("t/st","match");await put("phase","setup")}
function tres(lu,g){const rm={};
 if(lu.f==="single"){const[a,b]=lu.ps;if(g.res==="draw"){rm[a]="d";rm[b]="d"}else{rm[a]=g.res===a?"w":"l";rm[b]=g.res===b?"w":"l"}}
 else if(lu.f==="double"){for(const[id,mm]of[["tA",lu.tA],["tB",lu.tB]])mm.forEach(u=>rm[u]=g.res==="draw"?"d":g.res===id?"w":"l")}
 else{const arr=g.arr||[];lu.cs.forEach(u=>rm[u]=!arr.length?"l":arr[0]===u?"w":arr.includes(u)?"d":"l");rm[lu.q]=arr.length?"l":"w"}
 return rm}
function tapply(t,lu,rm){for(const u in rm){const r=t.rec[u]=t.rec[u]||{w:0,l:0,d:0};r[rm[u]]++;t.apps[u]=(t.apps[u]||0)+1}
 if(lu.f==="double")[lu.tA,lu.tB].forEach(p=>{const k=pk(p[0],p[1]);t.pt[k]=(t.pt[k]||0)+1});
 if(lu.f==="single")t.pl[pk(lu.ps[0],lu.ps[1])]=1;
 if(lu.f==="multi")t.qc[lu.q]=(t.qc[lu.q]||0)+1;
 t.hist.push({f:lu.f,r:rm})}
async function tnext(){const t0=R.t,g=R.g;if(tbusy||!t0||t0.st!=="match"||!t0.cur||!g)return;tbusy=1;
 try{const t=tcl(),lu=t.cur;tapply(t,lu,tres(lu,g));tstep(t);await put("slots",null);await put("t",t);await put("phase","tour")}finally{tbusy=0}}
async function tforf(u){const t0=R.t;if(tbusy||!t0||t0.st!=="match"||!t0.cur)return;tbusy=1;
 try{const t=tcl(),lu=t.cur,rm={};
  if(lu.f==="single")lu.ps.forEach(x=>rm[x]=x===u?"l":"w");
  else{const lt=lu.tA.includes(u)?lu.tA:lu.tB,wt=lt===lu.tA?lu.tB:lu.tA;lt.forEach(x=>rm[x]="l");wt.forEach(x=>rm[x]="w")}
  tapply(t,lu,rm);tstep(t);await put("slots",null);await put("t",t);await put("phase","tour")}finally{tbusy=0}}
async function tvoid(){const t0=R.t;if(tbusy||!t0||t0.st!=="match"||!t0.cur)return;tbusy=1;
 try{const t=tcl();tre(t,t.cur.f);await put("slots",null);await put("t",t);await put("phase","tour")}finally{tbusy=0}}

/* ---- bonus wall ---- */
const rankHtml=()=>Object.values(R.players||{}).map(p=>[p.name,cn(p.name)]).sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0])).map((x,i)=>`<tr><td>${i+1}</td><td>${nh(x[0])}</td><td>🪙${x[1]}</td></tr>`).join("");
async function startBonus(){const sp=Object.keys(R.players||{}).filter(u=>FLM()?(!fAny(u)&&!!R.bets?.[u]):!isF(u));
 if(!sp.length)return startGame();
 const q={};sp.forEach(u=>q[u]=R.players[u].name);
 await put("bonus",null);await put("bgo",null);await put("bq",q);await put("bt",Date.now()+so+20000);await put("phase","bonus")}
const claim=async()=>(await runTransaction(ref(db,`rooms/${rid}/${fp("bgo")}`),v=>v?undefined:1)).committed;
const bInfo=()=>{const q=R.bq||{},pk=R.bonus||{},left=Math.ceil(((R.bt||0)-(Date.now()+so))/1000),todo=Object.keys(q).filter(u=>R.players?.[u]&&!pk[u]);return{q,pk,left,todo,sel:!isF(me)&&!!q[me]&&!pk[me]&&left>0}};
function bTick(){const i=bInfo(),t=Math.max(0,i.left);
 $("#bmsg").textContent=`ボーナスウォールを指定して下さい(あと${t}秒)  緑の壁をタップ`;
 $("#bw1").textContent=isF(me)?`準備完了!(あと${t}秒)`:`作成中…(あと${t}秒)`;
 $("#bwho").innerHTML=i.todo.map(u=>`<div>${esc(i.q[u])}さん(観戦者)ボーナスウォール指定中…</div>`).join("");
 if(!go2&&((isDrv()&&(i.left<=0||!i.todo.length))||(isF(me)&&i.left<=-4))){go2=1;claim().then(ok=>ok&&startGame())}}
function pickW(o,k){if((R.boards?.[o]?.w||[]).includes(k))put("bonus/"+me,{o,k,n:name})}
function bonus(){const[a,b]=gids(),F=isF(me),i=bInfo(),B=R.boards||{};
 $("#bsel").hidden=!i.sel;$("#bwait").hidden=i.sel;
 if(i.sel){$("#bt1").textContent=gname(a)+"さんの盤面";$("#bt2").textContent=gname(b)+"さんの盤面";
  bd($("#bb1"),B[a],{all:1,edge:k=>pickW(a,k)});bd($("#bb2"),B[b],{all:1,edge:k=>pickW(b,k)})}
 $("#bpl").hidden=!F;if(F)$("#brk").innerHTML=rankHtml();
 bTick()}
setInterval(()=>{if(R.phase==="bonus")bTick()},500);
async function bonusHit(p,k,first){if(!first||local||!R.set.coin||!R.set.bonus)return;const g=R.g,[a,b]=g.order,o=p===a?b:a;
 for(const x of Object.values(R.bonus||{}))if(x.o===o&&x.k===k){await put("coins/"+ck(x.n)+"/n",cn(x.n)+2);await psh("log","💥 "+x.n+"さんのボーナスウォール命中 +2")}}

/* ---- multi ---- */
const MCOL=["#2874a6","#c0392b","#27ae60","#f39c12","#8e44ad","#16a085","#d35400"];
function mwatch(miss,pl,ids,s){const keys=SK();
 for(const k of keys){const u=s[k];if(!u||!miss(u))continue;
  if(R.phase==="lobby"){if(R.admin===me||(!pl[R.admin]&&ids[0]===me))put("slots/"+k,null);continue}
  if(keys.map(x=>s[x]).find(x=>x&&pl[x])!==me)continue;
  const g=R.g;
  if(R.phase==="setup"){put("slots/"+k,null);if(k==="q"||mcnt(s)-1<2){if(R.t?.st==="match")tvoid();else{put("phase","lobby");alert("参加者が退出しました")}}continue}
  if(R.phase==="play"&&g?.multi&&!["end","reveal"].includes(g.stage)){
   put("slots/"+k,null);
   if(k==="q"){if(R.t?.st==="match")tvoid();else{put("phase","lobby");alert("出題者が退出したので中止しました")}continue}
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
 if(arr.length){arr.forEach((u,i)=>add(u,i===0?2:1));g.order.filter(u=>!arr.includes(u)).forEach(u=>add(u,-1));add(g.q,-2)}
 else{add(g.q,3);g.order.forEach(u=>add(u,-2))}
 const o=[];for(const k in d){const old=cn(nm[k]),nw=Math.max(0,old+d[k]);if(nw!==old){await put("coins/"+k+"/n",nw);o.push(nm[k]+" "+(nw>old?"+":"")+(nw-old))}}
 if(o.length)await psh("log","🪙 "+o.join(", "))}
function mplay(g){const q=g.q,B=R.boards?.[q]||{w:[]},rev=g.stage==="reveal",isQ=me===q,ch=g.order.includes(me),spec=R.set?.spec,arr=g.arr||[];
 $("#t2").hidden=$("#b2").hidden=true;$("#mst").hidden=false;$("#bs").hidden=true;$("#tpick").hidden=true;
 $("#t1").textContent=`出題者:${PN(q)}さん  第${g.rn||1}/${g.lim}周`;
 const pcs=g.order.map((u,i)=>({pos:g.pos?.[u],col:colOf(PN(u))||MCOL[i%7],t:(PN(u)||"?").slice(0,1)})),mine=ch&&g.stage==="play"&&g.mv===me&&!arr.includes(me);
 bd($("#b1"),B,{paths:g.order.map((u,i)=>({cells:g.path?.[u]||[],col:colOf(PN(u))||MCOL[i%7]})),hit:g.hit||[],pieces:pcs,all:rev||isQ||(!ch&&spec),
  tap:mine?c=>{if(nb(g.pos[me]).includes(c))mstep(me,c)}:0});
 $("#mst").innerHTML=(g.stage==="play"?`<b>${nh(PN(g.mv))}さんのターン</b>(残り${2-(g.st||0)}マス)<br>`:"")+g.order.map((u,i)=>`<span style="color:${colOf(PN(u))||MCOL[i%7]}">●</span>${nh(PN(u))}${arr.includes(u)?"🏁":g.left?.[u]?"✕":""}`).join("　");
 const lgE=$("#lg"),keep=lgE.scrollTop,hold=lgHold||Date.now()-lgTouch<3000;
 lgE.innerHTML=msgs(R.log).slice(-300).map(x=>`<div${x.startsWith("💬")?' class="cm"':""}>${lgc(x)}</div>`).join("");
 lgE.classList.toggle("all",!!allLog);lgE.scrollTop=hold?keep:lgE.scrollHeight;
 $("#back").hidden=!(rev&&R.admin===me)||!!R.t;tctl(rev,g);
 if(!local&&R.set.coin&&(g.stage==="end"||g.stage==="reveal")&&!g.hl&&me===q){g.hl=1;put("g/hl",1);msettle()}
 if(g.stage==="start"&&!stT&&me===q)stT=setTimeout(()=>{stT=0;if(R.g?.stage==="start")mstart()},2000)}
function mOv(g){const st=g.stage,arr=g.arr||[];
 if(st==="start")return `<div class="big">出題者 ${esc(PN(g.q))}さん<br>挑戦者 ${g.order.map(u=>esc(PN(u))).join(" → ")}</div>`;
 if(st==="end"){if(!arr.length)return `<div class="huge">出題者 ${esc(PN(g.q))}さんの勝ち！！</div><div class="sm">誰もゴールできませんでした</div>`;
  if(R.set.coin)return `<div class="big">${arr.map((u,i)=>(i+1)+"位 "+esc(PN(u))+"さん").join("<br>")}</div>`;
  return arr.length===1?`<div class="big">${esc(PN(arr[0]))}さんの勝ち！！</div>`:`<div class="big">同着！！<br>${arr.map(u=>esc(PN(u))+"さん").join("<br>")}</div>`}
 return ""}

/* ---- play ---- */
const pcol=(g,id)=>colOf(g.names?.[g.mem?.[id]?.[0]||id]||"");
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
 bd($("#b1"),B[d1],{path:g.path?.[s1],pcol:pcol(g,s1),pos:g.pos?.[s1],hit:g.hit?.[s1],all:rev||(!F&&spec),col:pcol(g,s1)||"#2874a6",
  tap:F?c=>{if(g.stage==="play"&&g.mv===me&&nb(g.pos[mt]).includes(c))step(mt,c)}:0});
 bd($("#b2"),B[d2],{path:g.path?.[s2],pcol:pcol(g,s2),pos:g.pos?.[s2],hit:g.hit?.[s2],all:F||rev||spec,col:pcol(g,s2)||"#c0392b"});
 const lgE=$("#lg"),keep=lgE.scrollTop,hold=lgHold||Date.now()-lgTouch<3000;
 lgE.innerHTML=msgs(R.log).slice(-300).map(x=>`<div${x.startsWith("💬")?' class="cm"':""}>${lgc(x)}</div>`).join("");
 lgE.classList.toggle("all",!!allLog);lgE.scrollTop=hold?keep:lgE.scrollHeight;
 if(FLM()){const fl=ROOM.fl||{},all=Object.keys(fl).every(F=>fdone(fl[F]));
  $("#back").hidden=!(all&&R.admin===me)||!!R.t;ftctl();
  $("#fst").hidden=false;$("#fst").textContent=all?(R.admin===me?"":R.t?"管理者が「次へ」を押すのを待っています…":"管理者がロビーに戻すのを待っています…"):rev?"ほかのフロアが終わるのを待っています(下のボタンで観戦できます)":""}
 else{$("#fst").hidden=true;$("#back").hidden=!(rev&&(R.admin===me||local))||!!R.t;tctl(rev,g)}
 {const e=$("#bs");e.hidden=local||!R.set.coin;
  if(!e.hidden){const bt=R.bets||{},c=k=>Object.values(bt).filter(x=>x.c===k).length,my=bt[me];
   e.textContent=`🎲 ${blab(a)||PN(a)} ${c(a)}票 / ${blab(b)||PN(b)} ${c(b)}票 / 引き分け ${c("draw")}票`+(F?"":` ・あなた:`+(my?(my.c==="draw"?"引き分け":(blab(my.c)||PN(my.c))):"なし"))+` ・🪙${cn(name)}`}}
 if(!local&&R.set.coin&&(g.stage==="end"||g.stage==="reveal")&&g.res&&!g.hl&&me===wr(g,g.res==="draw"?a:g.res)){g.hl=1;put("g/hl",1);settle()}
 if(g.stage==="start"&&!stT&&(local||me===wr(g,a)))stT=setTimeout(()=>{stT=0;if(R.g?.stage==="start"){put("g/stage","play");turn(0)}},2000)}
$("#al").onclick=()=>{allLog=!allLog;draw()};
$("#ftab").onclick=e=>{const b=e.target.closest("button");if(!b||b.disabled||!ROOM.fl?.[b.dataset.f])return;VF=b.dataset.f;const g=ROOM.fl[VF].g;lastEv=g?.ev?.id||0;lastTn=g?.tn?.id||0;betView=0;R=fview(VF);draw()};
{const e=$("#lg"),rel=()=>{lgHold=0;lgTouch=Date.now();setTimeout(()=>{if(!lgHold&&Date.now()-lgTouch>=2900)e.scrollTop=e.scrollHeight},3000)};
 e.addEventListener("touchstart",()=>lgHold=1,{passive:true});e.addEventListener("touchend",rel);e.addEventListener("touchcancel",rel);e.addEventListener("wheel",rel,{passive:true})}
$("#back").onclick=async()=>{if(local)return location.reload();if(FLM()){fpick={};await rput("fl",null);await rput("phase","lobby");return}await put("phase","lobby");await put("g",null);await put("boards",null);await put("bets",null);await put("prog",null);await put("bonus",null);await put("bq",null);await put("bt",null);await put("bgo",null);await put("tb",null)};

/* ---- overlay / fx ---- */
function ov(){const g=R.g||{},st=g.stage,b=g.order?.[1];let h="";
 if(R.phase==="play"&&g.multi)h=mOv(g);
 else if(R.phase==="play"){
  if(st==="start")h=`<div class="big">${esc(PN(g.order[0]))}さん先攻！<br>${esc(PN(b))}さん後攻です！</div>`;
  else if(st==="goal")h=`<div class="big">${esc(PN(g.who))}さんゴール！！</div>`;
  else if(st==="sudden")h=`<div class="huge">サドンデス！！！</div><div class="sm">${esc(PN(b))}さん、ゴール出来なかったら負け！</div>`;
  else if(st==="end")h=g.res==="draw"?`<div class="huge">引き分け！！</div>`:`<div class="big">${esc(PN(g.res))}さんの勝ち！！</div>`}
 $("#ov").innerHTML=h;$("#ov").hidden=!h;
 if(g.ev&&g.ev.id!==lastEv){lastEv=g.ev.id;if(g.ev.k){const f=$("#fx"),sp=$("#stamp"),s2=$("#stamp2"),ng=g.ev.k==="ng";f.textContent=g.ev.k==="ok"?"〇":"✕";f.className=g.ev.k;f.hidden=false;sp.hidden=!ng;s2.hidden=ng||(window.okc=(window.okc||0)+1)%3!==0;setTimeout(()=>{f.hidden=true;sp.hidden=true;s2.hidden=true},ng?1000:700)}}}
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
 show(ph==="lobby"?"lobby":ph==="setup"?"setup":ph==="bonus"?"bonus":ph==="tour"?"tour":"game");
 if(ph==="lobby")lobby();else if(ph==="setup")setup();else if(ph==="bonus")bonus();else if(ph==="tour")tour();else if(R.g)play();
 $("#tb").hidden=!R.t;if(!$("#tp").hidden)$("#tpc").innerHTML=tdisp();
 {const fe=$("#ftab");fe.hidden=!FLM();if(FLM()){const fl=ROOM.fl||{},a=actFl();
  fe.innerHTML=Object.keys(fl).sort().map(F=>{const f=fl[F],st=fdone(f)?"🏁":f.phase==="play"?"⚔️":f.phase==="bonus"?"🎯":"🛠";return `<button data-f="${F}" class="${F===VF?"on":""}"${a&&a!==F?" disabled":""}>${F}${st}</button>`}).join("")}}
 ov();tnfx();chats();if(local)cpu()}

/* ---- 自動復帰 ---- */
$("#nm").value=LS.get("lab_name")||"";
(async()=>{const rm=LS.get("lab_room");name=LS.get("lab_name")||"";if(!rm||!name)return;
 try{me??=await C.login();if((await get(ref(db,"rooms/"+rm))).exists())join(rm);else LS.del("lab_room")}catch(e){}})();
$("#out").onclick=async()=>{LS.del("lab_room");try{if(rid)await set(ref(db,`rooms/${rid}/players/${me}`),null)}catch(e){}location.reload()};
