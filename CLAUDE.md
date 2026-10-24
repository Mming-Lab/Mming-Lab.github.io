# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**mming** - 特別な配慮が必要な子ども（療育・放課後等デイサービス・特別支援学級に通う子ども）向けプログラミング教室の静的サイト。Jekyll + GitHub Pages で `https://mming-lab.github.io` に公開される。

鹿児島市の実在する教室のサイト。料金・住所・連絡先・プライバシーポリシーは実データなので、内容を変更する際は実態と乖離させないこと。

## 開発コマンド

テストスイートと lint は存在しない。CI もない（`.github/` なし）。

**GitHub Pages のビルド方式は `legacy`** で、ここから2つの重要な帰結がある:

1. **本番は `Gemfile` / `Gemfile.lock` を読まない。** GitHub サーバ側に固定された github-pages でビルドされる。Gemfile を上げても本番は変わらない
2. **ビルド失敗時は前回のデプロイが維持される。** したがってビルドが壊れても本番は無傷（実測で37回のデプロイ中 失敗0回）

つまり危険なのは「ビルドが壊れること」ではなく、**ビルドが成功して間違ったものが公開されること**。

### ローカルでのビルド検証

ホスト（Windows）に Ruby / bundler は入っていない。Docker で行う:

```bash
# イメージのビルド（初回のみ。Git Bash からは MSYS_NO_PATHCONV=1 が必要）
MSYS_NO_PATHCONV=1 docker build -t mming-jekyll:dev .

# 本番ビルド。gem は名前付きボリュームに保持する（--rm でコンテナを捨てても消えない）
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/work/github_Mming-Lab/Mming-Lab.github.io:/workspace" \
  -v mming-bundle:/usr/local/bundle -w /workspace mming-jekyll:dev \
  bash -lc 'bundle install --quiet && JEKYLL_ENV=production bundle exec jekyll build'
```

**変更の無害性を確かめる手順**: ビルド前に `_site` を退避し、変更後のビルドと比較する。CSS だけの変更なら `_site/assets/css/main.css` を、データ・テンプレートの変更なら各 HTML を比較する。改行コードの差（CRLF→LF）が出ることがあるので `tr -d '\r'` で正規化してから比較する。

VS Code の Dev Containers（`.devcontainer/devcontainer.json`）から開くのが最も素直な経路。`dev.sh` / `build.sh` はホストから実行できない（Ruby チェックで止まる）。


### ブラウザで確認する

**Windows のバインドマウント越しでは Jekyll の自動再生成が効かない**（コンテナ内の
inotify がホストの変更を検知できない。`jekyll serve` 起動時に
「Auto-regeneration may not work on some Windows versions」と警告が出る）。
`--livereload` を付けても反映されないので、**静的配信モードで立てて、
変更のたびに手でビルドし、ブラウザを再読み込みする**。

```bash
# サーバーを起動（初回のみ。_site を配信するだけで、監視も初回ビルドもしない）
MSYS_NO_PATHCONV=1 docker run -d --name mming-preview -p 4000:4000 \
  -v "C:/work/github_Mming-Lab/Mming-Lab.github.io:/workspace" \
  -v mming-bundle:/usr/local/bundle -w /workspace mming-jekyll:dev \
  bash -lc 'bundle exec jekyll serve --host 0.0.0.0 --port 4000 --no-watch --skip-initial-build'

# 変更したらビルドし直して、ブラウザを再読み込みする
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/work/github_Mming-Lab/Mming-Lab.github.io:/workspace" \
  -v mming-bundle:/usr/local/bundle -w /workspace mming-jekyll:dev \
  bash -lc 'JEKYLL_ENV=production bundle exec jekyll build'

# 止めるとき
docker rm -f mming-preview
```

http://localhost:4000/ で開く。`JEKYLL_ENV=production` でビルドしても
GA4 は `jekyll.environment == 'production'` のときだけ出力されるので、
解析を汚したくなければ `JEKYLL_ENV` を付けずにビルドする（見た目は同一）。

### アイコンの登録漏れ検査

```bash
bash check-icons.sh
```

`_data/icons.yml` への登録漏れを検出する。**ビルドは通ってしまう**ので手で回すこと。
漏れると画面にリガチャ名が英単語で表示され（例: `SETTINGS`）、
Material Icons の CSS が `white-space: nowrap` を当てるため
見出しが縦組みになるなどレイアウトごと崩れる。

実際に `icon: settings # コメント` という書き方（クォート無し＋行末コメント）を
収集スクリプトが取りこぼして事故が起きた。このスクリプトはその形も拾う。
ただし **JS が動的に差し替えるものは検出できない**
（`sections.js` が `expand_more` / `expand_less` を入れ替えている）。
## アーキテクチャ

### データ駆動：2層構造

HTML テンプレートにテキストを直書きしない。**キーは英語、値は日本語**（将来の多言語化のため）。

| 層 | 置き場 | 基準 |
|---|---|---|
| **正本** | `_data/core/` | 2箇所以上から参照される、または事実としての正しさが問われるもの |
| **描画単位** | `_data/*.yml` | 1ファイル = 1 include |

この基準を守ること。片方も満たさないものを `core/` に上げると肥大化して2層の意味が失われる。

**`_data/core/`**
- `contact.yml` — メール・住所・外部フォームURL・SNS・フッターリンク
- `eligibility.yml` — 対象者の条件（トップページと体験ページの両方から参照）

**トップレベル**
- `config.yml` — サイト名・説明・ロゴ・OG画像・SEO構造化データ設定
- `icons.yml` — **Material Symbols のグリフ一覧**（後述。追加を忘れると壊れる）
- `ui_text.yml` — レイアウト横断の共通文言
- `navigation.yml` — `main`（トップ用アンカー）/ `global`（他ページ用）/ `footer_cta`
- `hero.yml` `about.yml` `features.yml` `team.yml` `faq.yml` `pricing_schedule.yml` `access.yml` `blog.yml` `footer.yml` `trial.yml` — 各セクション
- `post_note.yml` — 記事末尾の教室紹介（対象の条件は `core/eligibility.yml` から引く）

### Jekyll / Liquid の制約（実ソースで検証済み）

| 手法 | 可否 |
|---|---|
| データファイル内に Liquid を書く | **不可**。`SafeYAML.load_file` で読まれるだけで Liquid を通らず、文字列がそのまま出力される |
| YAML アンカー / エイリアス / マージキー | **可。ただし同一ファイル内のみ**。だから共有する値は1ファイルに集める |
| `_data/core/x.yml` → `site.data.core.x` | **可**。ディレクトリ名にハイフンを使うとドット記法で引けなくなる |
| include パラメータで Hash/Array を渡す | **可**（文字列化されない） |
| Sass の `@use` / `@forward` | **不可**。`jekyll-sass-converter 1.5.2` → Ruby Sass 3.7.4 で `@import` しかない |

ページの `breadcrumb` も front matter で与える。パンくずの構造化データが使う階層名で、省略すると `title` にフォールバックするが、`title` には「（鹿児島市）」が付いていて階層名としては長い。

ページの `title` / `description` は front matter が正本。front matter に Liquid は効かないため、データファイルから供給する手段がない。「HTMLに文言を直書きしない」方針の唯一の例外。

### ページとテンプレート

`_layouts/default.html` が全ページ共通。head に SEO メタタグ、OG/Twitter カード、JSON-LD、CSS、Material Symbols、本番限定の GA4 を持つ。

| ページ | 構成 |
|---|---|
| `index.html` | hero → about → features → team → faq → pricing-schedule → access（`latest-posts-section` はコメントアウト中） |
| `trial/index.html` | trial-hero → trial-belief → trial-application |
| `blog.html` | `site.posts` 一覧 |
| `legal.html` | プライバシーポリシー |
| `_layouts/post.html` | 記事個別（`default` を継承）。本文のあとに**関連記事**（同カテゴリを自動で最大3本）と**教室紹介**（`post-classroom-note`）を出す |

各 include の先頭コメントに「データソース」「対応 SCSS」「対応 JS」を書く。**JS の関数名や行番号は書かない**（必ず腐る）。

### CSS / フォント配信の方針

- **`main.css` は描画をブロックさせる。** 非同期化（`media="print"` + `onload`）に戻さないこと。クリティカル CSS がヘッダー・ヒーロー・固定CTA を含まないため、未スタイル描画と全面再レイアウトを招くだけで、`preload as="style"` は High 優先度なので取得完了時刻も変わらない
- **和文 Web フォントは使わない。** 端末搭載の UD フォント優先スタック（`_sass/_variables.scss` の `$font-family-base`）。BIZ UDPGothic は Google Fonts ではサブセット分割されず1ウェイト 4.3MB の TTF 配信なので採用不可
- **Material Symbols は `_data/icons.yml` のグリフのみのサブセット**（約6KB。全グリフ版は125KB）。**新しいアイコンを使うときは `_data/icons.yml` に名前を追加すること。** 忘れるとフォントにグリフが無く、画面にリガチャ名（`menu` 等）が英単語として表示される
- SNS アイコンは `_includes/components/brand-icon.html` のインライン SVG（Font Awesome は廃止した）

### SCSS

`assets/css/main.scss` が唯一のエントリポイント。`@import` 順序がそのままカスケード順序なので、順番を変えると後勝ちの関係が崩れる。新規コンポーネントの追記を忘れないこと。

デザイントークンは `_sass/_variables.scss`（115変数）。**色・サイズ・余白をハードコードせず変数を使う。** 値の一覧はファイルを直接読むこと。

- **前景色と背景色のトークンは分かれている。** `$secondary-color` は白上 2.65:1 で**前景には使えない**。文字・アイコンには `$secondary-on-light`（4.80:1）。警告色も同様に `$warning-on-light`（5.02:1）
- `$space-*` は 8px ベース（`$space-4` = 16px）。**コメントの px 値を信じる前にトークンの実値を確認すること**（過去にコメントが全件2倍ずれていた）

`_sass/_mixins.scss` は**実際に使われている5つだけ**を置く方針:

- `card-accordion` — **クリック可能**なカード（太い枠線・影・`cursor: pointer`）
- `info-banner` — **表示のみ**のバナー（細い枠線・影なし・ホバーなし・`cursor: default`）
- `button-primary` / `button-secondary` — 内部で `button-base` を呼び、44px のタッチターゲットを担保

「将来使うかもしれない」ミックスインは置かない。Ruby Sass は未使用も重複定義も警告しないので、重複はファイル冒頭に書いた grep コマンドで検出する。

### JavaScript

**ES6 モジュール・バンドラー・フレームワークは使わない**（過去に ES6 モジュール化でアコーディオンが全面的に動かなくなり撤退した）。構成は2ファイル:

- `assets/js/simple-main.js` — 全ページ共通の基盤（モバイルナビのみ）
- `assets/js/sections.js` — セクション固有（FAQ・特徴アコーディオン・画像スライダー・申込フォーム）

どちらも単一 IIFE + `defer`。各 init 関数は「対象要素が無ければ即 return」で始める。

**守るべき3つの規約:**

1. **クリック可能な要素はネイティブ `<button type="button">` を使う。** `role="button"` + `tabindex="0"` + `keydown` の自作3点セットは1つ欠けると無言で壊れる（実際に FAQ がキーボード操作不能になっていた）
2. **表示状態の真実は aria 属性に1つだけ置く。** JS は `style.display` を触らない。CSS が `[aria-hidden="false"]` で `display` を決める
3. **ブラウザのネイティブ挙動を奪わない。** スムーススクロールは CSS の `scroll-behavior` に任せる（JS で `preventDefault` + `scrollIntoView` するとフラグメントも履歴もフォーカスも移動しない）

### ブログ

- `_posts/YYYY-MM-DD-slug.md`、permalink は `/blog/:slug/`
- front matter: `layout: post` / `title` / `date` / `slug` / `categories` / `tags` / `description`
- **記事本文は見出しレベル2から始める**（`post.html` が h1 を出力するので本文に h1 を書くと重複する）
- 旧 URL は `redirect_from` で維持。**既存記事の `redirect_from` は消さない**
- 画像は `assets/images/blog/<記事と同じ日付>-<同じslug>/` に配置。**WebP**、200KB 以下、Markdown には `img-fluid d-block mx-auto` クラスを付ける
  - 注: `.claude/blog-image-guide.md` は「PNG/JPG」「日本語ファイル名NG」と書かれているが**実装と逆**で、既存の記事別フォルダの日付も記事の日付と一致していない。参照しないこと

## 誰のための教室か（コピーを書く前に必ず読む）

**発達特性があり、かつプログラミングにハマる子**が対象。この2つは両方とも必要条件。

- 考えるのが好きで、うまくいかないことも含めて試すのが面白い、という子
- 教材が「自分で考えて進める」形なので、考えること自体が楽しくないと続かない
- この線引きは運営側で一貫している。例外をつくらないこと

### 間口を広げないこと

コピーの目的は問い合わせを増やすことではなく、**合う家庭に正確に届けること**。
対象を広げる方向の修正はしない。

- **`_data/core/eligibility.yml` の `note`（向いていない子の明示）を弱めない。**
  申込ボタンの手前にあるのも意図的で、最後の確認として正しい位置。
  「体験で一緒に確かめましょう」のような出口を足すと、この働きが消える
- **検索結果の文面（title / description）で絞る。** 「習い事」のような
  興味の有無を問わない語は狙わない。狙うのは「マイクラ」「プログラミング」に
  既に興味がある検索語
- **「どんな子でも大丈夫」と書かない。** 過剰な受容はかえって警戒される。
  正直に線を引くことが信頼材料になる

### 「居場所」は入口の条件ではなく、入ったあとの扱い

サイトの軸は「居場所であること」に置いている。ただしこれは**来た子をどう扱うか**の話。
一度「プログラミングは居場所のための手段」と書いてしまい、興味のない子も
対象に読める状態になった。この混同をしないこと。

- 入口（誰に来てほしいか）… 発達特性 × プログラミングへの興味。ここは絞る
- 中身（来たあとどう扱うか）… 伝え方を変える／こだわりを待つ／できない日があってもいい

### 文章の作法

保護者に向けて書くときは、運営の「おたよりテンプレート」と同じ作法に従う。

- 含める: 具体的なこと／その子らしさ／温かい表現
- 避ける: 内部の専門用語や分析的な表現／パターン化された文章／見出しや箇条書き
- 長さ: 1文は30〜60字、1段落は2〜4文

サイトは元々メンター（システムエンジニア）が制作しており、箇条書き・研究論文の
引用・「選ばれる3つの理由」といった仕様書に近い書き方になっていた。
一方で商品の中身は代表のもので、上の作法も代表が定めたもの。**書き手の声を
代表側に寄せる**のが正しい。メンターの技術（ふりがな対応・航行灯）は
居場所の軸に直結するので消さず、仕様の言い方を配慮の記述に変えて使う。

## 子どもの情報の取り扱い（最優先の制約）

**このリポジトリは公開されている。** サイトの本文だけでなく、
データファイルのコメントも CLAUDE.md も GitHub で誰でも読める。
在籍家庭も、これから来る家庭も読める前提で書くこと。

サイトのコピーに、次のものは載せない。

- **氏名・クラス記号・学年・在籍状況**
- **健康や発達の状態に関する個別の記述**
- **特定個人情報**（マイナンバーを含む情報）
- **個別のエピソード**（具体的な出来事。在籍家庭が読めば誰か分かる）
- **子どもの発言の引用**。本人が将来読み、消せない
- **1人の子の達成をそのまま一般化した文**。**価値基準の記述
  （何を成長と数えるか）に書き換える**こと

代表・メンター自身の言葉は使える（著者であり当事者だから）。
子どもの言葉と事例は使わない。この線引きで、強さを損なわずに守れる。

**この注意書き自体に実例を引用しないこと。** 実例を書けば、それが公開される。

掲載物の同意、会員規約の論点、集客の実績など、公開リポジトリに置けないものは
`.claude/operations.md`（`.gitignore` で除外済み）にある。

## 設計上の制約（守ること）

- **localStorage / sessionStorage は UI の状態に使わない** — 画面の状態は JavaScript 変数のみ。
  唯一の例外が `_layouts/default.html` の GA4 内部トラフィック除外で、`?internal=1` の印を
  保存している。ページをまたいで覚える必要があり、JS 変数では実現できないため。
  アクセス解析の都合であって UI の状態ではない。これ以外に増やさないこと
- **モーダルダイアログ禁止** — 画面遷移・アコーディオンで表現する
- **イタリック体（斜体）禁止**
- 過度なアニメーション禁止。`prefers-reduced-motion` はサイト全体で一括無効化しているので、コンポーネントごとに個別に書く必要はない
- アクセシビリティは「実用重視の WCAG AA」。最小タッチターゲット44px（ただし**本文中のインラインリンクは WCAG 2.5.8 の inline 例外**なので一律適用しない）、本文コントラスト4.5:1
- フォーカス表示は `:focus-visible`（`:focus` はマウスクリック時にも出る）
- 画像は WebP、最大200KB、`width`/`height` 指定でレイアウトシフトを防ぐ
- サイト全体に入力要素は存在しない（フォームはすべて Google Forms の iframe）
- GitHub Pages で動くプラグインのみ。有効なのは `jekyll-feed` / `jekyll-sitemap` / `jekyll-redirect-from` の3つだけ

## 更新手順（更新頻度の高い順）

| 作業 | 触る場所 | 注意点 |
|---|---|---|
| **ブログ記事追加** | `_posts/` に新規作成、画像は `assets/images/blog/<同日付>-<同slug>/` | front matter は既存記事をコピーして書き換える。`slug` を忘れると URL が変わる。**未来日付の記事は本番で公開されない**（`_config.yml` の `future: false`） |
| **料金改定** | `_data/pricing_schedule.yml` の `plan.price` / `enrollment_fee.amount` | 金額は通貨記号込みの文字列。形を崩さない |
| **スケジュール変更** | `_data/pricing_schedule.yml` の `schedule.table` | **`headers` の個数 − 1 == 各 `rows[].slots` の個数** を必ず守る。崩すと表が黙って崩れる。満員クラスは `full_classes` に記号を追加し、`legend.items` の `打消し線 = 満員` のコメントを外す（両方やらないと表だけ変わって説明が出ない） |
| **FAQ 追加** | `_data/faq.yml` の `items` | `answer` はブロックスカラーで書く（既存と同じ形） |
| **対象者の条件変更** | `_data/core/eligibility.yml` | トップページと体験ページの両方に反映される |
| **満席になった** | 体験の申込フォーム（Google Forms）を閉じる | **「申し込める＝空きがある」が成り立つ運用。** `faq.yml` のクラス決定と `trial.yml` の `day_of` がこれを前提に書かれている。運用を変えるなら両方直すこと。時間割の凡例には書かない（表は時間割であって空き状況ではない）。フォームを閉じると `/trial/` の iframe は Google の「受付を終了しました」だけを出す |
| **新しいアイコンを使う** | `_data/icons.yml` に名前を追加 | 忘れるとリガチャ名が英単語で表示される |
| **メディア掲載実績** | `_data/credentials.yml` の `media.items`（正本）。記事 `_posts/2025-06-01-media-coverage.md` にも同じものを載せている | **広告は書かない。** 費用を払って載せた枠は第三者が取り上げた事実ではなく、信用の裏付けにならない。外部のURLで確認できるものに限る。経緯は `.claude/operations.md` |

## 既知の落とし穴

- **`_config.yml` の `exclude` に `CLAUDE.md` がある。外さないこと。** 外すと `/CLAUDE/` として本番サイトにも出てしまう
- **`build.sh` が作る `_site_backup_*` は `.gitignore` と `exclude` の両方に入っている。** 外すとサイト全体のコピーが公開され得る
- **`docker.sh cleanup` を実行しないこと** — かつてシステム全体を対象とする prune が入っており、他プロジェクトの停止コンテナを消していた。該当行は削除済みだが、スクリプト自体の信頼性は低い
- `_config.yml` は `future: false`。`dev.sh` / `docker.sh` から `--future` と `--incremental` は除去済み（`--incremental` は `_data` / `_includes` の変更を追跡せず「直したのに変わらない」の原因）
- `.gitignore` が `.claude/` と `.vscode/` を除外している（`CLAUDE.md` 自体は追跡対象）
- `.vscode/jekyll-site-schema.json` は現在のどのデータ構造にも対応しておらず、パスもコンテナ絶対パスで解決できない。**YAML スキーマ検証は実質オフ**
- `_data/core/contact.yml` のメールアドレスはスパム対策で全角アットマーク。`mailto:` や構造化データには使わない
- `_sass/components/_trial.scss` は表示契約（`aria-hidden` での開閉）と button のリセットだけ。体験ページの本格的なデザイン実装は未着手
- トップページの `latest-posts-section` はコメントアウト中。`_data/blog.yml` の `show_on_homepage` フラグが効かない二重管理状態。**ブログをナビから外す案は保留**（当初は「記事の読者は教員で保護者ではない」と整理したが、ターゲットが「マイクラ・プログラミングにハマる子」と確定したため、技術記事が保護者の入口になりうると判断が変わった）

## 知見管理システム

**このリポジトリは公開されている。** CLAUDE.md もデータファイルのコメントも
GitHub で誰でも読める。書く前に「読まれて困らないか」を確かめること。

| 置き場 | 中身 | 公開 |
|---|---|---|
| `CLAUDE.md` | 実装の構造・設計制約・更新手順。**判断の結論**を書く | **される** |
| `.claude/operations.md` | 外に出せない運営の文脈。**結論の理由**のうち公開できないもの | されない |

`.claude/` と `.vscode/` は `.gitignore` で除外済み。
変更履歴は git log を見る。

`/learnings`（`.claude/commands/learnings.md`）で知見の整理を実行できる。
