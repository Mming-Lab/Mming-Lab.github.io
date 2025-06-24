# mming プログラミング教室サイト用 開発コンテナ

FROM ruby:3.3.4-slim

# 作業ディレクトリ設定
WORKDIR /workspace

# 環境変数設定
ENV JEKYLL_ENV=development
ENV BUNDLE_PATH=/usr/local/bundle

# システムパッケージ更新と開発ツールインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    wget \
    vim \
    nano \
    zsh \
    sudo \
    nodejs \
    npm \
    procps \
    && rm -rf /var/lib/apt/lists/*

# ユーザー作成（VS Code接続用）
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Bundlerインストール
RUN gem install bundler

# 開発用設定
USER $USERNAME

# ポート公開
EXPOSE 4000 35729

# 起動時はshellを保持
CMD ["sleep", "infinity"]