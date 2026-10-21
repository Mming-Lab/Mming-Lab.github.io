---
layout: post
title: "教育版マインクラフトをビジュアルフローで動かすノード集を公開しました"
date: 2026-10-20
slug: flyde-minecraft-bedrock
categories: [開発]
tags: [Minecraft, 教育版マインクラフト, Flyde, ビジュアルプログラミング, オープンソース]
description: "教育版マインクラフト／統合版を、ノードをつないで操作できるようにするノード集「flyde-minecraft-bedrock」を公開しました。ビジュアルフロープログラミングの Flyde 上で動きます。"
---

![Flydeでノードをつないでマインクラフトを操作している画面](/assets/images/blog/2026-10-20-flyde-minecraft-bedrock/screenshot.webp){:class="img-fluid d-block mx-auto"}

教育版マインクラフト（Minecraft Education Edition）と統合版（Bedrock Edition）を、**ノードをワイヤーでつなぐだけで操作できる**ノード集を公開しました。ビジュアルフロープログラミングの [Flyde](https://github.com/flydelabs/flyde) 上で動きます。

**[GitHub で見る](https://github.com/Mming-Lab/flyde-minecraft-bedrock){:target="_blank"}**

## 何ができるか

プレイヤーの行動やブロック・アイテムのイベントをきっかけにして、マインクラフト内でコマンドを実行したり、座標や状態を取り出したりするフローが作れます。

たとえば「ブロックを置いたら」「チャットで発言したら」といったイベントを入口にして、そこからワイヤーを伸ばして処理をつないでいく形です。コードを書く前の段階として、処理の流れそのものを目で見ながら組み立てられます。

含まれているノードは次のような種類です。

- 接続（サーバーへの接続・切断）
- プレイヤーイベント（チャット・移動・テレポート・参加・退出など）
- ブロックイベント（設置・破壊）
- アイテムイベント（使用・入手・クラフト・装備・精錬・取引）
- モブイベント（インタラクト・命中判定）
- ゲームプレイコマンド（コマンド実行・時刻・天気・エリア塗りつぶし）
- プレイヤーコマンド（座標・向き・ゲームモード取得、経験値、タグ管理など）
- エージェント操作（移動・採掘・設置・アイテム操作）
- スコアボード（得点・変数管理）
- 情報取得（エンティティ・プレイヤー・アイテム・ブロック・モブ・ワールドの状態）
- 座標演算（ベクトル演算・距離計算・補間・内積など）

## 多言語に対応しています

ノード名とポート名、それにマインクラフトのブロック・アイテム・モブの名前が
**29言語に対応**していて、コマンド1つでまとめて切り替えられます。

```bash
npm run lang -- ja_JP
```

日本語に切り替えると、ドロップダウンに出てくるブロック名やアイテム名も日本語になります。

## 必要なもの

- [VSCode](https://code.visualstudio.com/){:target="_blank"} と拡張機能の [Flyde](https://marketplace.visualstudio.com/items?itemName=flyde.flyde-vscode){:target="_blank"}
- Node.js（npm が使えること）
- 教育版マインクラフト または 統合版（WebSocket 接続が有効なもの）

リポジトリを取得して `npm install` し、そのフォルダを VSCode で開くだけで使えます。ビルドの手順はありません。詳しい手順は [USAGE.ja.md](https://github.com/Mming-Lab/flyde-minecraft-bedrock/blob/main/USAGE.ja.md){:target="_blank"} にまとめています。

## ライセンス

[PolyForm Noncommercial License 1.0.0](https://github.com/Mming-Lab/flyde-minecraft-bedrock/blob/main/LICENSE.md){:target="_blank"} です。個人・学校・公的機関など**非商用の利用であれば、期限なく無料**で使えます。商用利用はできません。

このツールを使った動画・配信・記事の制作は、収益化を含めて明示的に許可しています。差し支えなければ Mming Lab への言及をいただけると嬉しいです。

## 関連する公開物

ほかにも教育版マインクラフト向けのものをいくつか公開しています。

- [教育版マインクラフト用MakeCode拡張機能3種を公開しました](/blog/minecraft-makecode-extensions/)
- [Minecraft Bedrock MCP Server を開発しました](/blog/minecraft-bedrock-mcp-server/)
- [教育版マインクラフト専用サーバーのDocker環境を構築しました](/blog/minecraft-education-server-docker/)
