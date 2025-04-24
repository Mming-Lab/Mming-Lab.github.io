# Ruby AlpineイメージからJekyllコンテナを作成する

# 最低限、Ruby 2.5以降を使用すること。
# GitHub Pages（Jekyll 3.9.x）を使用する場合は、次の行のコメントを解除します：
# FROM ruby:2.7-alpine3.15
# Jekyllの最新バージョンを使用する場合は、次の行のコメントを解除します：
FROM ruby:3.3-slim-bullseye

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Rubyバンドラーを更新し、Jekyllをインストールする
RUN gem update bundler && gem install bundler jekyll

# コンテナに接続して、下記を実行すると http://127.0.0.1:4000// でサイトが確認できる
# bundle exec jekyll serve --trace