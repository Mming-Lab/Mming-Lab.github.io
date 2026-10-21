#!/bin/bash
# ========================================
# Material Symbols アイコンの登録漏れ検査
# ========================================
#
# _data/icons.yml に登録し忘れたアイコンを検出する。
#
# 登録を忘れるとフォントにグリフが含まれず、画面にリガチャ名が英単語で
# 表示される（例: SETTINGS）。しかも Material Icons の CSS が
# white-space: nowrap を当てるため、長い英単語が幅を取って
# 見出しが縦組みになるなどレイアウトごと崩れる。
#
# 使い方:
#   bash check-icons.sh
#
# 注: ビルドは通ってしまうので、この検査は手動で回す必要がある。
# アイコンを追加・変更したときは必ず実行すること。
# ========================================

set -u
cd "$(dirname "$0")"

used=$(mktemp)
registered=$(mktemp)
trap 'rm -f "$used" "$registered"' EXIT

# --- 使用されているアイコン名を集める ---

# 1) データファイルの icon 値
#    対応する書き方: icon: name / icon: "name" / - icon: name # コメント
#    コメント行（行頭が #）は除外する
grep -rhE '^[[:space:]]*-?[[:space:]]*icon:' _data/*.yml _data/core/*.yml 2>/dev/null \
  | grep -vE '^[[:space:]]*#' \
  | sed -E 's/^[[:space:]]*-?[[:space:]]*icon:[[:space:]]*//' \
  | sed -E 's/[[:space:]]*#.*$//' \
  | tr -d '"' \
  | tr -d "'" \
  | sed -E 's/[[:space:]]+$//' \
  >> "$used"

# 2) テンプレートに直書きされたリガチャ名
#    <span class="material-icons ...">name</span>
grep -rhoE 'class="material-icons[^"]*"[^>]*>[[:space:]]*[a-z_0-9]+' \
  _includes _layouts ./*.html trial/*.html 2>/dev/null \
  | grep -oE '>[[:space:]]*[a-z_0-9]+$' \
  | tr -d '>' \
  | sed -E 's/^[[:space:]]+//' \
  >> "$used"

# 3) JavaScript が動的に差し替えるものは検出できない。
#    assets/js/sections.js がアコーディオンの開閉で expand_more / expand_less を
#    textContent に入れ替えている。この2つは「未使用」と出ても消さないこと。
#
# 3) Liquid 変数で渡しているものは静的に追えないので対象外。
#    そのパターンを使うときは、このスクリプトでは検出できないことに注意。

# ブランドアイコンは _includes/components/brand-icon.html が
# インライン SVG で描画するため、フォントのサブセットには不要
sort -u "$used" \
  | grep -E '^[a-z_0-9]+$' \
  | grep -vE '^(github|instagram|x)$' \
  > "${used}.clean"

# --- 登録済みのアイコン名 ---
grep -E '^[[:space:]]*-[[:space:]]+[a-z_0-9]+[[:space:]]*$' _data/icons.yml \
  | sed -E 's/^[[:space:]]*-[[:space:]]+//' \
  | sed -E 's/[[:space:]]*$//' \
  | sort -u > "$registered"

missing=$(comm -23 "${used}.clean" "$registered")
unused=$(comm -13 "${used}.clean" "$registered")
rm -f "${used}.clean"

echo "使用: $(sort -u "$used" | grep -cE '^[a-z_0-9]+$') 種類 / 登録: $(wc -l < "$registered") 種類"
echo

if [ -n "$missing" ]; then
  echo "✗ _data/icons.yml に未登録のアイコンがあります:"
  echo "$missing" | sed 's/^/    - /'
  echo
  echo "  このままだと画面にリガチャ名が英単語で表示されます。"
  echo "  _data/icons.yml の material_symbols に追加してください。"
  echo "  名前の確認: https://fonts.google.com/icons （Material Symbols Outlined）"
  exit 1
fi

echo "✓ 未登録のアイコンはありません"

if [ -n "$unused" ]; then
  echo
  echo "（参考）登録されているが使われていないアイコン:"
  echo "$unused" | tr '\n' ' '
  echo
  echo "  サブセットが少し大きくなるだけで害はありませんが、整理の目安に。"
fi
