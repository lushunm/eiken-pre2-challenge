/* 熟語データ アグリゲータ（英検準2級頻出の熟語・句動詞・構文）
   idはファイル内の並び順から自動付与（追加は各配列の末尾のみ） */
(function () {
  function expand(arr, prefix) {
    return (arr || []).map((e, i) => ({
      id: prefix + String(i + 1).padStart(4, "0"),
      w: e[0], ja: e[1], ex: e[2],
    }));
  }
  window.DATA_IDIOMS = [].concat(
    expand(window.IDIOM_1, "iA"),
    expand(window.IDIOM_2, "iB")
  );
})();
