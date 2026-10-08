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
