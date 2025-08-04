---
layout: post
title: "Minecraft Bedrock MCP Server を開発しました"
date: 2024-08-04
slug: minecraft-bedrock-mcp-server
categories: [開発]
tags: [Minecraft, TypeScript, MCP, WebSocket, オープンソース]
description: "Minecraft Bedrock EditionをWebSocket経由で制御するMCP（Model Context Protocol）サーバーを開発・公開しました。"
---

## Minecraft Bedrock MCP Server

Minecraft Bedrock EditionとEducation EditionをWebSocket経由で制御できるMCP（Model Context Protocol）サーバーを開発しました。

### [GitHub リポジトリ](https://github.com/Mming-Lab/minecraft-bedrock-mcp-server){:target="_blank"}

---

## 主な機能

### コア機能
- **安定したWebSocket接続**: Minecraftとの安定した通信
- **包括的な制御ツール**: プレイヤー、ワールド、ブロック、カメラの操作
- **高度な建築ツール**: 立方体、球体、複雑な幾何学形状の構築
- **Minecraft Wiki検索**: ゲーム内情報の検索機能
- **シーケンス実行**: 複数コマンドの連鎖実行

### 技術仕様
- **言語**: TypeScript（完全実装）
- **互換性**: Claude Desktopやその他のMCPクライアント
- **要件**: Node.js 16+、チート機能有効化されたMinecraft
- **ライセンス**: GPL-3.0（オープンソース）

---

## インストール・設定方法

### 1. 前提条件
- Node.js 16以上
- チート機能が有効化されたMinecraft Bedrock/Education Edition
- MCPクライアント（Claude Desktopなど）

### 2. サーバーのインストール

```bash
git clone https://github.com/Mming-Lab/minecraft-bedrock-mcp-server.git
cd minecraft-bedrock-mcp-server
npm install
npm run build
```

### 3. Minecraft側の設定

1. チート機能有効でワールドを作成
2. ゲーム内で接続コマンドを実行:
   ```
   /connect localhost:8001/ws
   ```

### 4. Claude Desktopでの設定

`claude_desktop_config.json`に以下を追加:

```json
{
  "mcpServers": {
    "minecraft-bedrock": {
      "command": "node",
      "args": ["C:/path/to/minecraft-bedrock-mcp-server/dist/server.js"]
    }
  }
}
```

**パスの確認方法:**
- Windows: プロジェクトフォルダで `pwd` コマンドまたはアドレスバーで確認
- Mac/Linux: プロジェクトフォルダで `pwd` コマンドで確認
- 例: `C:\Users\username\minecraft-bedrock-mcp-server\dist\server.js`

### 5. サーバー起動

```bash
npm start
```

設定完了後、Claude DesktopからMinecraftを制御できるようになります。

---

## 開発の背景

教育現場でのMinecraft活用において、より柔軟で プログラマブルなインターフェースが必要だと感じていました。このMCPサーバーにより、Minecraftの操作を自動化・効率化できるようになります。

特に発達多様性のある子どもたちの学習支援において、反復的な作業を自動化することで、より創造的な活動に集中できる環境を提供したいと考えています。

---

## オープンソース公開

このプロジェクトはGPL-3.0ライセンスでオープンソース公開しています。教育現場での活用や、さらなる機能拡張への貢献を歓迎します。

技術的な質問やフィードバックがございましたら、GitHubのIssuesでお気軽にお声がけください。