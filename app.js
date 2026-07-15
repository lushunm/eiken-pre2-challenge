/* ===== えいけん準2級チャレンジ！ app.js (v2: 公式形式対応エンジン) ===== */
"use strict";

/* ==================== データ参照 ==================== */
const D_VOCAB    = window.DATA_VOCAB || [];
const D_IDIOMS   = window.DATA_IDIOMS || [];
const D_GRAMMAR  = window.DATA_GRAMMAR || [];
const D_TANBUN   = window.DATA_TANBUN || [];
const D_KAIWABUN = window.DATA_KAIWABUN || [];
const D_LISTEN1  = window.DATA_LISTEN1 || [];
const D_LISTEN2  = window.DATA_LISTEN2 || [];
const D_LISTEN3  = window.DATA_LISTEN3 || [];
const D_READING  = window.DATA_READING || [];
const D_INTERVIEW = window.DATA_INTERVIEW || [];

/* ==================== モード設定 ==================== */
const MODES = {
  vocab:     { name: "たんごクイズ",           n: 10, time: 15 },
  idioms:    { name: "じゅくごクイズ",         n: 10, time: 18 },
  grammar:   { name: "ぶんぽうクイズ",         n: 10, time: 25 },
  tanbun:    { name: "たんぶん（大問1形式）",   n: 10, time: 35 },
  kaiwabun:  { name: "かいわぶん（大問2形式）", n: 8,  time: 45 },
  reading:   { name: "ちょうぶん よみとき",     n: 2,  time: 90 },  // n = パッセージ数
  listen1:   { name: "リスニング第1部",        n: 10, time: 20 },
  listen2:   { name: "リスニング第2部",        n: 10, time: 25 },
  listen3:   { name: "リスニング第3部",        n: 10, time: 25 },
  listenmix: { name: "リスニングミックス",     n: 10, time: 25 },
  review:    { name: "ふくしゅう",             n: 10, time: 40 },
  mock:      { name: "もぎしけん（本番ミニ）",   n: 30, time: 0 },
};

const MOCK_SECTION_NAMES = {
  tanbun: "📝 大問1: たんぶん", kaiwabun: "💬 大問2: かいわぶん",
  listen1: "🎧 リスニング第1部", listen2: "🎧 リスニング第2部", listen3: "🎧 リスニング第3部",
};

const MASCOT_MSGS = [
  "きょうも がんばろう！",
  "コンボを つなげると スコアが アップするよ！",
  "リスニングは 何回でも きけるよ🎧",
  "まちがえても だいじょうぶ！ふくしゅうが だいじ！",
  "レベルアップまで あとすこし かも！？",
  "「ほんばん形式」は 英検と同じ形の問題だよ！",
  "にがてな問題は 💊ふくしゅうモードで たいじしよう！",
  "めんせつの れんしゅうも できるよ🎤",
  "バッジを ぜんぶ あつめられるかな？",
  "まいにち つづけると 🔥れんぞく日数が のびるよ！",
];

/* ==================== ユーティリティ ==================== */
const $ = id => document.getElementById(id);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const sample = (arr, n) => shuffle(arr).slice(0, n);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, n) + "…" : s; }

function todayStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/* ==================== セーブデータ ==================== */
const SAVE_KEY = "eikenPre2v1";
const CORRECT_KEYS = ["vocab", "idioms", "grammar", "tanbun", "kaiwabun", "reading", "listen1", "listen2", "listen3"];
const DEFAULTS = {
  v: 2,
  xp: 0, level: 1, stars: 0, badges: [],
  correct: {},
  totalAnswered: 0, totalCorrect: 0,
  bestCombo: 0, perfects: 0, modes: [], plays: 0,
  streak: 0, lastDay: "", todayDate: "", todayN: 0,
  missionDone: "",
  weak: {},
  mockBest: 0, ivCount: 0,
  calendar: {}, longestStreak: 0,
};
CORRECT_KEYS.forEach(k => (DEFAULTS.correct[k] = 0));

let P = load();

function load() {
  const base = JSON.parse(JSON.stringify(DEFAULTS));
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return base;
    const d = JSON.parse(raw);
    const p = Object.assign(base, d);
    const c = Object.assign({}, DEFAULTS.correct);
    if (d.correct) {
      for (const k of Object.keys(d.correct)) {
        // v1→v2 移行: 旧モード名を新モード名へ
        const nk = k === "convo" ? "listen1" : k === "listen" ? "listen3" : k;
        if (nk in c) c[nk] += d.correct[k] || 0;
      }
    }
    p.correct = c;
    p.weak = d.weak || {};
    p.calendar = d.calendar || {};
    p.longestStreak = Math.max(d.longestStreak || 0, d.streak || 0);
    p.v = 2;
    return p;
  } catch (e) {
    return base;
  }
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(P)); } catch (e) { /* ignore */ }
}

const xpNeed = level => 100 + (level - 1) * 50;
const sumListen = p => (p.correct.listen1 || 0) + (p.correct.listen2 || 0) + (p.correct.listen3 || 0);

/* ==================== がんばりカレンダー ==================== */
// その日の回答数からスタンプの種類を判定（表示時に算出。しきい値は将来変更してもマイグレーション不要）
function stampTier(day) {
  if (!day || !day.n) return null;
  if (day.n >= 30) return "gold";   // 🎯 きょうのミッション達成級
  if (day.n >= 10) return "silver"; // ⭐
  return "bronze";                  // 🌱
}
const STAMP_EMOJI = { bronze: "🌱", silver: "⭐", gold: "🎯" };

function calDay(dateStr) {
  if (!P.calendar[dateStr]) {
    P.calendar[dateStr] = { n: 0, correct: 0, stars: 0, perfect: false, modes: [], badges: [] };
  }
  return P.calendar[dateStr];
}

// ラウンド/めんせつ完了時に、その日の記録へモード・ほし・パーフェクト・新規バッジを反映
function stampDay({ mode, starN = 0, perfect = false, newBadgeIds = [] }) {
  const day = calDay(todayStr());
  if (mode && !day.modes.includes(mode)) day.modes.push(mode);
  day.stars += starN;
  if (perfect) day.perfect = true;
  newBadgeIds.forEach(id => { if (!day.badges.includes(id)) day.badges.push(id); });
}

/* ==================== バッジ ==================== */
const CORE_MODES = ["vocab", "idioms", "grammar", "tanbun", "kaiwabun", "reading", "listen1", "listen2", "listen3", "listenmix"];
const BADGES = [
  { id: "first",     icon: "🐣", name: "はじめのいっぽ",   desc: "はじめてクイズをクリアした", chk: p => p.plays >= 1 },
  { id: "perfect",   icon: "💯", name: "パーフェクト！",   desc: "1回のクイズで ぜんもん せいかい", chk: p => p.perfects >= 1 },
  { id: "combo10",   icon: "🔥", name: "コンボマスター",   desc: "10コンボ たっせい", chk: p => p.bestCombo >= 10 },
  { id: "vocab50",   icon: "📚", name: "たんごはかせ",     desc: "たんご・じゅくごで50もんせいかい", chk: p => (p.correct.vocab || 0) + (p.correct.idioms || 0) >= 50 },
  { id: "grammar50", icon: "👑", name: "ぶんぽうキング",   desc: "ぶんぽうクイズで50もんせいかい", chk: p => (p.correct.grammar || 0) >= 50 },
  { id: "convo30",   icon: "💬", name: "かいわのたつじん", desc: "かいわぶん・第1部で30もんせいかい", chk: p => (p.correct.kaiwabun || 0) + (p.correct.listen1 || 0) >= 30 },
  { id: "listen30",  icon: "🎧", name: "きくのめいじん",   desc: "リスニングで30もんせいかい", chk: p => sumListen(p) >= 30 },
  { id: "allmode",   icon: "🌈", name: "ぜんぶチャレンジ", desc: "6しゅるいのモードであそんだ", chk: p => p.modes.filter(m => CORE_MODES.includes(m)).length >= 6 },
  { id: "level5",    icon: "⭐", name: "レベル5",          desc: "レベル5にとうたつ", chk: p => p.level >= 5 },
  { id: "level10",   icon: "🌟", name: "レベル10",         desc: "レベル10にとうたつ", chk: p => p.level >= 10 },
  { id: "star30",    icon: "✨", name: "スターコレクター", desc: "ほしを30こあつめた", chk: p => p.stars >= 30 },
  { id: "streak3",   icon: "📅", name: "まいにちコツコツ", desc: "3日れんぞくであそんだ", chk: p => p.streak >= 3 },
  { id: "read30",    icon: "📖", name: "よみときはかせ",   desc: "ちょうぶん・たんぶんで30もんせいかい", chk: p => (p.correct.reading || 0) + (p.correct.tanbun || 0) >= 30 },
  { id: "mock1",     icon: "🎖", name: "もぎしけんデビュー", desc: "もぎしけんに ちょうせんした", chk: p => p.modes.includes("mock") },
  { id: "mockA",     icon: "🏆", name: "ごうかくレベル！", desc: "もぎしけんで 8わり いじょう せいかい", chk: p => (p.mockBest || 0) >= 0.8 },
  { id: "iv5",       icon: "🎤", name: "めんせつのたつじん", desc: "めんせつれんしゅうを 5回 クリア", chk: p => (p.ivCount || 0) >= 5 },
  { id: "streak7",     icon: "🔥", name: "1週間コツコツ",     desc: "7日れんぞくであそんだ", chk: p => p.streak >= 7 },
  { id: "streak30",    icon: "🎆", name: "1か月コツコツ",     desc: "30日れんぞくであそんだ", chk: p => p.streak >= 30 },
  { id: "goldstamp10", icon: "🏵", name: "ゴールドスタンプ", desc: "🎯スタンプを10日ぶんためた", chk: p => Object.values(p.calendar || {}).filter(d => d.n >= 30).length >= 10 },
];

/* ==================== サウンド（Web Audio） ==================== */
let actx = null;
function ensureAudio() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) actx = new AC();
  }
  if (actx && actx.state === "suspended") actx.resume();
}
function tone(freq, dur, type = "sine", vol = 0.18, delay = 0, slideTo = null) {
  if (!actx) return;
  const t0 = actx.currentTime + delay;
  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(actx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}
function sClick()  { tone(700, 0.08, "triangle", 0.12); }
function sCorrect(combo) {
  const up = Math.min(combo, 8) * 40;
  tone(660 + up, 0.12, "triangle", 0.2);
  tone(880 + up, 0.18, "triangle", 0.2, 0.09);
}
function sWrong() {
  tone(220, 0.25, "sawtooth", 0.12, 0, 140);
  tone(160, 0.3, "square", 0.08, 0.05);
}
function sStar(i)  { tone(900 + i * 200, 0.25, "triangle", 0.2); }
function sBadge()  { tone(784, 0.12, "triangle", 0.2); tone(988, 0.12, "triangle", 0.2, 0.1); tone(1319, 0.3, "triangle", 0.2, 0.2); }
function sFanfare() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.2, i * 0.12));
  tone(1047, 0.5, "triangle", 0.22, 0.55);
}
function sLevelUp() {
  [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, "triangle", 0.2, i * 0.09));
  tone(1568, 0.6, "triangle", 0.22, 0.58);
}

/* ==================== 音声読み上げ（2話者対応） ==================== */
const hasTTS = "speechSynthesis" in window;
let voiceA = null, voiceB = null;
function pickVoices() {
  if (!hasTTS) return;
  const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  if (!vs.length) return;
  const us = vs.filter(v => /en[-_]US/i.test(v.lang));
  const pool = us.length ? us : vs;
  const preferred = pool.filter(v => /Google|Natural|Online|Premium/i.test(v.name));
  voiceA = preferred[0] || pool[0] || null;
  const others = pool.filter(v => v !== voiceA);
  const prefB = others.filter(v => /Google|Natural|Online|Premium/i.test(v.name));
  voiceB = prefB[0] || others[0] || null;
}
if (hasTTS) {
  pickVoices();
  speechSynthesis.onvoiceschanged = pickVoices;
}

let speakToken = 0;
function cancelSpeech() {
  speakToken++;
  if (hasTTS) speechSynthesis.cancel();
}

function speak(text, rate = 0.92, onend = null, speaker = "A") {
  if (!hasTTS) { if (onend) onend(); return; }
  cancelSpeech();
  const my = speakToken;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  const v = speaker === "B" ? (voiceB || voiceA) : voiceA;
  if (v) u.voice = v;
  u.pitch = speaker === "B" && !voiceB ? 0.8 : 1.05;
  u.rate = rate;
  u.onend = () => { if (my === speakToken && onend) onend(); };
  u.onerror = () => { if (my === speakToken && onend) onend(); };
  speechSynthesis.speak(u);
}

// 会話スクリプト [[話者, セリフ], ...] を順番に再生
function playScript(lines, ondone, rate = 0.92) {
  if (!hasTTS) { if (ondone) ondone(); return; }
  cancelSpeech();
  const my = speakToken;
  let i = 0;
  const step = () => {
    if (my !== speakToken) return;         // キャンセルされた
    if (i >= lines.length) { if (ondone) ondone(); return; }
    const [sp, text] = lines[i++];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    const v = sp === "B" ? (voiceB || voiceA) : voiceA;
    if (v) u.voice = v;
    u.pitch = sp === "B" && !voiceB ? 0.8 : sp === "B" ? 1.0 : 1.05;
    u.rate = rate;
    u.onend = step;
    u.onerror = step;
    speechSynthesis.speak(u);
  };
  step();
}

/* ==================== エフェクト（パーティクル） ==================== */
const fx = $("fx");
const fctx = fx.getContext("2d");
let parts = [];
let fxOn = false;
const FX_COLORS = ["#ff6fa5", "#ffb84d", "#4fd08a", "#4fb8ff", "#a98cff", "#ffd43b", "#ff8787"];

function resizeFx() { fx.width = innerWidth; fx.height = innerHeight; }
addEventListener("resize", resizeFx);
resizeFx();

function burst(x, y, n = 20) {
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = 2.5 + Math.random() * 5;
    parts.push({
      x, y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2.5,
      g: 0.16, life: 46 + Math.random() * 22, age: 0,
      r: 3 + Math.random() * 4, rot: 0, vr: 0,
      color: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)],
      shape: Math.random() < 0.3 ? "star" : "circle",
    });
  }
  runFx();
}
function confetti(n = 130) {
  for (let i = 0; i < n; i++) {
    parts.push({
      x: Math.random() * fx.width, y: -20 - Math.random() * fx.height * 0.4,
      vx: (Math.random() - 0.5) * 2.4, vy: 2 + Math.random() * 3.2,
      g: 0.03, life: 190 + Math.random() * 70, age: 0,
      r: 0, w: 7 + Math.random() * 5, h: 10 + Math.random() * 6,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25,
      color: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)],
      shape: "rect",
    });
  }
  runFx();
}
function runFx() {
  if (fxOn) return;
  fxOn = true;
  requestAnimationFrame(stepFx);
}
function stepFx() {
  fctx.clearRect(0, 0, fx.width, fx.height);
  for (const p of parts) {
    p.age++;
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    fctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    fctx.fillStyle = p.color;
    if (p.shape === "rect") {
      fctx.save();
      fctx.translate(p.x, p.y);
      fctx.rotate(p.rot);
      fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * (0.4 + 0.6 * Math.abs(Math.sin(p.age * 0.1))));
      fctx.restore();
    } else if (p.shape === "star") {
      fctx.save();
      fctx.translate(p.x, p.y);
      fctx.rotate(p.age * 0.1);
      fctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a1 = (k * 2 * Math.PI) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        fctx.lineTo(Math.cos(a1) * p.r * 2, Math.sin(a1) * p.r * 2);
        fctx.lineTo(Math.cos(a2) * p.r, Math.sin(a2) * p.r);
      }
      fctx.closePath();
      fctx.fill();
      fctx.restore();
    } else {
      fctx.beginPath();
      fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fctx.fill();
    }
  }
  fctx.globalAlpha = 1;
  parts = parts.filter(p => p.age < p.life && p.y < fx.height + 40);
  if (parts.length) requestAnimationFrame(stepFx);
  else { fxOn = false; fctx.clearRect(0, 0, fx.width, fx.height); }
}

function floatPts(x, y, text) {
  const el = document.createElement("div");
  el.className = "float-pts";
  el.textContent = text;
  el.style.left = x - 20 + "px";
  el.style.top = y - 30 + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}

/* ==================== トースト ==================== */
const toastQueue = [];
let toastBusy = false;
function toast(msg) {
  toastQueue.push(msg);
  pumpToast();
}
function pumpToast() {
  if (toastBusy || !toastQueue.length) return;
  toastBusy = true;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = toastQueue.shift();
  $("toast-area").appendChild(el);
  sBadge();
  setTimeout(() => {
    el.remove();
    toastBusy = false;
    pumpToast();
  }, 2900);
}

/* ==================== 画面切りかえ ==================== */
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo(0, 0);
}

/* ==================== ブラウザ履歴（戻るボタン対応） ==================== */
/* history.state = { scr: 画面ID, depth: ホームからの深さ } を唯一の情報源とする。
   サブ画面へは push、quiz→result 等の置き換えは replace。
   「ホームへ」系の操作は navHome() が履歴を巻き戻し、popstate が表示を行う。 */
function navPush(scr) {
  const d = (history.state && history.state.depth || 0) + 1;
  history.pushState({ scr, depth: d }, "");
}
function navReplace(scr) {
  history.replaceState({ scr, depth: (history.state && history.state.depth) || 0 }, "");
}
function navHome() {
  const d = (history.state && history.state.depth) || 0;
  if (d > 0) history.go(-d);
  else { renderHome(); show("scr-home"); }
}

window.addEventListener("popstate", e => {
  const st = e.state || { scr: "scr-home", depth: 0 };
  // 進行中のラウンド・面接・音声を安全に停止（冪等）
  stopTimer();
  clearTimeout(autoNextId);
  clearTimeout(speakDelayId);
  cancelSpeech();
  R = null;
  IV = null;
  $("levelup").classList.add("hidden");
  let target = st.scr;
  // 進行状態が必要な画面は復元できないのでホームに差し替え
  if (target === "scr-quiz" || target === "scr-result" || target === "scr-interview") {
    target = "scr-home";
    history.replaceState({ scr: "scr-home", depth: st.depth }, "");
  }
  if (target === "scr-home") renderHome();
  else if (target === "scr-badges") renderBadges();
  else if (target === "scr-words") renderWords();
  else if (target === "scr-calendar") renderCalendar();
  show(target);
});

/* ==================== 問題ビルダー ==================== */
/* 正規化された問題オブジェクト:
   { srcId, modeKey, time, sub, main, blank, passage, script, listen,
     speakOnShow, speakOnReveal, answer, choices, reveal, expl } */

function buildVocabQ(item) {
  const e2j = Math.random() < 0.5;
  // 本番と同じく、まちがい選択肢は同じ品詞から選ぶ（足りなければ全体から）
  // 同じ単語の別品詞エントリは正解になり得るため除外する
  let others = D_VOCAB.filter(v => v.id !== item.id && v.w !== item.w && v.pos === item.pos && v.ja !== item.ja);
  if (others.length < 3) others = D_VOCAB.filter(v => v.id !== item.id && v.w !== item.w && v.ja !== item.ja);
  if (e2j) {
    return {
      srcId: item.id, modeKey: "vocab", time: MODES.vocab.time,
      sub: "この たんごの いみは？", main: item.w, blank: false,
      speakOnShow: item.w, speakOnReveal: null,
      answer: item.ja, choices: shuffle([item.ja, ...sample(others, 3).map(v => v.ja)]),
      reveal: `${item.w}【${item.pos}】= ${item.ja}`, expl: "",
    };
  }
  return {
    srcId: item.id, modeKey: "vocab", time: MODES.vocab.time,
    sub: "この いみの えいごは？", main: item.ja, blank: false,
    speakOnShow: null, speakOnReveal: item.w,
    answer: item.w, choices: shuffle([item.w, ...sample(others, 3).map(v => v.w)]),
    reveal: `${item.w}【${item.pos}】= ${item.ja}`, expl: "",
  };
}

function buildIdiomQ(item) {
  const e2j = Math.random() < 0.5;
  const others = D_IDIOMS.filter(v => v.id !== item.id);
  const exSpeak = item.ex || null;
  if (e2j) {
    return {
      srcId: item.id, modeKey: "idioms", time: MODES.idioms.time,
      sub: "この じゅくごの いみは？", main: item.w, blank: false,
      speakOnShow: exSpeak, speakOnReveal: null,
      answer: item.ja, choices: shuffle([item.ja, ...sample(others, 3).map(v => v.ja)]),
      reveal: `${item.w} = ${item.ja}\n例: ${item.ex}`, expl: "",
    };
  }
  return {
    srcId: item.id, modeKey: "idioms", time: MODES.idioms.time,
    sub: "この いみの じゅくごは？", main: item.ja, blank: false,
    speakOnShow: null, speakOnReveal: exSpeak,
    answer: item.w, choices: shuffle([item.w, ...sample(others, 3).map(v => v.w)]),
    reveal: `${item.w} = ${item.ja}\n例: ${item.ex}`, expl: "",
  };
}

function buildGrammarQ(item) {
  return {
    srcId: item.id, modeKey: "grammar", time: MODES.grammar.time,
    sub: `___ に入るのは どれかな？（${item.topic}）`, main: item.q, blank: true,
    speakOnShow: null, speakOnReveal: item.q.replace("___", item.a),
    answer: item.a, choices: shuffle([item.a, ...item.d]),
    reveal: item.q.replace("___", item.a), expl: item.e,
  };
}

function buildTanbunQ(item) {
  return {
    srcId: item.id, modeKey: "tanbun", time: MODES.tanbun.time,
    sub: "文に合う ことばを えらぼう（大問1形式）", main: item.q, blank: true,
    speakOnShow: null, speakOnReveal: item.q.replace("___", item.a),
    answer: item.a, choices: shuffle([item.a, ...item.d]),
    reveal: `${item.q.replace("___", item.a)}\n訳: ${item.ja}`, expl: item.e,
  };
}

function buildKaiwabunQ(item) {
  return {
    srcId: item.id, modeKey: "kaiwabun", time: MODES.kaiwabun.time,
    sub: "(　　　) に入る セリフは どれかな？（大問2形式）",
    main: item.lines.join("\n"), blank: false,
    speakOnShow: null, speakOnReveal: item.a,
    answer: item.a, choices: shuffle([item.a, ...item.d]),
    reveal: item.lines.join("\n").replace("(　　　)", "「" + item.a + "」"), expl: item.e,
  };
}

function buildListen1Q(item) {
  return {
    srcId: item.id, modeKey: "listen1", time: MODES.listen1.time,
    sub: "つづきの へんじとして いちばん いいのは？（第1部）",
    main: "", blank: false, listen: true, script: item.script,
    speakOnReveal: item.a,
    answer: item.a, choices: shuffle([item.a, ...item.d]),
    reveal: scriptText(item.script) + `\n→ こたえ: ${item.a}`, expl: item.e,
  };
}

function buildListen2Q(item) {
  const script = item.script.concat([["Q", item.q]]);
  return {
    srcId: item.id, modeKey: "listen2", time: MODES.listen2.time,
    sub: "かいわを きいて しつもんに こたえよう（第2部）",
    main: "Q: " + item.q, blank: false, listen: true, script,
    speakOnReveal: null,
    answer: item.a, choices: shuffle([item.a, ...item.d]),
    reveal: scriptText(item.script) + `\nQ: ${item.q}\n→ こたえ: ${item.a}`, expl: item.e,
  };
}

function buildListen3Q(item) {
  const script = [["A", item.passage], ["Q", item.q]];
  return {
    srcId: item.id, modeKey: "listen3", time: MODES.listen3.time,
    sub: "おはなしを きいて しつもんに こたえよう（第3部）",
    main: "Q: " + item.q, blank: false, listen: true, script,
    speakOnReveal: null,
    answer: item.a, choices: shuffle([item.a, ...item.d]),
    reveal: `${item.passage}\nQ: ${item.q}\n→ こたえ: ${item.a}`, expl: item.e,
  };
}

function scriptText(script) {
  return script.map(([sp, t]) => (sp === "Q" ? "Q: " : sp + ": ") + t).join("\n");
}

function buildReadingQ(r, qi) {
  const sq = r.qs[qi];
  return {
    srcId: `${r.id}::${qi}`, modeKey: "reading", time: MODES.reading.time,
    sub: `「${r.title}」を よんで こたえよう（${qi + 1}/${r.qs.length}）`,
    main: "Q: " + sq.q, blank: false, passage: r.passage,
    speakOnShow: null, speakOnReveal: null,
    answer: sq.a, choices: shuffle([sq.a, ...sq.d]),
    reveal: sq.a, expl: sq.e,
  };
}

/* --- レジストリ（ふくしゅうモード用: id → ビルダー＋表示情報） --- */
const REG = {};
function regAll() {
  D_VOCAB.forEach(it => (REG[it.id] = { build: () => buildVocabQ(it), label: it.w, info: it.ja, speakText: it.w, kind: "たんご" }));
  D_IDIOMS.forEach(it => (REG[it.id] = { build: () => buildIdiomQ(it), label: it.w, info: it.ja, speakText: it.w.replace(/〜/g, ""), kind: "じゅくご" }));
  D_GRAMMAR.forEach(it => (REG[it.id] = { build: () => buildGrammarQ(it), label: trunc(it.q, 34), info: it.topic, speakText: it.q.replace("___", it.a), kind: "ぶんぽう" }));
  D_TANBUN.forEach(it => (REG[it.id] = { build: () => buildTanbunQ(it), label: trunc(it.q, 34), info: "たんぶん", speakText: it.q.replace("___", it.a), kind: "たんぶん" }));
  D_KAIWABUN.forEach(it => (REG[it.id] = { build: () => buildKaiwabunQ(it), label: trunc(it.a, 34), info: "かいわぶん", speakText: it.a, kind: "かいわぶん" }));
  D_LISTEN1.forEach(it => (REG[it.id] = { build: () => buildListen1Q(it), label: trunc(it.a, 34), info: "リスニング第1部", speakText: it.a, kind: "リスニング" }));
  D_LISTEN2.forEach(it => (REG[it.id] = { build: () => buildListen2Q(it), label: trunc(it.q, 34), info: "リスニング第2部", speakText: it.a, kind: "リスニング" }));
  D_LISTEN3.forEach(it => (REG[it.id] = { build: () => buildListen3Q(it), label: trunc(it.q, 34), info: "リスニング第3部", speakText: it.a, kind: "リスニング" }));
  D_READING.forEach(r => r.qs.forEach((sq, i) => (REG[`${r.id}::${i}`] = { build: () => buildReadingQ(r, i), label: trunc(sq.q, 34), info: `ちょうぶん「${r.title}」`, speakText: sq.a, kind: "ちょうぶん" })));
}

/* ==================== ラウンド構築 ==================== */
function buildRound(mode) {
  switch (mode) {
    case "vocab":    return sample(D_VOCAB, MODES.vocab.n).map(buildVocabQ);
    case "idioms":   return sample(D_IDIOMS, MODES.idioms.n).map(buildIdiomQ);
    case "grammar":  return sample(D_GRAMMAR, MODES.grammar.n).map(buildGrammarQ);
    case "tanbun":   return sample(D_TANBUN, MODES.tanbun.n).map(buildTanbunQ);
    case "kaiwabun": return sample(D_KAIWABUN, MODES.kaiwabun.n).map(buildKaiwabunQ);
    case "reading": {
      const qs = [];
      sample(D_READING, MODES.reading.n).forEach(r => r.qs.forEach((_, i) => qs.push(buildReadingQ(r, i))));
      return qs;
    }
    case "listen1":  return sample(D_LISTEN1, MODES.listen1.n).map(buildListen1Q);
    case "listen2":  return sample(D_LISTEN2, MODES.listen2.n).map(buildListen2Q);
    case "listen3":  return sample(D_LISTEN3, MODES.listen3.n).map(buildListen3Q);
    case "listenmix": {
      const pool = [
        ...D_LISTEN1.map(it => () => buildListen1Q(it)),
        ...D_LISTEN2.map(it => () => buildListen2Q(it)),
        ...D_LISTEN3.map(it => () => buildListen3Q(it)),
      ];
      return sample(pool, MODES.listenmix.n).map(f => f());
    }
    case "review": {
      const ids = Object.keys(P.weak).filter(id => REG[id]);
      return sample(ids, MODES.review.n).map(id => {
        const q = REG[id].build();
        q.time = Math.max(q.time, 30);
        return q;
      });
    }
    case "mock":
      // 本番の縮小セット: 大問1×10 → 大問2×5 → リスニング第1部×5 → 第2部×5 → 第3部×5
      return [].concat(
        sample(D_TANBUN, 10).map(buildTanbunQ),
        sample(D_KAIWABUN, 5).map(buildKaiwabunQ),
        sample(D_LISTEN1, 5).map(buildListen1Q),
        sample(D_LISTEN2, 5).map(buildListen2Q),
        sample(D_LISTEN3, 5).map(buildListen3Q)
      );
  }
  return [];
}

/* ==================== クイズ本体 ==================== */
let R = null;
let timerId = null;
let autoNextId = null;
let speakDelayId = null;

function startRound(mode) {
  ensureAudio();
  sClick();
  if (mode === "review" && !Object.keys(P.weak).filter(id => REG[id]).length) {
    toast("💮 にがてな もんだいは ないよ！すごい！");
    return;
  }
  const qs = buildRound(mode);
  if (!qs.length) { toast("もんだいの じゅんびちゅう だよ"); return; }
  R = {
    mode, qs,
    i: 0, score: 0, correct: 0, combo: 0, maxCombo: 0,
    locked: false, timerStarted: false, curTime: qs[0].time,
    wrongs: [],
  };
  // リトライ（結果画面から）は履歴を置き換え、home/リスニング選択からは積む
  if (history.state && history.state.scr === "scr-result") navReplace("scr-quiz");
  else navPush("scr-quiz");
  show("scr-quiz");
  renderQuestion();
}

function renderDots() {
  const wrap = $("dots");
  wrap.innerHTML = "";
  R.qs.forEach((q, idx) => {
    const d = document.createElement("span");
    d.className = "dot" + (idx === R.i ? " cur" : "") +
      (q.result === true ? " ok" : q.result === false ? " ng" : "");
    wrap.appendChild(d);
  });
}

function renderQuestion() {
  const q = R.qs[R.i];
  // もぎしけん: セクションが変わったらお知らせ
  if (R.mode === "mock" && (R.i === 0 || q.modeKey !== R.qs[R.i - 1].modeKey)) {
    const label = MOCK_SECTION_NAMES[q.modeKey];
    if (label) toast(label + " スタート！");
  }
  R.locked = false;
  R.timerStarted = false;
  R.curTime = q.time;
  $("qnum").textContent = `${R.i + 1} / ${R.qs.length}`;
  $("score").textContent = R.score;
  $("q-sub").textContent = q.sub;
  $("feedback").classList.add("hidden");
  $("quiz-card").classList.remove("shake");
  $("listen-state").classList.add("hidden");

  // コンボ表示
  const cb = $("combo");
  if (R.combo >= 2) {
    cb.textContent = `🔥 ${R.combo} コンボ！`;
    cb.classList.add("show");
  } else {
    cb.classList.remove("show");
  }

  // パッセージ（長文）
  const pc = $("passage-card");
  if (q.passage) {
    $("passage").textContent = q.passage;
    pc.classList.remove("hidden");
  } else {
    pc.classList.add("hidden");
  }

  // 問題文
  const qm = $("q-main");
  qm.classList.remove("speakable");
  qm.onclick = null;
  if (q.listen && !q.main) {
    qm.innerHTML = `<span class="big-ear">🎧</span>`;
  } else if (q.blank) {
    qm.innerHTML = esc(q.main).replace("___", `<span class="blank">___</span>`);
  } else {
    qm.textContent = q.main;
  }
  if (q.speakOnShow && !q.listen) {
    qm.classList.add("speakable");
    qm.title = "タップすると きこえるよ";
    qm.onclick = () => speak(q.speakOnShow);
  }

  // 再生ボタン
  const rp = $("btn-replay");
  if (q.script) {
    rp.classList.remove("hidden");
    rp.onclick = () => { sClick(); playCurrentScript(); };
  } else {
    rp.classList.add("hidden");
  }

  // 選択肢
  const ch = $("choices");
  ch.innerHTML = "";
  q.choices.forEach((c, idx) => {
    const b = document.createElement("button");
    b.className = "choice";
    b.innerHTML = `<span class="cnum">${idx + 1}</span><span>${esc(c)}</span>`;
    b.onclick = ev => answer(idx, ev);
    ch.appendChild(b);
  });

  renderDots();

  clearTimeout(speakDelayId);
  const bar = $("timebar");
  bar.classList.remove("low");
  bar.style.width = "100%";

  if (q.script) {
    // リスニング: 音声のあとにタイマー開始
    if (hasTTS) {
      $("listen-state").classList.remove("hidden");
      speakDelayId = setTimeout(playCurrentScript, 450);
    } else {
      // 音声が使えない端末: スクリプトを表示して解けるように
      qm.textContent = scriptText(q.script);
      toast("🔇 この端末は音声が使えないので 文字で表示するよ");
      startTimer();
    }
  } else {
    if (q.speakOnShow) speakDelayId = setTimeout(() => speak(q.speakOnShow), 400);
    startTimer();
  }
}

let listenWatchdogId = null;
function playCurrentScript() {
  if (!R) return;
  const q = R.qs[R.i];
  if (!q || !q.script) return;
  $("listen-state").classList.remove("hidden");
  const done = () => {
    clearTimeout(listenWatchdogId);
    $("listen-state").classList.add("hidden");
    if (R && !R.locked && !R.timerStarted) startTimer();
  };
  playScript(q.script, done);
  // 端末によっては onend が発火しないことがあるため、読み上げ想定時間で必ずタイマーを開始する
  const chars = q.script.reduce((s, [, t]) => s + t.length, 0);
  clearTimeout(listenWatchdogId);
  listenWatchdogId = setTimeout(done, Math.min(45000, 4000 + chars * 95));
}

/* --- タイマー --- */
function startTimer() {
  stopTimer();
  if (!R) return;
  R.timerStarted = true;
  R.timeLeft = R.curTime;
  const bar = $("timebar");
  bar.classList.remove("low");
  bar.style.width = "100%";
  timerId = setInterval(() => {
    R.timeLeft -= 0.1;
    const pct = Math.max(0, (R.timeLeft / R.curTime) * 100);
    bar.style.width = pct + "%";
    bar.classList.toggle("low", pct < 30);
    if (R.timeLeft <= 0) {
      stopTimer();
      answer(-1, null);
    }
  }, 100);
}
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

/* --- 苦手トラッキング --- */
function markWrong(q) {
  if (!q.srcId) return;
  P.weak[q.srcId] = (P.weak[q.srcId] || 0) + 1;
}
function markRight(q) {
  if (!q.srcId || !P.weak[q.srcId]) return;
  P.weak[q.srcId]--;
  if (P.weak[q.srcId] <= 0) delete P.weak[q.srcId];
}

/* --- 解答処理 --- */
function answer(idx, ev) {
  if (!R || R.locked) return;
  R.locked = true;
  stopTimer();
  clearTimeout(speakDelayId);
  cancelSpeech();

  const q = R.qs[R.i];
  const chosen = idx >= 0 ? q.choices[idx] : null;
  const ok = chosen === q.answer;
  q.result = ok;

  const btns = $("choices").children;
  for (let i = 0; i < btns.length; i++) {
    btns[i].disabled = true;
    if (q.choices[i] === q.answer) btns[i].classList.add("right");
    else if (i === idx) btns[i].classList.add("wrong");
    else btns[i].classList.add("dim");
  }
  $("listen-state").classList.add("hidden");

  P.totalAnswered++;
  bumpToday(ok);

  if (ok) {
    R.combo++;
    R.maxCombo = Math.max(R.maxCombo, R.combo);
    R.correct++;
    P.totalCorrect++;
    P.correct[q.modeKey] = (P.correct[q.modeKey] || 0) + 1;
    markRight(q);

    const comboBonus = Math.min(R.combo - 1, 9) * 20;
    const tl = R.timerStarted ? Math.max(0, R.timeLeft) : R.curTime;
    const timeBonus = Math.round((tl / R.curTime) * 50);
    const pts = 100 + comboBonus + timeBonus;
    R.score += pts;
    $("score").textContent = R.score;

    let x = innerWidth / 2, y = innerHeight / 2;
    if (ev && ev.target) {
      const r = ev.target.closest(".choice").getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    burst(x, y, 18 + Math.min(R.combo * 3, 24));
    floatPts(x, y, `+${pts}`);
    sCorrect(R.combo);

    const cb = $("combo");
    if (R.combo >= 2) {
      cb.textContent = `🔥 ${R.combo} コンボ！`;
      cb.classList.add("show");
      cb.classList.remove("bump");
      void cb.offsetWidth;
      cb.classList.add("bump");
    }

    if (q.speakOnReveal) setTimeout(() => speak(q.speakOnReveal), 350);
    else if (q.modeKey === "vocab" && q.speakOnShow) setTimeout(() => speak(q.speakOnShow), 350);

    showFeedback(true, q);
    const wait = q.expl ? 2800 : q.listen ? 2400 : 1400;
    clearTimeout(autoNextId);
    autoNextId = setTimeout(nextQ, wait);
  } else {
    R.combo = 0;
    R.wrongs.push(q);
    markWrong(q);
    sWrong();
    $("quiz-card").classList.add("shake");
    $("combo").classList.remove("show");
    showFeedback(false, q, idx < 0);
  }
  save();
  renderDots();
}

function showFeedback(ok, q, timeUp = false) {
  const fb = $("feedback");
  fb.classList.remove("hidden");
  fb.classList.toggle("bad", !ok);
  $("fb-head").textContent = ok
    ? ["⭕ せいかい！", "🎉 すごい！", "✨ そのちょうし！", "💪 やるね！"][Math.floor(Math.random() * 4)]
    : timeUp ? "⏰ じかんぎれ！" : "❌ ざんねん…";
  let body = "";
  if (!ok || q.expl || q.listen) {
    body = `こたえ：<span class="ans">${esc(q.reveal)}</span>`;
    if (q.expl) body += `\n💡 ${esc(q.expl)}`;
  }
  $("fb-body").innerHTML = body;
  $("btn-next").onclick = () => {
    clearTimeout(autoNextId);
    sClick();
    nextQ();
  };
}

function nextQ() {
  clearTimeout(autoNextId);
  if (!R) return;
  if (R.i + 1 >= R.qs.length) {
    finishRound();
  } else {
    R.i++;
    renderQuestion();
  }
}

function quitRound() {
  stopTimer();
  clearTimeout(autoNextId);
  clearTimeout(speakDelayId);
  cancelSpeech();
  R = null;
  navHome();
}

/* --- きょうのぶん・れんぞく --- */
function bumpToday(ok) {
  const t = todayStr();
  if (P.todayDate !== t) { P.todayDate = t; P.todayN = 0; }
  P.todayN++;
  const day = calDay(t);
  day.n++;
  if (ok) day.correct++;
  if (P.todayN === 30 && P.missionDone !== t) {
    P.missionDone = t;
    P.stars += 3;
    toast("🎯 きょうのミッションたっせい！ ⭐+3");
  }
}
function bumpStreak() {
  const t = todayStr();
  if (P.lastDay === t) return;
  P.streak = P.lastDay === todayStr(-1) ? (P.streak || 0) + 1 : 1;
  P.lastDay = t;
  P.longestStreak = Math.max(P.longestStreak || 0, P.streak);
}

/* ==================== 結果画面 ==================== */
function finishRound() {
  stopTimer();
  cancelSpeech();
  const total = R.qs.length;
  const c = R.correct;
  const ratio = c / total;
  const rank = ratio >= 1 ? "S" : ratio >= 0.8 ? "A" : ratio >= 0.6 ? "B" : "C";
  const starN = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.5 ? 1 : 0;
  const gainedXp = Math.max(5, Math.round(R.score / 10));

  P.plays++;
  P.stars += starN;
  P.bestCombo = Math.max(P.bestCombo, R.maxCombo);
  if (c >= total) P.perfects++;
  if (!P.modes.includes(R.mode)) P.modes.push(R.mode);
  if (R.mode === "mock") P.mockBest = Math.max(P.mockBest || 0, ratio);
  bumpStreak();

  let levelsGained = 0;
  P.xp += gainedXp;
  while (P.xp >= xpNeed(P.level)) {
    P.xp -= xpNeed(P.level);
    P.level++;
    levelsGained++;
  }

  const newBadges = BADGES.filter(b => !P.badges.includes(b.id) && b.chk(P));
  newBadges.forEach(b => P.badges.push(b.id));
  stampDay({ mode: R.mode, starN, perfect: c >= total, newBadgeIds: newBadges.map(b => b.id) });
  save();

  navReplace("scr-result");   // 終わったクイズには「戻る」で戻れないようにする
  show("scr-result");
  const rk = $("rank");
  rk.textContent = rank;
  rk.className = "rank r-" + rank;
  $("res-correct").textContent = `${c}/${total}`;
  $("res-combo").textContent = R.maxCombo;
  $("res-xp").textContent = gainedXp;
  $("res-score").textContent = "0";

  document.querySelectorAll("#res-stars .star").forEach(s => s.classList.remove("on"));
  $("res-xp-fill").style.width = "0%";
  $("res-xp-text").textContent = `Lv.${P.level}  ${P.xp} / ${xpNeed(P.level)} XP`;

  const rvCard = $("review-card");
  const rvList = $("review-list");
  rvList.innerHTML = "";
  if (R.wrongs.length) {
    rvCard.classList.remove("hidden");
    R.wrongs.forEach(q => {
      const li = document.createElement("li");
      const head = q.listen ? "🎧 きこえた英文" : q.main || q.sub;
      li.innerHTML = `${esc(trunc(head, 90))}\n<span class="rv-ans">→ ${esc(q.reveal)}</span>` +
        (q.expl ? `\n💡 ${esc(q.expl)}` : "") +
        `\n<span class="rv-id">もんだいID: ${esc(q.srcId || "-")}</span>`;
      rvList.appendChild(li);
    });
  } else {
    rvCard.classList.add("hidden");
  }

  const finalScore = R.score;
  setTimeout(() => {
    rk.classList.add("show");
    if (rank === "S" || rank === "A") { confetti(rank === "S" ? 160 : 100); sFanfare(); }
    else sCorrect(1);
  }, 350);

  const starEls = document.querySelectorAll("#res-stars .star");
  for (let i = 0; i < starN; i++) {
    setTimeout(() => {
      starEls[i].classList.add("on");
      sStar(i);
    }, 1000 + i * 420);
  }

  setTimeout(() => {
    const dur = 900;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      $("res-score").textContent = Math.round(finalScore * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }, 800);

  setTimeout(() => {
    $("res-xp-fill").style.width = Math.min(100, (P.xp / xpNeed(P.level)) * 100) + "%";
  }, 1600);

  if (levelsGained > 0) {
    setTimeout(() => {
      $("lv-new").textContent = P.level;
      $("levelup").classList.remove("hidden");
      sLevelUp();
      confetti(140);
    }, 2300);
  }

  setTimeout(() => {
    newBadges.forEach(b => toast(`🏅 バッジゲット！ ${b.icon} ${b.name}`));
  }, levelsGained > 0 ? 3000 : 2200);

  const mode = R.mode;
  $("btn-retry").onclick = () => startRound(mode);
  R = null;
}

/* ==================== ホーム ==================== */
function renderHome() {
  $("lv").textContent = P.level;
  const need = xpNeed(P.level);
  $("xp-fill").style.width = Math.min(100, (P.xp / need) * 100) + "%";
  $("xp-text").textContent = `${P.xp} / ${need} XP`;
  $("stat-stars").textContent = P.stars;
  $("stat-streak").textContent = P.streak;
  $("stat-badges").textContent = P.badges.length + "/" + BADGES.length;
  const longestEl = $("stat-longest");
  if (longestEl) longestEl.textContent = P.longestStreak || 0;

  const t = todayStr();
  const n = P.todayDate === t ? P.todayN : 0;
  $("mission-fill").style.width = Math.min(100, (n / 30) * 100) + "%";
  $("mission-text").textContent = n >= 30 ? "たっせい！🎉" : `${n} / 30`;

  $("mascot-msg").textContent = pick(MASCOT_MSGS);
}

/* ==================== バッジ画面 ==================== */
function renderBadges() {
  const grid = $("badge-grid");
  grid.innerHTML = "";
  BADGES.forEach(b => {
    const got = P.badges.includes(b.id);
    const div = document.createElement("div");
    div.className = "badge-item " + (got ? "got" : "locked");
    div.innerHTML = `<div class="bicon">${got ? b.icon : "🔒"}</div>
      <div class="bname">${esc(b.name)}</div>
      <div class="bdesc">${esc(b.desc)}</div>`;
    grid.appendChild(div);
  });
}

/* ==================== がんばりカレンダー ==================== */
const MODE_LABELS = {
  vocab: "たんご", idioms: "じゅくご", grammar: "ぶんぽう", tanbun: "たんぶん", kaiwabun: "かいわぶん",
  reading: "ちょうぶん", listen1: "リスニング第1部", listen2: "リスニング第2部", listen3: "リスニング第3部",
  listenmix: "リスニングMIX", review: "ふくしゅう", mock: "もぎしけん", interview: "めんせつ",
};

const CAL = { year: 0, month: 0, selected: null }; // month: 0-11

function calKey(y, m, d) { return `${y}-${m + 1}-${d}`; }

function calGoToday() {
  const now = new Date();
  CAL.year = now.getFullYear();
  CAL.month = now.getMonth();
  CAL.selected = null;
}

function renderCalendar() {
  if (!CAL.year) calGoToday();
  const now = new Date();
  $("cal-streak").textContent = P.streak;
  $("cal-longest").textContent = P.longestStreak || 0;
  $("cal-info").textContent = `${CAL.year}年 ${CAL.month + 1}月`;

  const isCurrentMonth = CAL.year === now.getFullYear() && CAL.month === now.getMonth();
  $("cal-next").disabled = isCurrentMonth;

  const first = new Date(CAL.year, CAL.month, 1);
  const daysInMonth = new Date(CAL.year, CAL.month + 1, 0).getDate();
  const startDow = first.getDay();

  const grid = $("cal-grid");
  grid.innerHTML = "";
  ["日", "月", "火", "水", "木", "金", "土"].forEach(d => {
    const el = document.createElement("div");
    el.className = "cal-dow";
    el.textContent = d;
    grid.appendChild(el);
  });
  for (let i = 0; i < startDow; i++) {
    const el = document.createElement("div");
    el.className = "cal-cell empty";
    grid.appendChild(el);
  }
  const todayKey = todayStr();
  for (let d = 1; d <= daysInMonth; d++) {
    const key = calKey(CAL.year, CAL.month, d);
    const day = P.calendar[key];
    const tier = stampTier(day);
    const cell = document.createElement("div");
    cell.className = "cal-cell" + (key === todayKey ? " today" : "") + (tier ? " has-stamp" : "");
    cell.dataset.key = key;
    cell.innerHTML = `<span class="cal-date">${d}</span>` +
      (tier ? `<span class="cal-stamp">${STAMP_EMOJI[tier]}</span>` : "") +
      (day && day.perfect ? `<span class="cal-dot cal-dot-perfect">💯</span>` : "") +
      (day && day.badges.length ? `<span class="cal-dot cal-dot-badge">🏅</span>` : "");
    cell.onclick = () => { sClick(); selectCalDay(key); };
    grid.appendChild(cell);
  }
  if (CAL.selected) selectCalDay(CAL.selected);
  else $("cal-detail").classList.add("hidden");
}

function selectCalDay(key) {
  CAL.selected = key;
  document.querySelectorAll(".cal-cell[data-key]").forEach(c => c.classList.toggle("selected", c.dataset.key === key));
  const day = P.calendar[key];
  const det = $("cal-detail");
  det.classList.remove("hidden");
  const [, m, d] = key.split("-").map(Number);
  if (!day || !day.n) {
    det.innerHTML = `<b>${m}月${d}日</b><br>この日は おやすみ だったよ。`;
    return;
  }
  const modeNames = day.modes.map(mk => MODE_LABELS[mk] || mk).join("・") || "-";
  const badgeNames = day.badges.map(id => {
    const b = BADGES.find(x => x.id === id);
    return b ? `${b.icon}${b.name}` : id;
  }).join("、");
  det.innerHTML = `<b>${m}月${d}日</b><br>` +
    `もんだい ${day.n}もん（せいかい ${day.correct}）<br>` +
    `あそんだモード: ${esc(modeNames)}` +
    (day.perfect ? `<br>💯 パーフェクトラウンドあり！` : "") +
    (day.badges.length ? `<br>🏅 かくとくバッジ: ${esc(badgeNames)}` : "");
}

function calPrevMonth() {
  CAL.month--;
  if (CAL.month < 0) { CAL.month = 11; CAL.year--; }
  CAL.selected = null;
  renderCalendar();
}
function calNextMonth() {
  const now = new Date();
  if (CAL.year === now.getFullYear() && CAL.month === now.getMonth()) return;
  CAL.month++;
  if (CAL.month > 11) { CAL.month = 0; CAL.year++; }
  CAL.selected = null;
  renderCalendar();
}

/* ==================== たんごちょう ==================== */
const WB = { tab: "vocab", page: 0, q: "" };
const WB_PAGE = 40;

function wbList() {
  if (WB.tab === "vocab") {
    return D_VOCAB.map(v => ({ en: v.w, ja: v.ja, pos: v.pos, ex: null, speak: v.w }));
  }
  if (WB.tab === "idioms") {
    return D_IDIOMS.map(v => ({ en: v.w, ja: v.ja, pos: "熟", ex: v.ex, speak: v.w.replace(/〜/g, "") }));
  }
  // にがてリスト
  return Object.keys(P.weak)
    .filter(id => REG[id])
    .sort((a, b) => P.weak[b] - P.weak[a])
    .map(id => {
      const r = REG[id];
      return { en: r.label, ja: r.info, pos: r.kind, ex: null, speak: r.speakText, ng: P.weak[id] };
    });
}

function renderWords() {
  const all = wbList();
  const q = WB.q.trim().toLowerCase();
  const list = q
    ? all.filter(it => it.en.toLowerCase().includes(q) || (it.ja || "").toLowerCase().includes(q))
    : all;
  const pages = Math.max(1, Math.ceil(list.length / WB_PAGE));
  if (WB.page >= pages) WB.page = pages - 1;
  const slice = list.slice(WB.page * WB_PAGE, (WB.page + 1) * WB_PAGE);

  const grid = $("word-grid");
  grid.innerHTML = "";
  if (!slice.length) {
    const p = document.createElement("p");
    p.className = "page-note";
    p.style.gridColumn = "1 / -1";
    p.textContent = WB.tab === "weak" ? "💮 にがては ないよ！すごい！" : "みつからなかったよ…";
    grid.appendChild(p);
  }
  slice.forEach(it => {
    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML =
      `<span class="wpos">${esc(it.pos || "")}</span>` +
      `<div class="wen">${esc(it.en)}</div>` +
      `<div class="wja">${esc(it.ja || "")}</div>` +
      (it.ex ? `<div class="wex">${esc(it.ex)}</div>` : "") +
      (it.ng ? `<span class="wng">まちがい ×${it.ng}</span>` : "");
    card.onclick = () => {
      ensureAudio();
      sClick();
      document.querySelectorAll(".word-card.speaking").forEach(c => c.classList.remove("speaking"));
      card.classList.add("speaking");
      speak(it.speak, 0.85, () => card.classList.remove("speaking"));
      setTimeout(() => card.classList.remove("speaking"), 4000);
    };
    grid.appendChild(card);
  });

  $("pg-info").textContent = `${WB.page + 1} / ${pages}`;
  $("pg-prev").disabled = WB.page <= 0;
  $("pg-next").disabled = WB.page >= pages - 1;
}

/* ==================== めんせつ ==================== */
let IV = null;

function startInterview() {
  ensureAudio();
  sClick();
  if (!D_INTERVIEW.length) { toast("じゅんびちゅう だよ"); return; }
  IV = { set: pick(D_INTERVIEW), step: 0 };
  navPush("scr-interview");
  show("scr-interview");
  renderIv();
}

function renderIv() {
  const s = IV.set;
  const nq = s.qs.length;
  $("iv-title").textContent = s.title;
  $("iv-passage").textContent = s.passage;
  const inst = $("iv-instruction");
  const qEl = $("iv-question");
  const mEl = $("iv-model");
  const bL = $("btn-iv-listen");
  const bM = $("btn-iv-model");
  const bN = $("btn-iv-next");
  qEl.classList.add("hidden");
  mEl.classList.add("hidden");
  bL.classList.add("hidden");
  bM.classList.add("hidden");

  if (IV.step === 0) {
    $("iv-progress").textContent = "もくどく";
    inst.classList.remove("hidden");
    inst.textContent = "📖 まずは 20びょうくらい もくどく（だまって読む）してみよう。\nわからない単語が あっても だいじょうぶ！";
    bN.textContent = "よめたよ ▶";
  } else if (IV.step === 1) {
    $("iv-progress").textContent = "おんどく";
    inst.classList.remove("hidden");
    inst.textContent = "🗣 こんどは こえに出して よんでみよう！\nほんばんでは タイトルから よむよ。🔊で おてほんが きけるよ。";
    bL.classList.remove("hidden");
    bL.textContent = "🔊 おてほんを きく";
    bL.onclick = () => { sClick(); speak(s.title + ". " + s.passage, 0.82); };
    bN.textContent = "よめたよ ▶";
  } else {
    const qi = IV.step - 2;
    const qd = s.qs[qi];
    $("iv-progress").textContent = `しつもん ${qi + 1} / ${nq}`;
    inst.classList.remove("hidden");
    inst.textContent = "🎤 しつもんに こえに出して 答えてみよう。答えたら モデルかいとうと くらべてね！";
    qEl.classList.remove("hidden");
    qEl.textContent = `No.${qi + 1}  ${qd.q}`;
    bL.classList.remove("hidden");
    bL.textContent = "🔊 しつもんを きく";
    bL.onclick = () => { sClick(); speak(qd.q, 0.88); };
    bM.classList.remove("hidden");
    bM.onclick = () => {
      sClick();
      mEl.classList.remove("hidden");
      mEl.innerHTML = `<b>モデルかいとう:</b>\n${esc(qd.model)}` + (qd.jhint ? `\n\n💡 ${esc(qd.jhint)}` : "");
      speak(qd.model, 0.9);
    };
    bN.textContent = qi + 1 >= nq ? "おわる 🎉" : "つぎへ ▶";
    setTimeout(() => speak(qd.q, 0.88), 500);
  }

  bN.onclick = () => {
    sClick();
    cancelSpeech();
    if (IV.step - 2 + 1 >= nq && IV.step >= 2) {
      finishInterview();
    } else {
      IV.step++;
      renderIv();
    }
  };
}

function finishInterview() {
  cancelSpeech();
  const gained = 30;
  P.xp += gained;
  let leveled = false;
  while (P.xp >= xpNeed(P.level)) {
    P.xp -= xpNeed(P.level);
    P.level++;
    leveled = true;
  }
  P.plays++;
  P.ivCount = (P.ivCount || 0) + 1;
  if (!P.modes.includes("interview")) P.modes.push("interview");
  bumpStreak();
  const newBadges = BADGES.filter(b => !P.badges.includes(b.id) && b.chk(P));
  newBadges.forEach(b => P.badges.push(b.id));
  stampDay({ mode: "interview", newBadgeIds: newBadges.map(b => b.id) });
  save();
  IV = null;
  navHome();
  confetti(90);
  sFanfare();
  toast(`🎤 めんせつれんしゅう クリア！ 💎XP +${gained}`);
  if (leveled) {
    setTimeout(() => {
      $("lv-new").textContent = P.level;
      $("levelup").classList.remove("hidden");
      sLevelUp();
    }, 1200);
  }
  setTimeout(() => newBadges.forEach(b => toast(`🏅 バッジゲット！ ${b.icon} ${b.name}`)), 1800);
}

function quitInterview() {
  cancelSpeech();
  IV = null;
  navHome();
}

/* ==================== 初期化 ==================== */
function decorate() {
  const title = $("title");
  const text = title.textContent;
  title.innerHTML = [...text].map((ch, i) =>
    `<span class="tchar" style="animation-delay:${i * 0.09}s">${esc(ch)}</span>`).join("");

  const deco = $("deco");
  const emojis = ["☁️", "⭐", "🌈", "✨", "🎈", "☁️", "⭐", "🫧"];
  emojis.forEach((e, i) => {
    const s = document.createElement("span");
    s.className = "deco-item";
    s.textContent = e;
    s.style.left = (5 + (i * 12.3) % 90) + "%";
    s.style.top = (8 + (i * 23.7) % 84) + "%";
    s.style.animationDelay = (i * 0.7) + "s";
    s.style.animationDuration = (5 + (i % 3) * 1.5) + "s";
    deco.appendChild(s);
  });
}

function goHome() {
  sClick();
  navHome();
}

function init() {
  regAll();
  decorate();
  renderHome();
  history.replaceState({ scr: "scr-home", depth: 0 }, "");

  document.querySelectorAll(".mode-btn[data-mode]").forEach(b => {
    b.addEventListener("click", () => startRound(b.dataset.mode));
  });
  document.querySelectorAll(".lpick-btn[data-mode]").forEach(b => {
    b.addEventListener("click", () => startRound(b.dataset.mode));
  });

  $("btn-lpick").onclick = () => { ensureAudio(); sClick(); navPush("scr-lpick"); show("scr-lpick"); };
  $("btn-mock").onclick = () => startRound("mock");
  $("btn-lpick-back").onclick = goHome;
  $("btn-interview").onclick = startInterview;
  $("btn-iv-quit").onclick = () => { sClick(); quitInterview(); };

  $("btn-quit").onclick = () => { sClick(); quitRound(); };
  $("btn-home").onclick = goHome;
  $("btn-badges").onclick = () => { ensureAudio(); sClick(); renderBadges(); navPush("scr-badges"); show("scr-badges"); };
  $("btn-badges-back").onclick = goHome;
  $("btn-words").onclick = () => {
    ensureAudio(); sClick();
    WB.page = 0;
    renderWords();
    navPush("scr-words");
    show("scr-words");
  };
  $("btn-words-back").onclick = goHome;
  $("btn-calendar").onclick = () => {
    ensureAudio(); sClick();
    calGoToday();
    renderCalendar();
    navPush("scr-calendar");
    show("scr-calendar");
  };
  $("btn-calendar-back").onclick = goHome;
  $("cal-prev").onclick = () => { sClick(); calPrevMonth(); };
  $("cal-next").onclick = () => { sClick(); calNextMonth(); };
  $("lv-ok").onclick = () => { sClick(); $("levelup").classList.add("hidden"); };

  document.querySelectorAll(".tab-btn").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(x => x.classList.remove("on"));
      b.classList.add("on");
      WB.tab = b.dataset.tab;
      WB.page = 0;
      sClick();
      renderWords();
    });
  });
  $("word-search").addEventListener("input", e => {
    WB.q = e.target.value;
    WB.page = 0;
    renderWords();
  });
  $("pg-prev").onclick = () => { if (WB.page > 0) { WB.page--; sClick(); renderWords(); } };
  $("pg-next").onclick = () => { WB.page++; sClick(); renderWords(); };

  $("mascot").addEventListener("click", () => {
    ensureAudio();
    sClick();
    const m = $("mascot");
    m.style.transform = "scale(1.25) rotate(10deg)";
    setTimeout(() => (m.style.transform = ""), 250);
    $("mascot-msg").textContent = pick(MASCOT_MSGS);
    burst(m.getBoundingClientRect().left + 30, m.getBoundingClientRect().top + 30, 12);
  });

  initPwa();
}

/* ==================== PWA（オフライン対応・インストール） ==================== */
let deferredInstall = null;

function initPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* file://等では無視 */ });
  }
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredInstall = e;
    $("btn-install").classList.remove("hidden");
  });
  $("btn-install").onclick = async () => {
    if (!deferredInstall) return;
    sClick();
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    $("btn-install").classList.add("hidden");
  };
  window.addEventListener("appinstalled", () => {
    deferredInstall = null;
    $("btn-install").classList.add("hidden");
    toast("📲 インストール かんりょう！ホームがめんから あそべるよ");
  });
}

init();
