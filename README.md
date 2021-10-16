# FCSEditor for IM-FormaDesigner

## 概要

intra-martの[IM-FormaDesigner](https://document.intra-mart.jp/library/forma/public/forma_appli_maker_guide/overview_of_forma_designer/overview_of_forma_application.html) のエクスポートファイル(zip)から  
カスタムスクリプトのソースコードや説明、条件などを読み込み
ツリービューでソースコードの確認や編集ができるエディタです。 

IM-FormaDesignerで登録したカスタムスクリプト数が膨大になってくると、調査時や改修時に一つ一つのWeb画面から定義を開いて
作業するのが辛いので、Electron + Angularの勉強がてら作成してみました。 


![FCSEditor操作イメージ](https://github.com/rinne-grid/fcs-editor/blob/main/fcs-editor.gif)


## アプリのダウンロード・インストール

[リリースページ](https://github.com/rinne-grid/fcs-editor/releases)からダウンロードできます

* Windows
  * fcs-editor.Setup.x.x.x.exeを見つけてダウンロードします
* macOS
  * fcs-editor-x.x.x.dmgを見つけてダウンロードします

## アプリ操作方法

1. [Forma定義を開く]ボタンもしくは[ファイル]->[zipファイルを開く]メニュークリックします
2. IM-FormaDesignerからエクスポートしたzipファイルを選択します
3. zip内容を元に、アプリにツリーが表示され、各カスタムスクリプトの編集ができます
4. ツリーをたどり、編集したいカスタムスクリプトを開き、編集を行います
5. 変更後、[Ctrl+S]もしくは[ファイル]->[zipファイルにエクスポート]メニューをクリックすると、変更内容を反映したzipファイルとして保存することができます
6. 保存したzipファイルをIM-FormaDesignerでインポートします

* sample_appフォルダにサンプルのForma定義を配置してますので、試しに使ってみる場合はこちらをご利用ください。


## デフォルトのインストール先

* インストール時に指定できますが、変更しない場合は以下になります
  * ```%USERPROFILE%\AppData\Local\Programs\fcs-editor```
  * ```%USERPROFILE%\AppData\Local\Programs\fcs-editor\tmp```にzipファイルの展開・保存用のフォルダがあります。定義が多くなってきたら、このフォルダ内のファイルを削除すると容量削減ができます

## Tips

* [ツール]->[カスタムスクリプトをファイルとしてエクスポート]メニューをクリックすると、zipファイルに含まれる全てのカスタムスクリプト(ボタンイベントやスクリプトアイテム含む)をファイルとして出力できます。
* 実験的機能として、カスタムスクリプト全体の検索・置換機能がついています
  * 検索: [Ctrl+Shift+F]
  * 置換: [Ctrl+Shift+H]

## License

MIT


## 開発する時

|ソフトウェア|バージョン|
|---|---|
|Node.js|v14.15.1|


### セットアップ

```
# Node.jsをインストールした上で実行
$ git clone https://github.com/rinne-grid/fcs-editor
$ cd fcs-editor
$ npm i
```

### 開発モードで実行
```
$ npm start
```

### アプリのビルド
```
$ npm run electron:build
```

## 作者について

[@rinne_grid](https://twitter.com/rinne_grid)



## 注意事項

このアプリケーションを利用したことによって発生した障害等について、一切責任を負いません。
編集前のzipファイルのバックアップを保持しておくことを強くおすすめします。
