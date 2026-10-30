/* 言語(日本語・English・한국어)。main.js が最初に読む(import)。Party-Arcade の i18n.js と同じ決まり。
   - 画面の文字は T("日本語の文")。下の辞書 I18N に [英語, 韓国語] を書く。辞書にない文は日本語のまま出る。
   - {n} などは T("壁{n}枚",{n:10}) のように置きかえる。
   - 名前のあとの「さん」は SAN(名前)(英語はなし、韓国語は「님」)。
   - Firebase に入っているログの文(昔からの日本語)は、見るときに LT() で各自の言語にする。
     ログの形は変えていないので、古い版の人と同じ部屋で遊んでも大丈夫。
   - index.html の文字は、起動したときに applyStatic() で置きかえる。
   - 選んだ言語は localStorage の muddys-lang(全ゲーム共通)。URL の ?lang=en などが優先。 */

export const LANGS = ["ja", "en", "ko"];
const LANG_NAMES = { ja: "日本語", en: "English", ko: "한국어" };
export const LANG = (() => {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) { localStorage.setItem("muddys-lang", q); return q; }
  } catch (e) { }
  try { const s = localStorage.getItem("muddys-lang"); if (LANGS.includes(s)) return s; } catch (e) { }
  const n = String(navigator.language || "").toLowerCase();
  return n.startsWith("ko") ? "ko" : n.startsWith("ja") ? "ja" : "en";
})();
document.documentElement.lang = LANG;

export function T(ja, vars) {
  const e = I18N[ja];
  let s = LANG === "ja" || !e ? ja : (e[LANG === "en" ? 0 : 1] ?? ja);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return s;
}
export const SAN = n => n + (LANG === "ja" ? "さん" : LANG === "ko" ? "님" : "");
/* サイトへのリンク(英語・韓国語は /en/ /ko/ のページ) */
export const sitePath = p => (LANG !== "ja" ? "/" + LANG + p : p);

/* タイトル画面の「日本語 / English / 한국어」。押したら、なまえを覚えてから読みこみ直す */
export function langSwitch(box, saveName) {
  const d = document.createElement("div");
  d.className = "row lang";
  d.innerHTML = LANGS.map(l => `<button data-lang="${l}" class="${l === LANG ? "on" : ""}">${LANG_NAMES[l]}</button>`).join("");
  d.onclick = e => {
    const l = e.target.dataset?.lang; if (!l || l === LANG) return;
    try { saveName(); localStorage.setItem("muddys-lang", l); } catch (x) { }
    const u = new URL(location.href); u.searchParams.delete("lang"); location.href = u.toString();
  };
  box.prepend(d);
}

/* index.html の文字(ボタン・説明・選択肢・入力欄のヒント)を置きかえる */
export function applyStatic(root) {
  if (LANG === "ja") return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
  nodes.forEach(n => { const k = n.nodeValue.trim(); if (k && I18N[k]) n.nodeValue = n.nodeValue.replace(k, T(k)); });
  root.querySelectorAll("[placeholder]").forEach(e => { const k = e.getAttribute("placeholder"); if (I18N[k]) e.setAttribute("placeholder", T(k)); });
  root.querySelectorAll("a[href^='/']").forEach(a => { const h = a.getAttribute("href"); if (h === "/" || h === "/privacy.html") a.setAttribute("href", sitePath(h)); });
  // 「だめ!!」「いいね!」のスタンプ(写真に日本語の手書き)の下に、訳した文字を出す(style.css の .cap)
  [["stamp", "だめ!!"], ["stamp2", "いいね!"]].forEach(([id, k]) => {
    const img = document.getElementById(id); if (!img) return;
    const c = document.createElement("div"); c.className = "cap " + id; c.textContent = T(k); img.after(c);
  });
}

/* Firebase のログの1行を、いまの言語にする */
export function LT(x) {
  if (LANG === "ja" || typeof x !== "string") return x;
  let m;
  if ((m = x.match(/^💥 (.*)さんのボーナスウォール命中 \+2$/))) return "💥 " + T("{n}のボーナスウォール命中 +2", { n: SAN(m[1]) });
  if ((m = x.match(/^(.*):START\(出題者\)$/))) return m[1] + ":START(" + T("出題者") + ")";
  if ((m = x.match(/^— 第(\d+)周 —$/))) return "— " + T("第{n}周", { n: m[1] }) + " —";
  if ((m = x.match(/^🏁 出題者 (.*) の勝ち\(誰もゴールできず\)$/))) return "🏁 " + T("出題者 {n} の勝ち(誰もゴールできず)", { n: m[1] });
  if (x.startsWith("🏁 ")) return x.replace(/(\d+)位 /g, (s, n) => T("{n}位 ", { n }));
  if ((m = x.match(/^(.*)さんゴール！！$/))) return T("{n}ゴール！！", { n: SAN(m[1]) });
  return x;
}

const I18N = {
  // --- index.html ---
  "なまえ": ["Name", "이름"],
  "ルームを作成": ["Create a room", "방 만들기"],
  "ルームID(4桁)": ["Room ID (4 digits)", "방 ID (4자리)"],
  "入室": ["Join", "입장"],
  "よわい": ["Easy", "약함"],
  "ふつう": ["Normal", "보통"],
  "つよい": ["Hard", "강함"],
  "コンピューター戦": ["vs. Computer", "컴퓨터 대전"],
  "Muddy's Games トップ": ["Muddy's Games home", "Muddy's Games 홈"],
  "プライバシーポリシー": ["Privacy policy", "개인정보 처리방침"],
  "ルームID：": ["Room ID: ", "방 ID: "],
  "対戦する": ["Play", "대전하기"],
  "対戦をやめる": ["Stop playing", "대전 그만하기"],
  "出題者になる": ["Be the maze maker", "출제자 하기"],
  "参加する": ["Join in", "참가하기"],
  "やめる": ["Cancel", "그만하기"],
  "フロアで同時に進める": ["Play matches on floors at the same time", "플로어에서 동시에 진행"],
  "試合数": ["Matches", "경기 수"],
  "観戦にする": ["Watch instead", "관전하기"],
  "大会を始める": ["Start the tournament", "대회 시작"],
  "大会": ["Event", "대회"],
  "通常対戦": ["Normal match", "일반 대전"],
  "トーナメント": ["Tournament", "토너먼트"],
  "リーグ戦(シングル)": ["League (Single)", "리그전 (싱글)"],
  "リーグ戦(ダブルス)": ["League (Doubles)", "리그전 (복식)"],
  "公式戦": ["Official match", "공식전"],
  "壁の枚数": ["Walls", "벽 개수"],
  "観戦者に壁を見せる": ["Show walls to spectators", "관전자에게 벽 보여 주기"],
  "コインバトル": ["Coin Battle", "코인 배틀"],
  "ボーナスウォール": ["Bonus Wall", "보너스 월"],
  "シングル": ["Single", "싱글"],
  "ダブルス": ["Doubles", "복식"],
  "マルチ": ["Multi", "멀티"],
  "フロア": ["Floors", "플로어"],
  "周の上限": ["Max rounds", "최대 바퀴"],
  "ゲームスタート": ["Start game", "게임 시작"],
  "送信": ["Send", "보내기"],
  "壁": ["Wall", "벽"],
  "準備完了": ["Ready", "준비 완료"],
  "決定": ["OK", "결정"],
  "どちらに賭けますか?": ["Who will win? Place your bet", "누구에게 걸까요?"],
  "🪙 コインランキング": ["🪙 Coin ranking", "🪙 코인 랭킹"],
  "次の試合の形式を選んでください": ["Choose the format of the next match", "다음 경기 형식을 고르세요"],
  "開始": ["Start", "시작"],
  "大会を終了(ロビーへ)": ["End the event (to lobby)", "대회 종료 (로비로)"],
  "全ログ": ["Full log", "전체 로그"],
  "ロビーに戻る": ["Back to lobby", "로비로"],
  "次へ": ["Next", "다음"],
  "ランダム": ["Random", "랜덤"],
  "ルームを出る": ["Leave room", "방 나가기"],
  "大会表": ["Standings", "대회 표"],
  "閉じる": ["Close", "닫기"],
  "だめ!!": ["NOPE!!", "안 돼!!"],
  "いいね!": ["NICE!", "좋아!"],

  // --- 共通のことば ---
  "観戦": ["Watching", "관전"],
  "出題者": ["Maze maker", "출제자"],
  "参加": ["Challenger", "참가"],
  "対戦": ["Player", "대전"],
  "、": [", ", ", "],
  "{n}枚": ["{n} walls", "{n}개"],
  "壁{n}枚": ["{n} walls", "벽 {n}개"],
  "{n}周": ["{n} rounds", "{n}바퀴"],
  "コンピューター": ["Computer", "컴퓨터"],
  "引き分け": ["Draw", "무승부"],
  "なし": ["none", "없음"],
  "オン": ["on", "켜짐"],
  "オフ": ["off", "꺼짐"],
  "あり": ["yes", "있음"],
  "フロア対戦": ["Floors", "플로어 대전"],
  "{f}フロア": ["Floor {f}", "{f} 플로어"],
  "決勝": ["Final", "결승"],
  "準決勝": ["Semifinal", "준결승"],
  "{n}回戦": ["Round {n}", "{n}회전"],
  "不戦勝": ["Bye", "부전승"],
  "(不戦勝)": [" (bye)", " (부전승)"],
  "{n}試合": ["{n} matches", "{n}경기"],
  "総当たり(全部)": ["Round robin (all)", "풀리그 (전부)"],

  // --- タイトル・入室 ---
  "なまえを入力してね": ["Please enter your name", "이름을 입력해 주세요"],
  "ルームが見つかりません": ["Room not found", "방을 찾을 수 없어요"],
  "満員です(最大8人)": ["The room is full (max 8)", "인원이 다 찼어요 (최대 8명)"],
  "その名前は使われています。べつの名前にしてね": ["That name is already taken. Please choose another name", "그 이름은 이미 쓰고 있어요. 다른 이름으로 해 주세요"],
  "ルームが閉じられました": ["The room was closed", "방이 닫혔어요"],
  "相手が退出しました": ["Your opponent left", "상대가 나갔어요"],

  // --- ロビー ---
  "(自分)": [" (you)", " (나)"],
  "そろったフロア:{f}(スタートで同時に始まります)": ["Ready floors: {f} (they all start together)", "준비된 플로어: {f} (시작하면 동시에 시작해요)"],
  "フロアの席を押してね。人がそろったフロアから始まります": ["Tap a floor seat. Floors with enough players will start", "플로어 자리를 눌러 주세요. 인원이 모인 플로어부터 시작해요"],
  "出題者 {q} / 挑戦者{n}人": ["Maze maker {q} / {n} challengers", "출제자 {q} / 도전자 {n}명"],
  "出題者1人と挑戦者2人以上が必要です": ["You need 1 maze maker and 2 or more challengers", "출제자 1명과 도전자 2명 이상이 필요해요"],
  "A1・A2・B1・B2の4人がそろうとスタートできます": ["You can start when A1, A2, B1 and B2 are all filled", "A1·A2·B1·B2 4명이 모이면 시작할 수 있어요"],
  "対戦者を待ってます…": ["Waiting for an opponent…", "상대를 기다리는 중…"],
  "対戦者はまだいません": ["No players yet", "아직 대전자가 없어요"],
  "出題者:{q} / 挑戦者({n}人):{c}": ["Maze maker: {q} / Challengers ({n}): {c}", "출제자: {q} / 도전자 ({n}명): {c}"],
  "👀観戦": ["👀Watching", "👀관전"],
  "✔参加": ["✔Playing", "✔참가"],
  "参加者 {n}人(4人以上で開始できます)": ["{n} players (4 or more needed to start)", "참가자 {n}명 (4명 이상이면 시작할 수 있어요)"],
  "参加にする": ["Join instead", "참가하기"],
  "周の上限 {n}": ["Max rounds {n}", "최대 바퀴 {n}"],
  "観戦者の壁表示：": ["Walls shown to spectators: ", "관전자 벽 표시: "],
  "コインバトル：": ["Coin Battle: ", "코인 배틀: "],
  "ボーナスウォール：": ["Bonus Wall: ", "보너스 월: "],
  "マルチは3人以上そろってから選べます": ["Multi can be chosen when 3 or more people are here", "멀티는 3명 이상 모여야 고를 수 있어요"],
  "人がそろったフロアがありません": ["No floor has enough players", "인원이 모인 플로어가 없어요"],
  "同じ名前の人がいるので、コインバトルは始められません": ["Coin Battle can’t start because two people have the same name", "같은 이름인 사람이 있어서 코인 배틀을 시작할 수 없어요"],
  "コインが消えますが本当にやめますか？": ["Coins will be reset. Turn off Coin Battle?", "코인이 사라지는데 정말 그만둘까요?"],
  "参加者が4人以上必要です": ["4 or more players are needed", "참가자가 4명 이상 필요해요"],

  // --- 壁づくり ---
  "S・G・壁{n}枚を決めてね(壁 {a}/{b})": ["Place S, G and {n} walls (walls {a}/{b})", "S·G·벽 {n}개를 정해 주세요 (벽 {a}/{b})"],
  "出題者が盤面を作っています…": ["The maze maker is building the maze…", "출제자가 미로를 만들고 있어요…"],
  "相手の準備を待っています…": ["Waiting for your opponent…", "상대의 준비를 기다리는 중…"],
  "対戦者が盤面を作っています…": ["The players are building their mazes…", "대전자가 미로를 만들고 있어요…"],
  "決定ずみ!相手が{x}を決めるまで待ってね": ["Done! Wait until your partner sets the {x}", "결정 완료! 상대가 {x} 위치를 정할 때까지 기다려 주세요"],
  "ゴール": ["goal", "골"],
  "スタート": ["start", "스타트"],
  "あなたは{x}担当です。マスをタップして「決定」": ["You place the {x}. Tap a square, then “OK”", "당신은 {x} 담당이에요. 칸을 탭하고 「결정」"],
  "スタート(S)": ["start (S)", "스타트(S)"],
  "ゴール(G)": ["goal (G)", "골(G)"],
  "あなたの番です(壁 {n}/{c})。置きたい場所をタップして「決定」": ["Your turn (walls {n}/{c}). Tap where to place it, then “OK”", "당신 차례예요 (벽 {n}/{c}). 놓을 곳을 탭하고 「결정」"],
  "{p}が壁を置いています(壁 {n}/{c})": ["{p} is placing a wall (walls {n}/{c})", "{p}이 벽을 놓고 있어요 (벽 {n}/{c})"],
  "壁が全部置かれました。「準備完了」を押してね": ["All walls are placed. Tap “Ready”", "벽을 다 놓았어요. 「준비 완료」를 눌러 주세요"],
  "先にマスや壁をタップしてね": ["Tap a square or wall first", "먼저 칸이나 벽을 탭해 주세요"],
  "同じ場所は選べません": ["You can’t choose the same place", "같은 곳은 고를 수 없어요"],
  "ゴールへの道がなくなるので、そこには置けません": ["You can’t place it there because it would block the way to the goal", "골로 가는 길이 없어져서 거기에는 놓을 수 없어요"],
  "S・G・壁の数を確認してね。SからGへ必ず行ける道が必要です": ["Check S, G and the number of walls. There must be a path from S to G", "S·G·벽 개수를 확인해 주세요. S에서 G로 반드시 갈 수 있는 길이 필요해요"],
  "(出題者)": [" (maze maker)", " (출제자)"],
  "{x}準備完了": ["{x} is ready", "{x} 준비 완료"],
  "{x}作成中": ["{x} is building", "{x} 만드는 중"],
  "{x}の壁 {n}/{c}": ["{x}’s walls {n}/{c}", "{x}의 벽 {n}/{c}"],
  "(壁の位置はひみつ)": [" (wall positions are secret)", " (벽 위치는 비밀)"],

  // --- 賭け ---
  "🪙 あなたのコイン:{n}枚": ["🪙 Your coins: {n}", "🪙 내 코인: {n}개"],
  "(0枚なので賭けられません)": [" (you have 0, so you can’t bet)", " (0개라서 걸 수 없어요)"],
  "(1枚賭けます)": [" (bet 1 coin)", " (1개를 걸어요)"],
  "{n}票": ["{n} votes", "{n}표"],
  "賭けられるのは1フロアだけです。": ["You can bet on one floor only. ", "걸 수 있는 건 1플로어뿐이에요. "],
  "全員の壁ができるまで変えられます(誰に賭けたかは見えません)": ["You can change it until all mazes are built (nobody can see who you bet on)", "모두의 벽이 완성될 때까지 바꿀 수 있어요 (누구에게 걸었는지는 안 보여요)"],
  "ゲームが始まるまで変えられます(誰に賭けたかは見えません)": ["You can change it until the game starts (nobody can see who you bet on)", "게임이 시작될 때까지 바꿀 수 있어요 (누구에게 걸었는지는 안 보여요)"],
  "{f}フロアに賭けています(賭けられるのは1フロアだけ)": ["You’ve bet on floor {f} (only one floor allowed)", "{f} 플로어에 걸었어요 (1플로어만 걸 수 있어요)"],
  "🎲 {a} {x}票 / {b} {y}票 / 引き分け {z}票": ["🎲 {a} {x} / {b} {y} / Draw {z}", "🎲 {a} {x}표 / {b} {y}표 / 무승부 {z}표"],
  " ・あなた:": [" · You: ", " · 나: "],

  // --- 大会 ---
  "🏆 優勝 {n}!": ["🏆 Champion: {n}!", "🏆 우승 {n}!"],
  "🏆 優勝 ": ["🏆 Champion: ", "🏆 우승 "],
  "次の試合({n}試合を同時に)": ["Next matches ({n} at the same time)", "다음 경기 ({n}경기 동시에)"],
  "次の試合({r})": ["Next match ({r})", "다음 경기 ({r})"],
  "管理者が大会を終了するのを待っています…": ["Waiting for the host to end the event…", "방장이 대회를 종료하기를 기다리는 중…"],
  "管理者が「開始」を押すのを待っています…": ["Waiting for the host to tap “Start”…", "방장이 「시작」을 누르기를 기다리는 중…"],
  "第{i}/{n}試合が終わりました": ["Match {i}/{n} is over", "제{i}/{n}경기가 끝났어요"],
  "引き分け!勝者を選んでください": ["Draw! Choose the winner", "무승부! 승자를 골라 주세요"],
  "{n}の勝ち": ["{n} wins", "{n} 승리"],
  "{f}フロア 引き分け → 勝者:{w}": ["Floor {f}: draw → winner: {w}", "{f} 플로어 무승부 → 승자: {w}"],
  "選んでください": ["please choose", "골라 주세요"],
  "{f}フロア 引き分け": ["Floor {f}: draw", "{f} 플로어 무승부"],
  "{f}フロア {n}の勝ち": ["Floor {f}: {n} wins", "{f} 플로어 {n} 승리"],
  "全フロアの試合が終わりました": ["All floor matches are over", "모든 플로어 경기가 끝났어요"],
  "第{i}〜{j}/{n}試合が終わりました": ["Matches {i}–{j}/{n} are over", "제{i}~{j}/{n}경기가 끝났어요"],
  "引き分けの勝者を選んでください": ["Choose the winner of the draw", "무승부의 승자를 골라 주세요"],
  "出題者 ": ["Maze maker ", "출제자 "],
  "<br>挑戦者 ": ["<br>Challengers ", "<br>도전자 "],
  "順位": ["Rank", "순위"],
  "名前": ["Name", "이름"],
  "勝-負-分": ["W-L-D", "승-패-무"],
  "出場": ["Played", "출전"],
  "第{i}試合 {f}": ["Match {i} {f}", "제{i}경기 {f}"],
  "第{i}/{n}試合<br>形式を選んでください": ["Match {i}/{n}<br>Choose the format", "제{i}/{n}경기<br>형식을 골라 주세요"],
  "第{i}〜{j}/{n}試合 {f}(同時)": ["Matches {i}–{j}/{n} {f} (at the same time)", "제{i}~{j}/{n}경기 {f} (동시)"],
  "第{i}/{n}試合 {f}": ["Match {i}/{n} {f}", "제{i}/{n}경기 {f}"],
  "管理者が形式を選んでいます…": ["The host is choosing the format…", "방장이 형식을 고르는 중…"],
  "その形式を行う人数が足りません": ["Not enough players for that format", "그 형식을 할 인원이 부족해요"],

  // --- ボーナスウォール ---
  "ボーナスウォールを指定して下さい(あと{t}秒)  緑の壁をタップ": ["Pick a Bonus Wall ({t} sec left)  Tap a green wall", "보너스 월을 지정해 주세요 (남은 {t}초)  초록 벽을 탭"],
  "準備完了!(あと{t}秒)": ["Ready! ({t} sec left)", "준비 완료! (남은 {t}초)"],
  "作成中…(あと{t}秒)": ["Building… ({t} sec left)", "만드는 중… (남은 {t}초)"],
  "{n}(観戦者)ボーナスウォール指定中…": ["{n} (spectator) is picking a Bonus Wall…", "{n} (관전자) 보너스 월 지정 중…"],
  "{n}の盤面": ["{n}’s maze", "{n}의 미로"],
  "{n}のボーナスウォール命中 +2": ["{n}’s Bonus Wall hit +2", "{n}의 보너스 월 명중 +2"],

  // --- 対戦 ---
  "参加者が退出しました": ["A player left", "참가자가 나갔어요"],
  "出題者が退出したので中止しました": ["The maze maker left, so the game was stopped", "출제자가 나가서 중지했어요"],
  "第{n}周": ["Round {n}", "제{n}바퀴"],
  "{n}位 ": ["#{n} ", "{n}위 "],
  "出題者 {n} の勝ち(誰もゴールできず)": ["Maze maker {n} wins (nobody reached the goal)", "출제자 {n} 승리 (아무도 골인 못 함)"],
  "{n}ゴール！！": ["{n} reached the goal!!", "{n} 골인!!"],
  "出題者:{q}  第{r}/{l}周": ["Maze maker: {q}  Round {r}/{l}", "출제자: {q}  제{r}/{l}바퀴"],
  "{n}のターン": ["{n}’s turn", "{n}의 턴"],
  "(残り{n}マス)": [" ({n} squares left)", " (남은 {n}칸)"],
  "出題者 {q}<br>挑戦者 {c}": ["Maze maker {q}<br>Challengers {c}", "출제자 {q}<br>도전자 {c}"],
  "出題者 {q}の勝ち！！": ["Maze maker {q} wins!!", "출제자 {q} 승리!!"],
  "誰もゴールできませんでした": ["Nobody reached the goal", "아무도 골인하지 못했어요"],
  "{n}の勝ち！！": ["{n} wins!!", "{n} 승리!!"],
  "同着！！": ["Tie!!", "동시 골인!!"],
  "Crack a Grid(相手の盤面)": ["Crack a Grid (opponent’s maze)", "Crack a Grid (상대의 미로)"],
  "Design a Grid(自分の盤面)": ["Design a Grid (your maze)", "Design a Grid (나의 미로)"],
  "管理者が「次へ」を押すのを待っています…": ["Waiting for the host to tap “Next”…", "방장이 「다음」을 누르기를 기다리는 중…"],
  "管理者がロビーに戻すのを待っています…": ["Waiting for the host to return to the lobby…", "방장이 로비로 돌아가기를 기다리는 중…"],
  "ほかのフロアが終わるのを待っています(下のボタンで観戦できます)": ["Waiting for the other floors to finish (watch them with the buttons below)", "다른 플로어가 끝나기를 기다리는 중 (아래 버튼으로 관전할 수 있어요)"],
  "{a}先攻！<br>{b}後攻です！": ["{a} goes first!<br>{b} goes second!", "{a} 선공!<br>{b} 후공이에요!"],
  "サドンデス！！！": ["SUDDEN DEATH!!!", "서든데스!!!"],
  "{n}、ゴール出来なかったら負け！": ["{n}, if you don’t reach the goal, you lose!", "{n}, 골인하지 못하면 패배!"],
  "引き分け！！": ["DRAW!!", "무승부!!"],
  "{n}のラストターン！！": ["{n}’s LAST TURN!!", "{n}의 라스트 턴!!"],
  "{n}のターン！！": ["{n}’s TURN!!", "{n}의 턴!!"]
};
export const _DICT = I18N;   // 確かめる道具(tools/check-i18n.mjs)用
