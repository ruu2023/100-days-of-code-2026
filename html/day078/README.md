# Day078

JSON を整形・色付け表示するツールです。

## Files

- `index.html`: JSON プレティPrinter（HTML 1ファイル）

## Usage

1. `cd html/day078 && python3 -m http.server 8000`
2. `http://localhost:8000` を開く
3. textarea に JSON を貼り付け、「整形」ボタンをクリック

## Features

- 整形されていない JSON を貼り付けてボタンを押すと、整形・色付け表示
- コピー機能
- 無効な JSON はエラー表示
