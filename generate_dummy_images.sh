#!/bin/bash

# ダミー画像生成スクリプト
# features.ymlで必要な画像を生成

echo "ダミー画像を生成しています..."

# 画像保存ディレクトリ
IMG_DIR="/mnt/c/Users/pisuk/work/GitHub/Jekyll2/assets/images"

# 必要な画像リスト（サイズ：幅x高さ）
declare -A images=(
    ["safety_main.jpg"]="800x600"
    ["safety_detail.jpg"]="800x450"
    ["environment_main.jpg"]="800x600"
    ["workspace.jpg"]="800x450"
    ["individual_space.jpg"]="800x450"
    ["furigana_editor.jpg"]="800x450"
    ["method_main.jpg"]="800x600"
    ["method_detail.jpg"]="800x450"
)

# 各画像を生成
for image in "${!images[@]}"; do
    size="${images[$image]}"
    echo "生成中: $image ($size)"
    
    # カテゴリ別の色とテキスト
    if [[ $image == safety_* ]]; then
        color="4CAF50"  # 緑色（安全）
        category="心理的安全性"
    elif [[ $image == environment_* ]] || [[ $image == workspace* ]] || [[ $image == individual_* ]] || [[ $image == furigana_* ]]; then
        color="2196F3"  # 青色（環境）
        category="学習環境"
    elif [[ $image == method_* ]]; then
        color="FF9800"  # オレンジ色（メソッド）
        category="教育メソッド"
    else
        color="9E9E9E"  # グレー（その他）
        category="ダミー画像"
    fi
    
    # wgetでplaceholder.comから画像をダウンロード
    curl -s "https://via.placeholder.com/${size}/${color}/FFFFFF?text=${category}" \
         -o "${IMG_DIR}/${image}"
    
    if [ $? -eq 0 ]; then
        echo "✓ ${image} を生成しました"
    else
        echo "✗ ${image} の生成に失敗しました"
    fi
done

echo ""
echo "ダミー画像の生成が完了しました！"
echo "生成された画像は ${IMG_DIR} にあります。"
echo ""
echo "生成された画像一覧："
ls -la "${IMG_DIR}"