#!/bin/zsh
# ダブルクリックで編集画面を開く。このウィンドウを閉じると編集画面も終了します。
cd "${0:A:h}"  # デスクトップのショートカットから開いても、本体のフォルダで動かす
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
URL="http://localhost:4321/__editor/"
if curl -s -o /dev/null "$URL"; then
  open "$URL"
  exit 0
fi
(sleep 1.5 && open "$URL") &
echo "編集画面を起動しています… 終わるときはこのウィンドウを閉じてください。"
node build.mjs --serve
