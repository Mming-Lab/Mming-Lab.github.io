#!/bin/bash

# mming プログラミング教室サイト - 開発コンテナ管理スクリプト

set -e  # エラー時に停止

echo "🐳 mming 開発コンテナ管理スクリプト"

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 定数定義
CONTAINER_NAME="mming-jekyll-dev"
IMAGE_NAME="mming-jekyll:dev"

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

# Docker環境チェック
check_docker() {
    print_status "Docker環境をチェックしています..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Dockerがインストールされていません"
        print_status "Dockerをインストールしてください: https://www.docker.com/"
        exit 1
    fi
    
    # Dockerデーモンの起動確認
    if ! docker info &> /dev/null; then
        print_error "Dockerデーモンが起動していません"
        print_status "Dockerを起動してください"
        exit 1
    fi
    
    print_success "Docker環境チェック完了"
}

# イメージビルド
build_image() {
    print_status "開発コンテナイメージをビルドしています..."
    
    docker build -t $IMAGE_NAME .
    
    print_success "イメージビルド完了"
}

# 開発コンテナ起動
start_container() {
    print_status "開発コンテナを起動しています..."
    
    # 既存コンテナが実行中かチェック
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_warning "コンテナは既に実行中です"
        return 0
    fi
    
    # 停止中のコンテナがあるかチェック
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        print_status "既存のコンテナを再開します..."
        docker start $CONTAINER_NAME
    else
        print_status "新しいコンテナを作成して起動します..."
        docker run -d \
            --name $CONTAINER_NAME \
            --mount type=bind,source="$(pwd)",target=/workspace \
            -p 4000:4000 \
            -p 35729:35729 \
            $IMAGE_NAME
    fi
    
    print_success "コンテナが起動しました"
    print_status "VS Codeで「Remote-Containers: Attach to Running Container」を使用してコンテナに接続してください"
    print_status "または以下のコマンドでシェルに接続: ./docker.sh shell"
}

# コンテナ停止
stop_container() {
    print_status "コンテナを停止しています..."
    
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
        print_success "コンテナを停止しました"
    else
        print_warning "コンテナは実行されていません"
    fi
}

# コンテナ削除
remove_container() {
    print_status "コンテナを削除しています..."
    
    # 実行中の場合は停止
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
    fi
    
    # コンテナが存在する場合は削除
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        docker rm $CONTAINER_NAME
        print_success "コンテナを削除しました"
    else
        print_warning "削除するコンテナが見つかりません"
    fi
}

# シェル実行
exec_shell() {
    print_status "コンテナ内でシェルを起動しています..."
    
    if ! docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_error "コンテナが実行されていません。先にコンテナを起動してください: ./docker.sh start"
        exit 1
    fi
    
    docker exec -it $CONTAINER_NAME bash
}

# Jekyll開発サーバー起動
start_jekyll() {
    print_status "Jekyll開発サーバーを起動しています..."
    
    if ! docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_error "コンテナが実行されていません。先にコンテナを起動してください: ./docker.sh start"
        exit 1
    fi
    
    print_status "サーバーURL: http://localhost:4000"
    print_status "停止するには Ctrl+C を押してください"
    
    docker exec -it $CONTAINER_NAME bash -c "cd /workspace && bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload --incremental --drafts --future"
}

# 状態確認
status() {
    print_status "開発コンテナの状態:"
    echo ""
    
    print_status "=== コンテナ状態 ==="
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo "✅ コンテナは実行中です"
        docker ps -f name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "❌ コンテナは実行されていません"
        if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
            echo "💤 停止中のコンテナが存在します"
        fi
    fi
    echo ""
    
    print_status "=== イメージ情報 ==="
    if docker images -q $IMAGE_NAME | grep -q .; then
        echo "✅ イメージが存在します"
        docker images $IMAGE_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    else
        echo "❌ イメージが見つかりません"
        echo "   先にイメージをビルドしてください: ./docker.sh build"
    fi
}

# 環境のクリーンアップ
cleanup() {
    print_status "環境をクリーンアップしています..."
    
    # コンテナ停止・削除
    remove_container
    
    # イメージ削除
    if docker images -q $IMAGE_NAME | grep -q .; then
        docker rmi $IMAGE_NAME
        print_status "イメージを削除しました"
    fi
    
    # 未使用のボリューム・ネットワーク削除
    docker system prune -f
    
    print_success "クリーンアップ完了"
}

# ヘルプメッセージ
show_help() {
    echo "使用法: ./docker.sh [コマンド]"
    echo ""
    echo "コマンド:"
    echo "  build          開発コンテナイメージをビルド"
    echo "  start          開発コンテナを起動"
    echo "  stop           コンテナを停止"
    echo "  remove         コンテナを削除"
    echo "  shell          コンテナ内でシェルを起動"
    echo "  serve          Jekyll開発サーバーを起動"
    echo "  status         環境の状態を確認"
    echo "  cleanup        環境をクリーンアップ"
    echo "  help           このヘルプメッセージを表示"
    echo ""
    echo "基本的な使用の流れ:"
    echo "  1. ./docker.sh build    # イメージビルド"
    echo "  2. ./docker.sh start    # コンテナ起動"
    echo "  3. VS Codeで Remote-Containers 拡張を使用してコンテナに接続"
    echo "  4. ./docker.sh serve    # Jekyll開発サーバー起動（VS Code内ターミナルで実行）"
    echo ""
    echo "または:"
    echo "  ./docker.sh shell       # コンテナ内でシェル起動"
    echo "  bundle exec jekyll serve --host 0.0.0.0 --livereload"
}

# メイン処理
main() {
    case "${1:-help}" in
        build)
            check_docker
            build_image
            ;;
        start)
            check_docker
            start_container
            ;;
        stop)
            stop_container
            ;;
        remove|rm)
            remove_container
            ;;
        shell)
            exec_shell
            ;;
        serve)
            start_jekyll
            ;;
        status)
            check_docker
            status
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "不明なコマンド: $1"
            show_help
            exit 1
            ;;
    esac
}

# スクリプト実行
main "$@"