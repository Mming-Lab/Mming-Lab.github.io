---
layout: post
title: "教育版マインクラフト 禁止アイテム管理"
date: 2025-06-13
slug: minecraft-banned-items
categories: [MinecraftEducation]
tags: [教育版マインクラフト, 禁止アイテム, 設定方法]
redirect_from:
  - /banned_Item/
  - /banned_Item.html
  - /banned_Item
description: "教育版マインクラフトで禁止アイテムをconfig.jsで管理する方法を詳しく解説します。"
---

<!-- # 教育版マインクラフト 禁止アイテム管理 -->

config.jsで禁止アイテムをリスト管理します。  禁止されているアイテムの保持はできません。  

![禁止アイテム管理_サムネイル](/assets/images/blog/2025-06-24-minecraft-banned-items/00_禁止アイテム管理_サムネイル.png){:class="img-fluid d-block mx-auto"}

***

## 導入方法
1. ダウンロードした「禁止アイテム管理.mcpack」ファイルを選択し、右クリックします。
    コンテキストメニューから[プログラムから開く] -> [Minecraft Education]を選択します。
    ![01_プログラムから開く](/assets/images/blog/2025-06-24-minecraft-banned-items/01.png){:class="img-fluid d-block mx-auto"}
1.  Minecraft Educationが立ち上がり、インポートが完了したことを確認してください。
    ![02_インポート](/assets/images/blog/2025-06-24-minecraft-banned-items/02.png){:class="img-fluid d-block mx-auto"}

***

## 使用方法

### ワールドに適用

1. ワールドの設定画面を開きます。
1. 禁止アイテム管理を有効化します。  
   ![03_有効化](/assets/images/blog/2025-06-24-minecraft-banned-items/03.png){:class="img-fluid d-block mx-auto"}
1. 確認メッセージの[それでもパックを追加する]ボタンを押下します。  
   ![04_アップデート](/assets/images/blog/2025-06-24-minecraft-banned-items/04.png){:class="img-fluid d-block mx-auto"}

### config.jsの場所

config.jsはワールドフォルダの中にあります。

1. ワールドフォルダの見つけ方
    - ワールドフォルダのパスはデバイスによって違うので、下記リンクを参照してください。  
        [**ワールドフォルダのパス**](https://edusupport.minecraft.net/hc/en-us/articles/4404785703316-Location-of-World-Files){:target="_blank"}

    - [minecraftWorlds]フォルダ内にワールド単位のフォルダがありますが、フォルダ名からワールドは分かりません。  
        マイクラでワールドを実行するとフォルダの更新日時が変わるので、更新日時から対象を推測します。  
        推測したフォルダ内の「levelname.txt」ファイルでワールド名を確認します。

1. config.jsの場所  
    ワールドフォルダ内の「\behavior_packs\BannedItems\scripts\config.js」にあります。  
    ![05_パス](/assets/images/blog/2025-06-24-minecraft-banned-items/05.png){:class="img-fluid d-block mx-auto"}

### アイテムの追記の仕方

1. config.jsをテキストエディタで開きます。
1. 既存のアイテム名の下に1行追加します。  
    ![06_追記1](/assets/images/blog/2025-06-24-minecraft-banned-items/06.png){:class="img-fluid d-block mx-auto"}
1. 禁止したいアイテムを追加していきます。**<span style="color: #ff0000;">アイテム名は「"」で囲み、終わりに「,」が必要です</span>**。  
    ![07_追記2](/assets/images/blog/2025-06-24-minecraft-banned-items/07.png){:class="img-fluid d-block mx-auto"}
1. アイテム名は、コマンド入力時のオートコンプリートや、統合版マインクラフトの情報から調べてください。  
    ![08_アイテム名](/assets/images/blog/2025-06-24-minecraft-banned-items/08.png){:class="img-fluid d-block mx-auto"}
1. config.jsを保存します。

### 設定を反映

下記のいずれかの方法で設定が反映できます。

- ワールドを開き直す
- reloadコマンドを実行して、スクリプトを再読み込みする  
    ![09_reload](/assets/images/blog/2025-06-24-minecraft-banned-items/09_reload.png){:class="img-fluid d-block mx-auto"}


***

##### 最後に

禁止アイテム管理を導入することで、子どもたちが安全で健全なデジタル環境の中で創造性を発揮できる場を提供できます。これにより、学習内容に集中し、協調性や問題解決能力を育む活動を促進できます。

ぜひ、このツールを活用して、生徒やお子さまたちがより豊かな学びの体験を享受できるようサポートしてください。皆さまの指導と見守りが、未来の可能性を広げる大きな力となります。