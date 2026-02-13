---
layout: post
title: "教育版マインクラフト専用サーバーのDocker環境を構築しました"
date: 2026-02-13
slug: minecraft-education-server-docker
categories: [開発, インフラ]
tags: [Minecraft, Docker, 教育版マインクラフト, サーバー構築, NAS, VPN]
description: "教育版マインクラフト専用サーバーをDockerでコンテナ化し、複数ワールドの同時運用やVPN経由のインターネット公開を実現した技術的な取り組みを紹介します。"
---

## 教育版マインクラフト専用サーバーのDocker環境

![教育版マインクラフトのサーバー一覧画面](/assets/images/blog/2026-02-13-minecraft-education-server-docker/server-list.webp){:class="img-fluid d-block mx-auto"}

教育版マインクラフト（Minecraft Education Edition）の専用サーバーをDockerコンテナ化し、複数ワールドの同時運用・自動更新・リモートアクセスに対応した環境を構築しました。

### サーバーもクライアントも「ベータ版/Preview版」のみ

2026年2月現在、教育版マインクラフトの専用サーバー（Dedicated Server）は**ベータ版しか提供されていません**。また、このサーバーに接続するには**クライアント側もPreview版が必要**です。Microsoftから正式版のリリース時期は公表されておらず、機能や仕様が予告なく変更される可能性があります。

本記事の内容もベータ版をベースとしているため、将来のアップデートで動作が変わる場合がある点にご注意ください。このような不安定さも、Docker化して環境を管理しやすくしておく動機のひとつです。

---

## コンテナ設計

Ubuntu 22.04をベースに、MCEEサーバーの実行に必要な最小限の依存関係を含むDockerイメージを構築しています。

```dockerfile
# ベースイメージ
FROM ubuntu:22.04

# ランタイム依存関係
RUN apt-get install -y libcurl4 openssl ca-certificates procps jq wget unzip

# セキュリティ: 非rootユーザーで実行
RUN useradd -m minecraft
USER minecraft
```

セキュリティ上の配慮として、サーバープロセスは専用の非rootユーザーで実行しています。

エントリーポイントスクリプトでは、起動時にMicrosoftの配布元からETag/Last-Modifiedを比較し、新バージョンがあればサーバーバイナリを自動ダウンロードします。また、SIGTERM/SIGINTをトラップしてワールドデータの保存を確実に行ってから終了するグレースフルシャットダウンを実装しています。

---

## 複数ワールドの同時運用

Docker Composeのオーバーライドファイルを使い、ワールドごとに独立したコンテナを起動します。

```yaml
# docker-compose.yml（ワールド1）
services:
  minecraft-edu-world1:
    build: .
    ports: ["19132:19132/udp"]
    volumes:
      - ./worlds/world1:/minecraft/world-data
      - ./sessions/world1:/minecraft/sessions
      - ./logs/world1:/minecraft/logs
    deploy:
      resources:
        limits:
          memory: 2g
          cpus: "2"
```

2つ目以降のワールドは、テンプレートファイルをコピーしてプレースホルダーを置換するだけで追加できます：

```bash
# テンプレートからワールド2用ファイルを作成
cp docker-compose.world.yml docker-compose.world2.yml
# {N}を2に置換

# 複数ワールドを同時起動
docker compose \
  -f docker-compose.yml \
  -f docker-compose.world2.yml \
  up -d
```

各ワールドのデータは完全に分離されているため、フォルダごとコピーすれば別のホストへそのまま移行できます。

---

## 3段階の設定フォールバック

複数ワールドを運用する際、共通設定とワールド固有設定を柔軟に管理するため、3段階のフォールバック構造を採用しています：

```
優先度1（最高）: ワールド固有設定    例: GAMEMODE_WORLD_1=survival
優先度2（中）:   共通デフォルト       例: GAMEMODE_COMMON=creative
優先度3（低）:   docker-compose.yml  例: creative
```

この仕組みにより、共通設定を一箇所で管理しつつ、特定ワールドだけ異なる設定にすることが簡単にできます。

設定項目と`server.properties`のマッピングはJSONファイルで宣言的に管理しています：

```json
{
  "server-port": { "env": "SERVER_PORT" },
  "level-name": { "env": "LEVEL_NAME" },
  "gamemode": { "env": "GAMEMODE" },
  "max-players": { "env": "MAX_PLAYERS" },
  "difficulty": { "env": "DIFFICULTY" }
}
```

---

## ネットワーク構成

教室に設置したNAS上のサーバーを、インターネットから接続可能にする構成です。

```
クライアント（インターネット）
    ↓ UDP
VPS（Oracle Cloud）
    ├─ iptables によるポートフォワーディング
    └─ Tailscale VPNオーバーレイ
    ↓
教室NAS（ASUSTOR）
    ├─ Tailscale IP
    ├─ Docker Engine
    └─ Minecraft Serverコンテナ
```

Tailscale VPNを使うことで、NAS側にグローバルIPがなくても、VPS経由で安全にサーバーを公開できます。

---

## Azure AD認証とDocker運用の注意点

教育版マインクラフトの専用サーバーは初回起動時にAzure AD認証が必要ですが、Docker化にあたって以下の点を考慮しています。

- **セッションの永続化**: 認証後のセッショントークンを`sessions/`ボリュームに保存しているため、コンテナを再作成しても再認証が不要
- **IP:ポートの固定が重要**: セッションはIP:ポートの組み合わせに紐づいているため、いずれかを変更すると再認証が必要になる。`.env`で明示的に固定しておくのが安全

---

## LoggiFlyによるリアルタイム通知

LoggiFlyを使い、サーバーイベント（プレイヤーの入退出など）をリアルタイムで通知する仕組みも構築しています。

```yaml
# loggifly/config.yaml
containers:
  minecraft-edu-world1:
    keywords:
      - regex: 'Player Spawned: (?P<player>.+?) xuid:'
        message_template: '{player}がワールドに参加しました'
      - regex: 'Player disconnected: (?P<player>[^,]+),'
        message_template: '{player}がワールドから退出しました'
      - 'Server started.'
```

LoggiFlyがキーワードを検知するとLINE等へ通知を送ることができます。家庭からサーバーに接続する場合、プレイヤーの入退出を保護者にLINE通知することを想定しています。

---

## 開発の背景

mmingでは、発達多様性のある子どもたちがプログラミングを学ぶ場として教育版マインクラフトを活用しています。

今後マインクラフトの大会への参加も視野に入れており、授業以外の時間にも作品制作に取り組める環境が必要になりました。また、学校の長期休みには授業の枠を超えて生徒同士が協働できる時間を作りたいと考えていました。

こうした背景から、家庭からでもサーバーに接続できる環境を構築することにしましたが、いくつかの課題がありました。教室のネットワーク環境ではポートの公開ができなくなったこと、そしてNASをインターネットに直接公開したくなかったことから、VPS経由のVPN構成を採用しています。

複数ワールドを運用する際の設定管理や、家庭から接続する場合の保護者への利用状況の共有も課題でした。

---

## 技術スタック

| コンポーネント | 技術 |
|---|---|
| コンテナ | Docker + Docker Compose |
| ベースOS | Ubuntu 22.04 |
| サーバー | Minecraft Education Edition Dedicated Server（Beta） |
| 設定管理 | 環境変数 + JSONマッピング |
| 監視 | LoggiFly |
| VPN | Tailscale |
| ホスト | ASUSTOR製NAS + Oracle Cloud VPS |

---

## 関連リンク

- [Minecraft Education Dedicated Server 公式情報](https://aka.ms/dedicatedservers){:target="_blank"}
- [Tailscale](https://tailscale.com/){:target="_blank"}
- [LoggiFly](https://github.com/clemcer/LoggiFly){:target="_blank"}
