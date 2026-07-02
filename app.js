/* ===== えいけん準2級チャレンジ！ app.js ===== */
"use strict";

/* ==================== 問題データ ==================== */

// 単語（英検準2級レベル）: [英語, 日本語]
const VOCAB = [
  ["environment", "環境（かんきょう）"],
  ["experience", "経験（けいけん）"],
  ["opportunity", "機会（きかい）・チャンス"],
  ["increase", "ふえる・ふやす"],
  ["reduce", "へらす"],
  ["decide", "決める（きめる）"],
  ["arrive", "とうちゃくする"],
  ["borrow", "借りる（かりる）"],
  ["lend", "貸す（かす）"],
  ["invite", "しょうたいする"],
  ["receive", "受け取る（うけとる）"],
  ["prepare", "じゅんびする"],
  ["promise", "約束する（やくそくする）"],
  ["share", "分け合う（わけあう）"],
  ["save", "救う（すくう）・ためる"],
  ["spend", "（お金や時間を）使う"],
  ["improve", "よくする・上達する"],
  ["protect", "守る（まもる）"],
  ["produce", "生産する（せいさんする）"],
  ["provide", "あたえる・ていきょうする"],
  ["collect", "集める（あつめる）"],
  ["explain", "説明する（せつめいする）"],
  ["express", "表現する（ひょうげんする）"],
  ["imagine", "想像する（そうぞうする）"],
  ["continue", "続ける（つづける）"],
  ["finally", "ついに・最後に"],
  ["probably", "たぶん"],
  ["recently", "最近（さいきん）"],
  ["suddenly", "とつぜん"],
  ["actually", "実は（じつは）"],
  ["foreign", "外国の（がいこくの）"],
  ["favorite", "いちばん好きな"],
  ["healthy", "けんこうによい"],
  ["dangerous", "きけんな"],
  ["expensive", "（ねだんが）高い"],
  ["cheap", "（ねだんが）安い"],
  ["famous", "有名な（ゆうめいな）"],
  ["difficult", "むずかしい"],
  ["similar", "にている"],
  ["different", "ちがった・べつの"],
  ["important", "重要な（じゅうような）"],
  ["necessary", "必要な（ひつような）"],
  ["popular", "人気のある（にんきのある）"],
  ["comfortable", "かいてきな・気持ちいい"],
  ["convenient", "便利な（べんりな）"],
  ["traditional", "でんとうてきな"],
  ["international", "国際的な（こくさいてきな）"],
  ["professional", "プロの"],
  ["delicious", "とてもおいしい"],
  ["nervous", "きんちょうしている"],
  ["ceremony", "式（しき）・セレモニー"],
  ["century", "世紀（せいき）・100年"],
  ["custom", "（国や地域の）習慣（しゅうかん）"],
  ["distance", "きょり"],
  ["effort", "努力（どりょく）"],
  ["purpose", "目的（もくてき）"],
  ["reason", "理由（りゆう）"],
  ["result", "結果（けっか）"],
  ["skill", "うでまえ・技術（ぎじゅつ）"],
  ["habit", "（自分の）くせ・習慣"],
  ["neighbor", "近所の人（きんじょのひと）"],
  ["passenger", "乗客（じょうきゃく）"],
  ["tourist", "観光客（かんこうきゃく）"],
  ["vacation", "休暇（きゅうか）・休み"],
];

// 文法: q（___ が空所）, a=正解, d=まちがい選択肢, e=かいせつ
const GRAMMAR = [
  { q: "I enjoy ___ soccer with my friends.", a: "playing", d: ["play", "played", "to play"],
    e: "enjoy のあとは 〜ing（動名詞）！「enjoy 〜ing」で「〜して楽しむ」だよ。" },
  { q: "She has lived in Osaka ___ 2020.", a: "since", d: ["for", "from", "at"],
    e: "since 2020 =「2020年から（ずっと）」。has lived（現在完了）といっしょに使うよ。" },
  { q: "Math is ___ than English for me.", a: "more difficult", d: ["difficult", "most difficult", "difficulter"],
    e: "difficult のような長い単語は more をつけてくらべるよ。" },
  { q: "I want something cold ___.", a: "to drink", d: ["drink", "drinking", "drank"],
    e: "something cold to drink =「何かつめたい飲み物」。to +動詞で「〜するための」という意味になるよ。" },
  { q: "This letter was ___ by my grandmother.", a: "written", d: ["write", "wrote", "writing"],
    e: "was + written（過去分詞）で「書かれた」という受け身になるよ。" },
  { q: "If it ___ tomorrow, we will stay home.", a: "rains", d: ["will rain", "rained", "raining"],
    e: "if のなか（条件）は、未来のことでも現在形を使うよ。" },
  { q: "I have a friend ___ can speak three languages.", a: "who", d: ["which", "what", "whose"],
    e: "人について説明するときは who を使うよ（関係代名詞）。" },
  { q: "My sister is good ___ singing.", a: "at", d: ["in", "on", "for"],
    e: "be good at 〜ing =「〜が得意（とくい）」。" },
  { q: "Ken stopped ___ TV and did his homework.", a: "watching", d: ["watch", "to watch", "watched"],
    e: "stop 〜ing =「〜するのをやめる」。" },
  { q: "I'm looking forward to ___ you soon.", a: "seeing", d: ["see", "saw", "be seen"],
    e: "look forward to 〜ing =「〜を楽しみにする」。この to のあとは 〜ing！" },
  { q: "This is the ___ movie I have ever watched.", a: "best", d: ["good", "better", "well"],
    e: "the best =「いちばんよい」。最上級（さいじょうきゅう）だよ。" },
  { q: "Our teacher told us ___ quiet.", a: "to be", d: ["be", "being", "been"],
    e: "tell 人 to 〜 =「人に〜するように言う」。" },
  { q: "Yuki is ___ tall as her mother.", a: "as", d: ["so", "more", "much"],
    e: "as 〜 as ... =「...と同じくらい〜」。" },
  { q: "I have never ___ to a foreign country.", a: "been", d: ["go", "went", "being"],
    e: "have been to 〜 =「〜へ行ったことがある」。never で「一度もない」。" },
  { q: "The news made me ___.", a: "happy", d: ["happily", "happiness", "to happy"],
    e: "make 人 + 形容詞 =「人を〜（な気持ち）にする」。だから happy！" },
  { q: "Do you know where ___?", a: "he lives", d: ["does he live", "lives he", "is he live"],
    e: "文のなかの疑問文（間接疑問）は「where + ふつうの語順」になるよ。" },
  { q: "It is important ___ us to eat breakfast.", a: "for", d: ["of", "to", "with"],
    e: "It is ... for 人 to 〜 =「人にとって〜することは...だ」。" },
  { q: "I was ___ tired to walk.", a: "too", d: ["so", "very", "much"],
    e: "too ... to 〜 =「...すぎて〜できない」。" },
  { q: "The boy ___ over there is my brother.", a: "standing", d: ["stand", "stood", "stands"],
    e: "standing over there =「あそこに立っている」。〜ing で名詞を説明できるよ。" },
  { q: "I don't know what ___ next.", a: "to do", d: ["do", "doing", "did"],
    e: "what to do =「何をすべきか」。" },
  { q: "She left the room without ___ goodbye.", a: "saying", d: ["say", "said", "to say"],
    e: "without 〜ing =「〜しないで」。前置詞のあとは 〜ing だよ。" },
  { q: "___ you like some more tea?", a: "Would", d: ["Will", "Are", "Do"],
    e: "Would you like 〜? =「〜はいかがですか」。ていねいな言い方だよ。" },
  { q: "My father has ___ finished dinner.", a: "already", d: ["yet", "still", "ever"],
    e: "already =「もう（〜した）」。have + already + 過去分詞。" },
  { q: "I wish I ___ fly like a bird.", a: "could", d: ["can", "will", "may"],
    e: "I wish I could 〜 =「〜できたらいいのに」。願いごとは could を使うよ。" },
];

// 会話: aLine=Aさんのセリフ, a=正しいへんじ, d=まちがい, e=かいせつ
const CONVO = [
  { aLine: "I'm sorry I'm late.", a: "That's all right.", d: ["Yes, please.", "Me, too.", "Good job."],
    e: "「おくれてごめんね」→ That's all right.（だいじょうぶだよ）" },
  { aLine: "Would you like another piece of cake?", a: "No, thank you. I'm full.", d: ["Yes, it is.", "Here you are.", "That's too bad."],
    e: "おなかいっぱいのときは No, thank you.（いいえ、けっこうです）" },
  { aLine: "How was your trip to Okinawa?", a: "It was great!", d: ["You're welcome.", "See you soon.", "It's mine."],
    e: "How was 〜? =「〜はどうだった？」→ 感想（かんそう）を答えるよ。" },
  { aLine: "Hello. May I speak to Mr. Brown, please?", a: "Speaking.", d: ["I'm home.", "You, too.", "It's over there."],
    e: "電話で「私です」は Speaking. と言うよ。" },
  { aLine: "What's wrong? You look pale.", a: "I have a headache.", d: ["That sounds fun.", "Nice to meet you.", "Sure, go ahead."],
    e: "What's wrong? =「どうしたの？」→ ぐあいを答えるよ。headache =頭痛（ずつう）。" },
  { aLine: "Could you pass me the salt?", a: "Here you are.", d: ["I'm afraid so.", "Never mind.", "Long time no see."],
    e: "物をわたすときは Here you are.（はい、どうぞ）" },
  { aLine: "Thank you so much for helping me.", a: "My pleasure.", d: ["That's mine.", "I hope so.", "Excuse me."],
    e: "お礼を言われたら My pleasure.（どういたしまして）" },
  { aLine: "Shall we go to the movies this weekend?", a: "Sounds good!", d: ["I ate it.", "It was sunny.", "You did it."],
    e: "さそわれて OK のときは Sounds good!（いいね！）" },
  { aLine: "Excuse me. How can I get to the station?", a: "Take the No. 3 bus.", d: ["At seven o'clock.", "Three times.", "It's 500 yen."],
    e: "How can I get to 〜? =「〜へはどう行けばいい？」→ 行き方を答えるよ。" },
  { aLine: "Guess what! I passed the test!", a: "Congratulations!", d: ["That's too bad.", "Take care.", "Calm down."],
    e: "うれしい知らせには Congratulations!（おめでとう！）" },
  { aLine: "Can I borrow your eraser?", a: "Sure, here you are.", d: ["Yes, I can.", "No, I'm not.", "It's raining."],
    e: "Can I 〜? と聞かれたら Sure（いいよ）などで答えるよ。" },
  { aLine: "How often do you practice the piano?", a: "Twice a week.", d: ["For two hours.", "Two years ago.", "By bus."],
    e: "How often =「どのくらいよく（回数）」→ Twice a week（週2回）。" },
];

// リスニング: en=読み上げる英文, ja=正しい意味
const LISTEN = [
  { en: "I went shopping with my mother yesterday.", ja: "きのう、お母さんと買い物に行きました" },
  { en: "It will be rainy tomorrow.", ja: "あしたは雨がふるでしょう" },
  { en: "My favorite subject is science.", ja: "いちばん好きな教科は理科です" },
  { en: "Can you help me with my homework?", ja: "宿題（しゅくだい）を手伝ってくれる？" },
  { en: "The library opens at nine.", ja: "図書館は9時に開きます" },
  { en: "I have been to Kyoto twice.", ja: "京都に2回行ったことがあります" },
  { en: "She is the fastest runner in our class.", ja: "彼女はクラスでいちばん足が速いです" },
  { en: "Don't forget to bring your lunch.", ja: "お弁当を持ってくるのをわすれないでね" },
  { en: "I'm going to visit my grandfather next Sunday.", ja: "今度の日曜日におじいちゃんに会いに行く予定です" },
  { en: "This cake was made by my sister.", ja: "このケーキはお姉ちゃんが作りました" },
  { en: "He practices soccer every day after school.", ja: "彼は毎日、放課後にサッカーを練習します" },
  { en: "May I open the window?", ja: "まどを開けてもいいですか？" },
  { en: "I was reading a book when you called me.", ja: "電話をくれたとき、本を読んでいました" },
  { en: "There are many famous places in this city.", ja: "この町には有名な場所がたくさんあります" },
  { en: "Studying English is fun for me.", ja: "英語を勉強することは私にとって楽しいです" },
  { en: "If you are free, let's play games together.", ja: "ひまなら、いっしょにゲームをしよう" },
];

// バッジ
const BADGES = [
  { id: "first",     icon: "🐣", name: "はじめのいっぽ",   desc: "はじめてクイズをクリアした", chk: p => p.plays >= 1 },
  { id: "perfect",   icon: "💯", name: "パーフェクト！",   desc: "10もん ぜんもん せいかい", chk: p => p.perfects >= 1 },
  { id: "combo10",   icon: "🔥", name: "コンボマスター",   desc: "10コンボ たっせい", chk: p => p.bestCombo >= 10 },
  { id: "vocab50",   icon: "📚", name: "たんごはかせ",     desc: "たんごクイズで50もんせいかい", chk: p => p.correct.vocab >= 50 },
  { id: "grammar50", icon: "👑", name: "ぶんぽうキング",   desc: "ぶんぽうクイズで50もんせいかい", chk: p => p.correct.grammar >= 50 },
  { id: "convo30",   icon: "💬", name: "かいわのたつじん", desc: "かいわクイズで30もんせいかい", chk: p => p.correct.convo >= 30 },
  { id: "listen30",  icon: "🎧", name: "きくのめいじん",   desc: "リスニングで30もんせいかい", chk: p => p.correct.listen >= 30 },
  { id: "allmode",   icon: "🌈", name: "ぜんぶチャレンジ", desc: "4つのモードをぜんぶあそんだ", chk: p => p.modes.length >= 4 },
  { id: "level5",    icon: "⭐", name: "レベル5",          desc: "レベル5にとうたつ", chk: p => p.level >= 5 },
  { id: "level10",   icon: "🌟", name: "レベル10",         desc: "レベル10にとうたつ", chk: p => p.level >= 10 },
  { id: "star30",    icon: "✨", name: "スターコレクター", desc: "ほしを30こあつめた", chk: p => p.stars >= 30 },
  { id: "streak3",   icon: "📅", name: "まいにちコツコツ", desc: "3日れんぞくであそんだ", chk: p => p.streak >= 3 },
];

const MODES = {
  vocab:   { name: "たんごクイズ",   time: 12 },
  grammar: { name: "ぶんぽうクイズ", time: 20 },
  convo:   { name: "かいわクイズ",   time: 20 },
  listen:  { name: "リスニング",     time: 25 },
};

const MASCOT_MSGS = [
  "きょうも がんばろう！",
  "コンボを つなげると スコアが アップするよ！",
  "リスニングは 何回でも きけるよ🎧",
  "まちがえても だいじょうぶ！ふくしゅうが だいじ！",
  "レベルアップまで あとすこし かも！？",
  "たんごちょうで はつおんの れんしゅうも できるよ！",
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

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function todayStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/* ==================== セーブデータ ==================== */

const SAVE_KEY = "eikenPre2v1";
const DEFAULTS = {
  xp: 0, level: 1, stars: 0, badges: [],
  correct: { vocab: 0, grammar: 0, convo: 0, listen: 0 },
  totalAnswered: 0, totalCorrect: 0,
  bestCombo: 0, perfects: 0, modes: [], plays: 0,
  streak: 0, lastDay: "", todayDate: "", todayN: 0,
  missionDone: "",
};

let P = load();

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
    const d = JSON.parse(raw);
    const p = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), d);
    p.correct = Object.assign({ vocab: 0, grammar: 0, convo: 0, listen: 0 }, d.correct || {});
    return p;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(P)); } catch (e) { /* ignore */ }
}

const xpNeed = level => 100 + (level - 1) * 50;

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

/* ==================== 音声読み上げ ==================== */

let enVoice = null;
function pickVoice() {
  if (!("speechSynthesis" in window)) return;
  const vs = speechSynthesis.getVoices();
  enVoice =
    vs.find(v => /en[-_]US/i.test(v.lang) && /Google|Natural|Online/i.test(v.name)) ||
    vs.find(v => /en[-_]US/i.test(v.lang)) ||
    vs.find(v => /^en/i.test(v.lang)) || null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text, rate = 0.92, onend = null) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  if (enVoice) u.voice = enVoice;
  u.rate = rate;
  u.pitch = 1.05;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
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
    const alpha = Math.max(0, 1 - p.age / p.life);
    fctx.globalAlpha = alpha;
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

/* ==================== ホーム ==================== */

function renderHome() {
  $("lv").textContent = P.level;
  const need = xpNeed(P.level);
  $("xp-fill").style.width = Math.min(100, (P.xp / need) * 100) + "%";
  $("xp-text").textContent = `${P.xp} / ${need} XP`;
  $("stat-stars").textContent = P.stars;
  $("stat-streak").textContent = P.streak;
  $("stat-badges").textContent = P.badges.length;

  const t = todayStr();
  const n = P.todayDate === t ? P.todayN : 0;
  $("mission-fill").style.width = Math.min(100, (n / 30) * 100) + "%";
  $("mission-text").textContent = n >= 30 ? "たっせい！🎉" : `${n} / 30`;

  $("mascot-msg").textContent = MASCOT_MSGS[Math.floor(Math.random() * MASCOT_MSGS.length)];
}

/* ==================== クイズ本体 ==================== */

let R = null;          // ラウンド状態
let timerId = null;
let autoNextId = null;
let speakDelayId = null;

function buildQuestions(mode) {
  if (mode === "vocab") {
    return sample(VOCAB, 10).map(([w, m]) => {
      const e2j = Math.random() < 0.5;
      const others = VOCAB.filter(v => v[0] !== w);
      if (e2j) {
        const ds = sample(others, 3).map(v => v[1]);
        return {
          mode, sub: "この たんごの いみは？", main: w, blank: false,
          speakOnShow: w, speakOnReveal: null, answer: m,
          choices: shuffle([m, ...ds]),
          reveal: `${w} = ${m}`, expl: "",
        };
      } else {
        const ds = sample(others, 3).map(v => v[0]);
        return {
          mode, sub: "この いみの えいごは？", main: m, blank: false,
          speakOnShow: null, speakOnReveal: w, answer: w,
          choices: shuffle([w, ...ds]),
          reveal: `${w} = ${m}`, expl: "",
        };
      }
    });
  }
  if (mode === "grammar") {
    return sample(GRAMMAR, 10).map(g => ({
      mode, sub: "___ に入るのは どれかな？", main: g.q, blank: true,
      speakOnShow: null, speakOnReveal: g.q.replace("___", g.a), answer: g.a,
      choices: shuffle([g.a, ...g.d]),
      reveal: g.q.replace("___", g.a), expl: g.e,
    }));
  }
  if (mode === "convo") {
    return sample(CONVO, 10).map(c => ({
      mode, sub: "🅱 さんは なんて いうかな？", main: `A: ${c.aLine}\nB: ___`, blank: true,
      speakOnShow: c.aLine, speakOnReveal: c.a, answer: c.a,
      choices: shuffle([c.a, ...c.d]),
      reveal: `A: ${c.aLine}\nB: ${c.a}`, expl: c.e,
    }));
  }
  // listen
  return sample(LISTEN, 10).map(item => {
    const ds = sample(LISTEN.filter(x => x !== item), 3).map(x => x.ja);
    return {
      mode, sub: "なんて 言ったかな？ よくきいてね", main: "", blank: false,
      listen: true, speakOnShow: item.en, speakOnReveal: null, answer: item.ja,
      choices: shuffle([item.ja, ...ds]),
      reveal: `"${item.en}"\n＝「${item.ja}」`, expl: "",
    };
  });
}

function startRound(mode) {
  ensureAudio();
  sClick();
  R = {
    mode,
    qs: buildQuestions(mode),
    i: 0, score: 0, correct: 0, combo: 0, maxCombo: 0,
    locked: false,
    wrongs: [],
    timeMax: MODES[mode].time,
    timeLeft: MODES[mode].time,
  };
  show("scr-quiz");
  renderDots();
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
  R.locked = false;
  $("qnum").textContent = `${R.i + 1} / ${R.qs.length}`;
  $("score").textContent = R.score;
  $("q-sub").textContent = q.sub;
  $("feedback").classList.add("hidden");
  $("quiz-card").classList.remove("shake");

  // コンボ表示
  const cb = $("combo");
  if (R.combo >= 2) {
    cb.textContent = `🔥 ${R.combo} コンボ！`;
    cb.classList.add("show");
  } else {
    cb.classList.remove("show");
  }

  // 問題文
  const qm = $("q-main");
  qm.classList.remove("speakable");
  qm.onclick = null;
  if (q.listen) {
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

  // きく ボタン（リスニング・かいわ）
  const rp = $("btn-replay");
  if (q.speakOnShow && (q.listen || q.mode === "convo")) {
    rp.classList.remove("hidden");
    rp.onclick = () => { sClick(); speak(q.speakOnShow); };
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

  // 自動読み上げ
  clearTimeout(speakDelayId);
  if (q.speakOnShow) speakDelayId = setTimeout(() => speak(q.speakOnShow), 400);

  startTimer();
}

/* --- タイマー --- */
function startTimer() {
  stopTimer();
  R.timeLeft = R.timeMax;
  const bar = $("timebar");
  bar.classList.remove("low");
  bar.style.width = "100%";
  timerId = setInterval(() => {
    R.timeLeft -= 0.1;
    const pct = Math.max(0, (R.timeLeft / R.timeMax) * 100);
    bar.style.width = pct + "%";
    bar.classList.toggle("low", pct < 30);
    if (R.timeLeft <= 0) {
      stopTimer();
      answer(-1, null); // 時間切れ
    }
  }, 100);
}
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

/* --- 解答処理 --- */
function answer(idx, ev) {
  if (!R || R.locked) return;
  R.locked = true;
  stopTimer();
  clearTimeout(speakDelayId);
  if ("speechSynthesis" in window) speechSynthesis.cancel();

  const q = R.qs[R.i];
  const chosen = idx >= 0 ? q.choices[idx] : null;
  const ok = chosen === q.answer;
  q.result = ok;

  // ボタンの見た目
  const btns = $("choices").children;
  for (let i = 0; i < btns.length; i++) {
    btns[i].disabled = true;
    if (q.choices[i] === q.answer) btns[i].classList.add("right");
    else if (i === idx) btns[i].classList.add("wrong");
    else btns[i].classList.add("dim");
  }

  // 記録
  P.totalAnswered++;
  bumpToday();

  if (ok) {
    R.combo++;
    R.maxCombo = Math.max(R.maxCombo, R.combo);
    R.correct++;
    P.totalCorrect++;
    P.correct[R.mode]++;
    const comboBonus = Math.min(R.combo - 1, 9) * 20;
    const timeBonus = Math.round((Math.max(0, R.timeLeft) / R.timeMax) * 50);
    const pts = 100 + comboBonus + timeBonus;
    R.score += pts;
    $("score").textContent = R.score;

    // エフェクト
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

    // 正解でも英語をきかせる
    if (q.speakOnReveal) setTimeout(() => speak(q.speakOnReveal), 350);
    else if (q.mode === "vocab" && q.speakOnShow) setTimeout(() => speak(q.speakOnShow), 350);

    showFeedback(true, q);
    const wait = q.expl ? 2600 : (q.listen ? 2200 : 1400);
    clearTimeout(autoNextId);
    autoNextId = setTimeout(nextQ, wait);
  } else {
    R.combo = 0;
    R.wrongs.push(q);
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
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  R = null;
  renderHome();
  show("scr-home");
}

/* --- きょうのぶん・れんぞく --- */
function bumpToday() {
  const t = todayStr();
  if (P.todayDate !== t) { P.todayDate = t; P.todayN = 0; }
  P.todayN++;
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
}

/* ==================== 結果画面 ==================== */

function finishRound() {
  stopTimer();
  const total = R.qs.length;
  const c = R.correct;
  const rank = c >= total ? "S" : c >= 8 ? "A" : c >= 6 ? "B" : "C";
  const starN = c >= 9 ? 3 : c >= 7 ? 2 : c >= 5 ? 1 : 0;
  const gainedXp = Math.max(5, Math.round(R.score / 10));

  // プロフィール更新
  P.plays++;
  P.stars += starN;
  P.bestCombo = Math.max(P.bestCombo, R.maxCombo);
  if (c >= total) P.perfects++;
  if (!P.modes.includes(R.mode)) P.modes.push(R.mode);
  bumpStreak();

  let levelsGained = 0;
  P.xp += gainedXp;
  while (P.xp >= xpNeed(P.level)) {
    P.xp -= xpNeed(P.level);
    P.level++;
    levelsGained++;
  }

  // 新バッジ判定
  const newBadges = BADGES.filter(b => !P.badges.includes(b.id) && b.chk(P));
  newBadges.forEach(b => P.badges.push(b.id));
  save();

  // --- 表示 ---
  show("scr-result");
  const rk = $("rank");
  rk.textContent = rank;
  rk.className = "rank r-" + rank;
  $("res-correct").textContent = `${c}/${total}`;
  $("res-combo").textContent = R.maxCombo;
  $("res-xp").textContent = gainedXp;
  $("res-score").textContent = "0";

  // 星リセット
  document.querySelectorAll("#res-stars .star").forEach(s => s.classList.remove("on"));

  // XPバー（最終状態を表示）
  $("res-xp-fill").style.width = "0%";
  $("res-xp-text").textContent = `Lv.${P.level}  ${P.xp} / ${xpNeed(P.level)} XP`;

  // まちがい復習リスト
  const rvCard = $("review-card");
  const rvList = $("review-list");
  rvList.innerHTML = "";
  if (R.wrongs.length) {
    rvCard.classList.remove("hidden");
    R.wrongs.forEach(q => {
      const li = document.createElement("li");
      const head = q.listen ? "🎧 きこえた英文" : q.main;
      li.innerHTML = `${esc(head)}\n<span class="rv-ans">→ ${esc(q.reveal)}</span>` +
        (q.expl ? `\n💡 ${esc(q.expl)}` : "");
      rvList.appendChild(li);
    });
  } else {
    rvCard.classList.add("hidden");
  }

  // --- 演出シーケンス ---
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

  // スコアカウントアップ
  setTimeout(() => {
    const dur = 900;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      $("res-score").textContent = Math.round(finalScore * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }, 800);

  // XPバー
  setTimeout(() => {
    $("res-xp-fill").style.width =
      Math.min(100, (P.xp / xpNeed(P.level)) * 100) + "%";
  }, 1600);

  // レベルアップ演出
  if (levelsGained > 0) {
    setTimeout(() => {
      $("lv-new").textContent = P.level;
      $("levelup").classList.remove("hidden");
      sLevelUp();
      confetti(140);
    }, 2300);
  }

  // 新バッジトースト
  setTimeout(() => {
    newBadges.forEach(b => toast(`🏅 バッジゲット！ ${b.icon} ${b.name}`));
  }, levelsGained > 0 ? 3000 : 2200);

  const mode = R.mode;
  $("btn-retry").onclick = () => { startRound(mode); };
  R = null;
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

/* ==================== たんごちょう ==================== */

function renderWords() {
  const grid = $("word-grid");
  if (grid.childElementCount) return; // 一度だけ生成
  VOCAB.forEach(([w, m]) => {
    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = `<div class="wen">${esc(w)}</div><div class="wja">${esc(m)}</div>`;
    card.onclick = () => {
      ensureAudio();
      sClick();
      document.querySelectorAll(".word-card.speaking").forEach(c => c.classList.remove("speaking"));
      card.classList.add("speaking");
      speak(w, 0.85, () => card.classList.remove("speaking"));
      setTimeout(() => card.classList.remove("speaking"), 2500);
    };
    grid.appendChild(card);
  });
}

/* ==================== 初期化 ==================== */

function decorate() {
  // タイトル文字をバウンドさせる
  const title = $("title");
  const text = title.textContent;
  title.innerHTML = [...text].map((ch, i) =>
    `<span class="tchar" style="animation-delay:${i * 0.09}s">${esc(ch)}</span>`).join("");

  // 背景のふわふわ
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

function init() {
  decorate();
  renderHome();

  document.querySelectorAll(".mode-btn").forEach(b => {
    b.addEventListener("click", () => startRound(b.dataset.mode));
  });

  $("btn-quit").onclick = () => { sClick(); quitRound(); };
  $("btn-home").onclick = () => { sClick(); renderHome(); show("scr-home"); };
  $("btn-badges").onclick = () => { ensureAudio(); sClick(); renderBadges(); show("scr-badges"); };
  $("btn-badges-back").onclick = () => { sClick(); renderHome(); show("scr-home"); };
  $("btn-words").onclick = () => { ensureAudio(); sClick(); renderWords(); show("scr-words"); };
  $("btn-words-back").onclick = () => { sClick(); renderHome(); show("scr-home"); };
  $("lv-ok").onclick = () => { sClick(); $("levelup").classList.add("hidden"); };

  $("mascot").addEventListener("click", () => {
    ensureAudio();
    sClick();
    const m = $("mascot");
    m.style.transform = "scale(1.25) rotate(10deg)";
    setTimeout(() => (m.style.transform = ""), 250);
    $("mascot-msg").textContent = MASCOT_MSGS[Math.floor(Math.random() * MASCOT_MSGS.length)];
    burst(m.getBoundingClientRect().left + 30, m.getBoundingClientRect().top + 30, 12);
  });
}

init();
