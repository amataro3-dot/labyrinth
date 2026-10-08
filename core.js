import{initializeApp}from"https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import{getAuth,signInAnonymously}from"https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import{getDatabase,ref,set,push,get,onValue,runTransaction,onDisconnect,remove}from"https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js";
const app=initializeApp({apiKey:"AIzaSyBxf-38qXL-cUFIdJFd_x0JCJyXlHOKZHE",authDomain:"labyrinth-game-bc5aa.firebaseapp.com",databaseURL:"https://labyrinth-game-bc5aa-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"labyrinth-game-bc5aa",appId:"1:534431752677:web:677413dac8ba95b0e50f0c"});
export const db=getDatabase(app);
export const login=async()=>(await signInAnonymously(getAuth(app))).user.uid;
export{ref,set,push,get,onValue,runTransaction,onDisconnect,remove};
export const N=6,L="ABCDEF";
const xy=s=>s.split(",").map(Number);
export const cl=s=>{const[r,c]=xy(s);return L[r]+(c+1)};
export const wk=(a,b)=>{const[r,c]=xy(a),[s,d]=xy(b);return r===s?"v"+r+Math.min(c,d):"h"+Math.min(r,s)+c};
export const nb=a=>{const[r,c]=xy(a);return[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([x,y])=>x>=0&&y>=0&&x<N&&y<N).map(p=>p.join(","))};
export function reach(w,S,G){const seen=new Set([S]),q=[S];while(q.length){const a=q.shift();if(a===G)return true;for(const b of nb(a))if(!seen.has(b)&&!w.has(wk(a,b))){seen.add(b);q.push(b)}}return false}
export function cpuBoard(n){const E=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(r<N-1)E.push("h"+r+c);if(c<N-1)E.push("v"+r+c)}
const rc=()=>Math.floor(Math.random()*N)+","+Math.floor(Math.random()*N);
for(;;){const S=rc(),G=rc();if(S===G)continue;const w=[...E].sort(()=>Math.random()-.5).slice(0,n);if(reach(new Set(w),S,G))return{S,G,w,ok:1}}}
export function cpuMove(lv,pos,known,vis,G){
const n=nb(pos),ok=n.filter(x=>!known.has(wk(pos,x))),pick=a=>a[Math.floor(Math.random()*a.length)];
if(lv===1||!ok.length)return pick(n);
if(lv===2){const u=ok.filter(x=>!vis.has(x));return pick(u.length?u:ok)}
const prev={[pos]:0},q=[pos];
while(q.length){const a=q.shift();if(a===G)break;for(const b of nb(a))if(!(b in prev)&&!known.has(wk(a,b))){prev[b]=a;q.push(b)}}
if(!(G in prev))return pick(ok);
let c=G;while(prev[c]!==pos)c=prev[c];return c}
