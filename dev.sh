#!/bin/bash

# mming プログラミング教室サイト - 開発環境起動スクリプト

set -e  # エラー時に停止

echo "🚀 mming 開発環境を起動しています..."

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

# Ruby環境チェック
check_ruby() {
    print_status "Ruby環境をチェックしています..."
    
    if ! command -v ruby &> /dev/null; then
        print_error "Rubyがインストールされていません"
        print_status "Rubyをインストールしてください: https://www.ruby-lang.org/"
        exit 1
    fi
    
    ruby_version=$(ruby -v)
    print_success "Ruby環境: $ruby_version"
}

# Bundler環境チェック
check_bundler() {
    print_status "Bundler環境をチェックしています..."
    
    if ! command -v bundle &> /dev/null; then
        print_warning "Bundlerがインストールされていません。インストールしています..."
        gem install bundler
    fi
    
    bundler_version=$(bundle -v)
    print_success "Bundler環境: $bundler_version"
}

# 依存関係インストール
install_dependencies() {
    print_status "依存関係をインストールしています..."
    
    if [ ! -f "Gemfile.lock" ] || [ "Gemfile" -nt "Gemfile.lock" ]; then
        print_status "bundle installを実行しています..."
        bundle install
        print_success "依存関係のインストールが完了しました"
    else
        print_status "bundle updateを実行しています..."
        bundle update
        print_success "依存関係の更新が完了しました"
    fi
}

# 開発サーバー起動
start_server() {
    print_status "Jekyll開発サーバーを起動しています..."
    print_status "サーバーURL: http://localhost:4000"
    print_status "停止するには Ctrl+C を押してください"
    echo ""
    
    # ライブリロード付きでサーバー起動
    bundle exec jekyll serve --livereload --drafts --host=0.0.0.0 --port=4000
}

# Docker環境チェック（オプション）
check_docker() {
    if command -v docker &> /dev/null && [ -f "docker-compose.yml" ]; then
        print_status "Docker環境が利用可能です"
        echo "Docker環境で起動する場合は: docker-compose up -d"
        echo ""
    fi
}

# ヘルプメッセージ
show_help() {
    echo "使用法: ./dev.sh [オプション]"
    echo ""
    echo "オプション:"
    echo "  -h, --help     このヘルプメッセージを表示"
    echo "  -c, --clean    _siteディレクトリをクリーンアップ"
    echo "  -i, --install  依存関係のみインストール"
    echo ""
    echo "例:"
    echo "  ./dev.sh           # 通常の開発サーバー起動"
    echo "  ./dev.sh --clean   # クリーンビルド"
    echo "  ./dev.sh --install # 依存関係のみインストール"
}

# クリーンアップ
clean_build() {
    print_status "_siteディレクトリをクリーンアップしています..."
    
    if [ -d "_site" ]; then
        rm -rf _site
        print_success "クリーンアップ完了"
    else
        print_status "_siteディレクトリは存在しません"
    fi
}

# メイン処理
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--clean)
            clean_build
            ;;
        -i|--install)
            check_ruby
            check_bundler
            install_dependencies
            print_success "依存関係のインストールが完了しました"
            exit 0
            ;;
        "")
            # 通常の起動プロセス
            check_ruby
            check_bundler
            install_dependencies
            check_docker
            start_server
            ;;
        *)
            print_error "不明なオプション: $1"
            show_help
            exit 1
            ;;
    esac
}

# Ctrl+Cでの終了処理
trap 'print_warning "開発サーバーを停止しています..."; exit 0' INT

# スクリプト実行
main "$@"