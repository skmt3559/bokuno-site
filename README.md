# bokuno 会社サイト

髪質改善美容室 bokuno の会社サイトです。WordPress は使わず、`content/` のデータからページを組み立てます。
文章や店舗情報を変えるときは `content/` のファイルだけを直します。

## どこを直すか

| 変えたいもの | ファイル |
| --- | --- |
| 店舗の追加・変更・閉店、求人の募集中/停止 | `content/shops.json` |
| トップページの文章 | `content/home.json` |
| 髪質改善の説明 | `content/kaizen.json` |
| サービス・コース | `content/service.json` |
| 求人の説明・募集内容・応募先 | `content/recruit.json` |
| 会社概要 | `content/company.json` |
| お問い合わせの項目 | `content/contact.json` |
| メニュー、Instagram、都道府県の並び順、検索エンジンへの公開 | `content/site.json` |
| 写真 | `public/images/` に置き、各データの `image` に `/images/ファイル名` を書く |

`image` が空のところは、仮の色面が表示されます。
トップの動画は `public/videos/` に置き、`content/home.json` の `hero.video` で指定します。ロゴは `content/site.json` の `logo` です。
現在の写真・動画・ロゴは、旧サイト（bokuno-tuyatuya.com）に載っていたものを軽量化して入れています。

### 店舗データ（shops.json）

1店舗が1かたまりです。一覧・個別ページ・求人ページはすべてここから同じ型で作られます。

- `slug` … URL になる英字（`/shoplist/<slug>/`）。現行サイトと同じものを使っています
- `name` / `listName` … 正式名 / 一覧やメニューで使う短い名前
- `prefecture` … 都道府県（一覧のグループ分けに使用）
- `lead` `opened` `address` `access` `tel` `seats` `hours` `closed` … 空欄の項目はページに表示されません
- `reserveUrl` … 予約ボタンの行き先
- `mapEmbed` … Google マップの埋め込み URL
- `intro` `points` … その店舗だけのこだわり（任意）
- `recruiting` … `true` で求人ページ（`/recruit/<slug>/`）を作り、`false` で作りません

## 確認と公開

```bash
npm run dev
```

http://localhost:4321/ で確認できます（内容を直して再読み込みすれば反映されます）。

```bash
npm run build
```

`dist/` に完成したページが書き出されます。`main` に push すると GitHub Actions が同じ処理をして GitHub Pages に公開します
（リポジトリの Settings > Pages > Source を「GitHub Actions」にしておく必要があります）。

## 仮ページとしての注意

- `content/site.json` の `noindex` が `true` の間は、検索エンジンに載らない設定です。本公開のときに `false` にします。
- お問い合わせフォームは見た目だけで、送信機能はありません。
- 料金は掲載していません（`content/service.json` の `price` が空）。
