---
layout: post
title: "BikeToKey: フィットネスバイクでゲームを操作できるツールを公開しました"
date: 2026-01-03
slug: bike-to-key
categories: [開発, 教材]
tags: [Node-RED, Bluetooth, FTMS, Minecraft, 健康教育, STEM教育, オープンソース]
description: "BLEフィットネスバイクの運動データをキーボード入力に変換するツール「BikeToKey」を公開しました。バイクを漕ぐだけでゲームやアプリを操作でき、運動とデジタル学習を両立できます。"
---

## フィットネスバイクでゲームを操作

mmingが開発したフィットネスバイクの運動データをキーボード入力に変換する汎用ツール「BikeToKey」をGitHubで公開しました。

バイクを漕ぐだけで、パソコン上のゲームやアプリケーションを操作できます。キーボード入力を受け付けるあらゆるソフトウェアで使用可能です。

**[GitHubで見る](https://github.com/Mming-Lab/bike-to-key){:target="_blank"}**

---

## 主な特徴

### 🚴 回転数に応じた自動キー入力

バイクの回転数(RPM)を検出して、速度に応じたキーボード入力を自動的に行います。デフォルトでMinecraft Education Edition向けに設定されています：

- **速く漕ぐ (>55rpm)**: ダッシュ（W + Ctrl キー）
- **普通に漕ぐ (1-55rpm)**: 前進（W キー）
- **停止 (<1rpm)**: 停止（キーを離す）

### 🎮 幅広い対応アプリケーション

キーボード操作できるアプリケーションなら何でも使用可能です。ゲームだけでなく、学習ソフトウェアやプレゼンテーションツールなど、様々な用途に活用できます。

### 🔧 自由なカスタマイズ

キー割り当てや速度設定を自由にカスタマイズできます。用途に応じて最適な設定に調整可能です。

### 📡 ワイヤレス接続

Bluetooth接続によるワイヤレス通信で、設置場所を選びません。

---

## 技術仕様

### FTMS対応

FTMS (Fitness Machine Service) は、フィットネス機器のBluetooth標準プロトコルです（UUID: 1826）。FTMS対応のBLEフィットネスバイクから以下のデータを取得できます：

- 速度
- 回転数（RPM）
- 距離
- パワー
- 消費カロリー
- 経過時間

### 使用技術

- **Node-RED**: ビジュアルプログラミングツールでフローを構築
- **RobotJS**: キーボード入力シミュレーション
- **Bluetooth LE**: FTMS経由でのデータ取得

---

## 必要なもの

### ハードウェア

- FTMS対応のBLEフィットネスバイク
- Bluetooth 4.0以上対応のPC

### ソフトウェア

- Node.js
- Node-RED

---

## 使い方

1. バイクの電源をON
2. Minecraftを起動してワールドに入る
3. Node-REDで [開始] ボタンをクリック
4. バイクを漕ぐ

詳しいセットアップ方法はGitHubリポジトリのREADMEをご覧ください。

---

## 開発の背景

### 動きながら考える子どもたち

ADHD特性のある子どもの中には、座ってじっとしているより、体を動かしている方が集中できる子がいます。

教育現場でも、「動きながら学習する」アプローチの有効性が報告されています：

- 歩きながら音読や暗記をする
- 立って勉強する
- 短時間（5-10分）集中して、動く休憩を挟む

これは単なる「落ち着きのなさ」ではなく、脳の特性によるものです。

### 研究で分かっていること

米国の研究で、体を動かすこと（フィジェッティング：そわそわ動くこと）がADHD児の集中力を高めることが報告されています（[NPR教育](https://www.npr.org/sections/ed/2015/05/14/404959284/fidgeting-may-help-concentration-for-students-with-adhd){:target="_blank"}、[UC Davis](https://health.ucdavis.edu/news/headlines/does-fidgeting-help-people-with-adhd-focus-/2024/10){:target="_blank"}）。

BikeToKeyは、この「動きながら集中できる」特性を活かして、好きなゲームに没頭しながら自然に運動できるツールです。「じっと座って勉強しなさい」ではなく、「動きながら集中する」環境を作ることで、発達特性のある子どもたちの学びを支援します。

---

## ライセンス

BikeToKeyはMITライセンスで公開しています。教育現場や個人利用など、自由にご活用ください。

---

## 関連リンク

### BikeToKey
- [BikeToKey GitHubリポジトリ](https://github.com/Mming-Lab/bike-to-key){:target="_blank"}

### その他のmming開発プロジェクト
- [Minecraft Bedrock MCP Server](https://mming-lab.github.io/posts/minecraft-bedrock-mcp-server/){:target="_blank"}
- [教育版マインクラフト用MakeCode拡張機能](https://mming-lab.github.io/posts/minecraft-makecode-extensions/){:target="_blank"}

### 参考情報
- [Node-RED公式サイト](https://nodered.org/){:target="_blank"}
- [FTMS仕様（Bluetooth SIG）](https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0/){:target="_blank"}
