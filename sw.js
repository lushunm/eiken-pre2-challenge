/* Service Worker: オフライン対応
   方針: network-first（オンライン時は常に最新を取得し、成功したレスポンスをキャッシュ。
   オフライン時はキャッシュから配信）。
   新しい data ファイルを追加した場合も、オンラインで一度開けば自動でキャッシュされるが、
   初回インストール時からオフラインで使えるよう CORE にも追加しておくこと。 */
const CACHE = "eiken-pre2-v1";

const CORE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./data/vocab_p1.js",
  "./data/vocab_p2.js",
  "./data/vocab_p3.js",
  "./data/vocab_p4.js",
  "./data/vocab.js",
  "./data/idioms_p1.js",
  "./data/idioms_p2.js",
  "./data/idioms.js",
  "./data/grammar_p1.js",
  "./data/grammar_p2.js",
  "./data/grammar.js",
  "./data/tanbun_p1.js",
  "./data/tanbun_p2.js",
  "./data/tanbun.js",
  "./data/kaiwabun_p1.js",
  "./data/kaiwabun_p2.js",
  "./data/kaiwabun.js",
  "./data/listening_p1.js",
  "./data/listening_p2a.js",
  "./data/listening_p2b.js",
  "./data/listening_p3.js",
  "./data/listening.js",
  "./data/reading_p1.js",
  "./data/reading_p2.js",
  "./data/reading.js",
  "./data/interview_p1.js",
  "./data/interview_p2.js",
  "./data/interview.js",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => {
          if (hit) return hit;
          // ページ遷移のオフラインフォールバック
          if (req.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        })
      )
  );
});
