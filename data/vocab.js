/* 単語データ アグリゲータ
   語彙選定の出典: 『CEFR-J Wordlist Version 1.5』東京外国語大学投野由紀夫研究室
   （http://www.cefr-j.org/ / openlanguageprofiles/olp-en-cefrj のCSV版を利用）
   A2レベル全域＋B1レベルから英検準2級頻出語を選定。和訳は本アプリ向けに作成。
   idはファイル内の並び順から自動付与（既存idを保つため、追加は各配列の末尾のみ） */
(function () {
  function expand(arr, lv, prefix) {
    return (arr || []).map((e, i) => ({
      id: prefix + String(i + 1).padStart(4, "0"),
      w: e[0], pos: e[1], ja: e[2], lv,
    }));
  }
  window.DATA_VOCAB = [].concat(
    expand(window.VOCAB_A2_1, "A2", "vA"),
    expand(window.VOCAB_A2_2, "A2", "vB"),
    expand(window.VOCAB_A2_3, "A2", "vC"),
    expand(window.VOCAB_B1, "B1", "vD")
  );
})();
