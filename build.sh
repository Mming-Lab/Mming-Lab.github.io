#!/bin/bash

# mming プログラミング教室サイト - 本番ビルドスクリプト

set -e  # エラー時に停止

echo "🔨 mming サイトを本番用にビルドしています..."

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 関数定義
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 環境変数設定
export JEKYLL_ENV=production

# ビルド設定
BUILD_DIR="_site"
BACKUP_DIR="_site_backup_$(date +%Y%m%d_%H%M%S)"

# 関数: 環境チェック
check_environment() {
    print_status "ビルド環境をチェックしています..."
    
    # Ruby環境チェック
    if ! command -v ruby &> /dev/null; then
        print_error "Rubyがインストールされていません"
        exit 1
    fi
    
    # Bundler環境チェック
    if ! command -v bundle &> /dev/null; then
        print_error "Bundlerがインストールされていません"
        exit 1
    fi
    
    # Gemfileの存在チェック
    if [ ! -f "Gemfile" ]; then
        print_error "Gemfileが見つかりません"
        exit 1
    fi
    
    print_success "環境チェック完了"
}

# 関数: 依存関係の確認とインストール
install_dependencies() {
    print_status "依存関係を確認しています..."
    
    if [ ! -f "Gemfile.lock" ]; then
        print_warning "Gemfile.lockが見つかりません。依存関係をインストールします..."
        bundle install
    else
        print_status "依存関係を更新しています..."
        bundle install --deployment --without development test
    fi
    
    print_success "依存関係の準備完了"
}

# 関数: 既存ビルドのバックアップ
backup_existing_build() {
    if [ -d "$BUILD_DIR" ]; then
        print_status "既存のビルドをバックアップしています..."
        mv "$BUILD_DIR" "$BACKUP_DIR"
        print_success "バックアップ完了: $BACKUP_DIR"
    fi
}

# 関数: サイトビルド
build_site() {
    print_status "サイトをビルドしています..."
    
    # Jekyll本番ビルド実行
    bundle exec jekyll build --config _config.yml \
        --destination "$BUILD_DIR" \
        --verbose \
        --trace
    
    print_success "ビルド完了"
}

# 関数: ビルド後の検証
validate_build() {
    print_status "ビルド結果を検証しています..."
    
    # ビルドディレクトリの存在確認
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "ビルドディレクトリが作成されていません"
        exit 1
    fi
    
    # index.htmlの存在確認
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        print_error "index.htmlが生成されていません"
        exit 1
    fi
    
    # ファイルサイズチェック
    build_size=$(du -sh "$BUILD_DIR" | cut -f1)
    print_status "ビルドサイズ: $build_size"
    
    # 生成ファイル数カウント
    file_count=$(find "$BUILD_DIR" -type f | wc -l)
    print_status "生成ファイル数: $file_count"
    
    print_success "検証完了"
}

# 関数: ビルド統計表示
show_build_stats() {
    print_status "=== ビルド統計 ==="
    
    echo "ビルド時刻: $(date)"
    echo "ビルド環境: $JEKYLL_ENV"
    echo "ビルドディレクトリ: $BUILD_DIR"
    
    if [ -d "$BUILD_DIR" ]; then
        echo "ビルドサイズ: $(du -sh "$BUILD_DIR" | cut -f1)"
        echo "ファイル数: $(find "$BUILD_DIR" -type f | wc -l)"
        echo "HTMLファイル数: $(find "$BUILD_DIR" -name "*.html" | wc -l)"
        echo "CSSファイル数: $(find "$BUILD_DIR" -name "*.css" | wc -l)"
        echo "JSファイル数: $(find "$BUILD_DIR" -name "*.js" | wc -l)"
        echo "画像ファイル数: $(find "$BUILD_DIR" \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l)"
    fi
    
    echo "==================="
}

# 関数: クリーンアップ
cleanup() {
    print_status "クリーンアップを実行しています..."
    
    # 古いバックアップを削除（7日以上古いもの）
    if ls _site_backup_* 1> /dev/null 2>&1; then
        find . -name "_site_backup_*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
        print_status "古いバックアップを削除しました"
    fi
    
    # 一時ファイルのクリーンアップ
    if [ -d ".jekyll-cache" ]; then
        rm -rf .jekyll-cache
        print_status "Jekyll キャッシュをクリーンアップしました"
    fi
    
    print_success "クリーンアップ完了"
}

# 関数: ヘルプメッセージ
show_help() {
    echo "使用法: ./build.sh [オプション]"
    echo ""
    echo "オプション:"
    echo "  -h, --help     このヘルプメッセージを表示"
    echo "  -c, --clean    クリーンビルド（既存ファイルを削除）"
    echo "  -v, --verbose  詳細ログを表示"
    echo "  -t, --test     テストビルド（開発環境設定）"
    echo "  --no-backup    既存ビルドをバックアップしない"
    echo ""
    echo "例:"
    echo "  ./build.sh                # 通常の本番ビルド"
    echo "  ./build.sh --clean        # クリーンビルド"
    echo "  ./build.sh --test         # テストビルド"
    echo "  ./build.sh --no-backup    # バックアップなしビルド"
}

# 関数: クリーンビルド
clean_build() {
    print_status "クリーンビルドを実行しています..."
    
    # 既存ビルドディレクトリを削除
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_status "既存ビルドディレクトリを削除しました"
    fi
    
    # Jekyll キャッシュを削除
    if [ -d ".jekyll-cache" ]; then
        rm -rf .jekyll-cache
        print_status "Jekyll キャッシュを削除しました"
    fi
    
    print_success "クリーンアップ完了"
}

# メイン処理
main() {
    local clean_flag=false
    local backup_flag=true
    local verbose_flag=false
    local test_flag=false
    
    # 引数処理
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--clean)
                clean_flag=true
                shift
                ;;
            -v|--verbose)
                verbose_flag=true
                shift
                ;;
            -t|--test)
                test_flag=true
                export JEKYLL_ENV=development
                shift
                ;;
            --no-backup)
                backup_flag=false
                shift
                ;;
            *)
                print_error "不明なオプション: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # ビルド環境の表示
    if [ "$test_flag" = true ]; then
        print_warning "テストビルドモードで実行します (JEKYLL_ENV=development)"
    else
        print_status "本番ビルドモードで実行します (JEKYLL_ENV=production)"
    fi
    
    # ビルドプロセス実行
    check_environment
    install_dependencies
    
    if [ "$clean_flag" = true ]; then
        clean_build
    elif [ "$backup_flag" = true ]; then
        backup_existing_build
    fi
    
    build_site
    validate_build
    show_build_stats
    cleanup
    
    print_success "🎉 ビルドが正常に完了しました！"
    print_status "ビルド結果: $BUILD_DIR"
    
    if [ "$test_flag" = false ]; then
        print_status "本番環境にデプロイする準備ができました"
    fi
}

# エラーハンドリング
handle_error() {
    local exit_code=$?
    print_error "ビルド中にエラーが発生しました (終了コード: $exit_code)"
    
    # バックアップがある場合は復元を提案
    if [ -d "$BACKUP_DIR" ]; then
        print_warning "バックアップから復元する場合は以下を実行してください:"
        echo "mv $BACKUP_DIR $BUILD_DIR"
    fi
    
    exit $exit_code
}

# エラートラップ設定
trap handle_error ERR

# スクリプト実行
main "$@"