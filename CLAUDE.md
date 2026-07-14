# えいけん準2級チャレンジ（eiken-pre2）

小学生向け英検準2級学習ゲーム。vanilla JS・ビルド不要・依存ゼロ。
公開: https://lushunm.github.io/eiken-pre2-challenge/ （GitHub Pages）

## 最重要ルール: データは末尾追加のみ（append-only）

- データは `data/` に「パートファイル（`*_p*.js`、生データ配列）＋アグリゲータ（`vocab.js` 等）」の構成。
- **ID は配列の並び順（またはリテラル）から決まる。既存項目の削除・途中挿入・並び替え・ID 変更は禁止。**
  利用者の localStorage（にがてトラッキング・進捗）が壊れるため。
- 追加は必ず該当パートファイルの配列末尾へ。新しいパートファイルを作る場合は
  index.html の `<script>` 一覧と該当アグリゲータへの登録もセットで行う。
- 誤り報告の修正は「内容のみ」変更する（ID・位置・項目数は維持）。問題 ID は結果画面に表示される。
- データ変更後は `scripts/check-data.ps1` を実行して PASS を確認する（編集時に hook でも自動実行される）。

## 表記規則

- 小学生向け: 和訳・解説の漢字にはふりがなを付けるかひらがなにする（例:「能力（のうりょく）」）。

## PWA（オフライン・インストール対応）

- `manifest.json` + `sw.js`（Service Worker、network-first）+ `icons/`（`scripts/make-icons.ps1` で再生成可）。
- **新しい data パートファイルを追加したら `sw.js` の `CORE` 配列にも追加する**
  （追加し忘れてもオンラインで一度開けばランタイムキャッシュされるが、初回オフラインに含めるため）。
- ローカル検証時は localhost が secure context なので SW が動く。SW は network-first のため
  開発中に古いキャッシュが返る心配はほぼ無い。

## デプロイ

- main に push → GitHub Pages に 1〜2 分で自動反映（リポジトリ: lushunm/eiken-pre2-challenge）。
- push 時に GitHub Actions でデータ検査（JS 構文＋ID 重複）が走る。

## 動作確認

- serve.ps1（ポート 8543・git 管理外）＋ Claude Preview（`.claude/launch.json` に定義済み）。
- preview_eval で `startRound(mode)` → 全問回答 → 結果画面到達、の機械検証パターンを使う。
- 問題・語彙の追加依頼には `add-questions` スキル（`.claude/skills/`）の手順に従う。
