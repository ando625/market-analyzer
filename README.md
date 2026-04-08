# 📚 Market Analyzer

**書籍市場の価格・評価データをスクレイピングしてリアルタイム分析するWebアプリ**

> Next.js × Laravel × Python(FastAPI)

---


## アプリの概要

このアプリを一言で言うと、**「Pythonが自動で本屋を巡回して、価格・評価データを収集・分析してくれる市場分析ツール」**です。

スクレイピング学習用の練習サイト  [books.toscrape.com](https://books.toscrape.com/) 
から書籍データを自動収集し。Next.js(フロントエンド)・Laravel(バックエンド)・Python(FastAPI)の３構成で構築。
カテゴリ別の平均価格・在庫数・評価をグラフで可視化し、**「評価が高くて価格が安い掘り出し物カテゴリ」**を自動で抽出して表示します。



https://github.com/user-attachments/assets/4a289359-e483-43a9-b0c9-10eb947a8a3d

---

### **## 開発の背景**

**「技術だけでなく、ネット上のルールとマナーを学ぶ」**

最初は有名な通販サイトなどで練習しようと考えましたが、調べていくうちに、多くのサイトがスクレイピングを厳しく禁止している理由に突き当たりました。単に「データを持っていくから」だけではない、深い理由を学びました。

* **ライバルの偵察を防ぎたい（営業秘密）**:
    苦労して集めた商品リストや、絶妙なタイミングで変えている価格設定は、そのお店にとって大事なものです。それをプログラムで一瞬で丸裸にされるのは、ライバルに手の内をすべて明かすようなもので、商売上の大きなダメージになる。
* **お店の入り口を塞がない（サーバー負荷）**:
    プログラムが猛スピードでアクセスすると、人間のお客さんがサイトに入れなくなったり、最悪の場合はお店自体がパンクして休業状態（サーバーダウン）になってしまう。
* **法律やルールの尊重**:
    サイトごとの「利用規約」や著作権を正しく理解し、守ることは、エンジニアとして最も大切なマナーだと気づきました。

そのため、今回は「スクレイピングの練習用に公開されている専用サイト」を対象に開発を行いました。

その上で、スクレイピング練習を明示的に許可しているサイト [books.toscrape.com](https://books.toscrape.com/) を使い、実際にデータを収集・分析するアプリを構築しました。

---

## こだわったポイント
 
### 1. 役割分担を明確にした3層設計
「誰が何をするか」を明確に分けています。Pythonがスクレイピング、LaravelがDBへの保存と統計計算、Next.jsがグラフ表示という役割分担。

### 2. 1時間ごとの自動スクレイピング（バックグラウンド処理）
Pythonの `threading` を使い、FastAPIが起動した瞬間からバックグラウンドで1時間ごとに自動収集が動き続けます。ユーザーがボタンを押さなくても常に最新データを保てる仕組みです。
 
### 3. Jaccard係数ではなく統計演算でデータ分析
カテゴリごとの平均価格・最高値・最安値・平均評価・在庫数をLaravelのDB集計で一括計算し、`stats`テーブルに保存。いつでも最新の統計を高速に取得できます。
 
### 4. 掘り出し物カテゴリの自動検出
「平均評価4以上 かつ 平均価格5,000円未満」のカテゴリを自動でフィルタリングして「本日の掘り出し物」として目立つ形で表示。データを単純に並べるだけでなく、**付加価値のある情報として加工する** 実装を学びました。
 
### 5. サーバーに優しいスクレイピング設計
カテゴリ間のリクエストに `time.sleep(0.1)` を入れ、相手サーバーへの負荷を軽減しています。スクレイピングのマナーを実装として表現しました。
 
### 6. Dockerによる3層環境の完全コンテナ化
nginx・PHP(Laravel)・MySQL・Next.js・Python(FastAPI)・phpMyAdminの6コンテナを1つの `docker-compose.yml` で管理。全員が同じ環境で動かせる「再現性の高い開発環境」を構築しました。
 
### 7. TypeScriptによる型安全な設計
APIから返ってくるデータ（Category・Stat等）に対して厳密な `interface` や `type` を定義。コンポーネント内でデータの形が明確になり、バグの少ない開発ができました。
 
### 8. upcによる重複なし保存設計
本のタイトルと価格から独自の商品コード（upc）を生成し、`updateOrCreate` を使って同じ本が二重に保存されない仕組みを実装しました。

---

## 苦労した点・学んだこと
 
### スクレイピングの倫理と法律
最初は「データを取ってくるだけ」と気軽に考えていましたが、多くのサイトがrobots.txtや利用規約でスクレイピングを禁止していることを学びました。サーバー負荷・著作権・利用規約を確認してから実装することの大切さを体感しました。
 
### Dockerによる多層環境の構築
フロント・バック・DB・スクレイピング・nginxの5コンテナを1つのDockerネットワークで共存・通信させる設定に苦労しましたが、「コンテナ名でホストを指定できる」ことを理解し解決しました（例：`http://python:8000`、`http://nginx/api/scrape-market`）。
 
### TypeScriptの型定義
APIから返ってくるデータに対して厳密な `interface` や `type` を定義することで、「どんなデータが流れてくるか」が明確になり、バグの少ない開発ができました。最初は型エラーに苦戦しましたが、型をしっかり決めることの大切さを体感しました。
 
### DB保存のトランザクション
スクレイピングで取得したデータをDBに保存する際、途中でエラーが起きると「半分だけ保存された壊れたデータ」になる危険があります。`DB::transaction` を使い「全部成功か、全部失敗か」を保証する実装を学びました。


---
 
## 主な機能
 
| 機能名 | 内容 |
|--------|------|
| 全カテゴリスクレイピング | ボタン押下またはバックグラウンドで books.toscrape.com の全カテゴリを自動巡回 |
| 統計自動計算 | カテゴリ別の平均価格・最高値・最安値・在庫数・平均評価を自動集計して保存 |
| グラフ表示（3種） | 平均価格・在庫数・平均評価をカテゴリ別棒グラフで可視化 |
| 掘り出し物カテゴリ自動検出 | 評価4以上 かつ 平均価格5,000円未満のカテゴリを自動抽出して表示 |
| カテゴリカード一覧 | 全カテゴリの統計情報をカード形式で一覧表示 |
| 商品一覧取得 | 特定カテゴリの全書籍データをAPI経由で取得可能 |
| 商品削除 | 不要なデータをID指定で削除可能 |
| 1時間ごと自動更新 | Python側でバックグラウンドスレッドが1時間ごとにLaravelのスクレイピングAPIを自動呼び出し |
 
---
 
## 使用技術
 
| カテゴリ | 技術 | 用途 |
|----------|------|------|
| フロントエンド | Next.js 15+ (App Router) | UI・ルーティング |
| | TypeScript | 型安全な開発 |
| | Tailwind CSS | スタイリング |
| | React Hooks (useState, useEffect) | 状態管理 |
| | Axios | API通信 |
| | Recharts | グラフ表示 |
| | Lucide React | アイコン |
| バックエンド | Laravel 12 / PHP 8.4 | REST API・DB操作・統計計算 |
| スクレイピング | Python 3.12 / FastAPI | スクレイピングマイクロサービス |
| | Requests | HTTPリクエスト |
| | BeautifulSoup4 | HTMLパース |
| | threading | バックグラウンド自動更新 |
| インフラ・DB | MySQL 8.0 | データ保存 |
| | Docker / nginx 1.21.1 | コンテナ環境構築 |
| | phpMyAdmin | DB管理GUI |
| 開発ツール | GitHub | バージョン管理 |
| | npm / composer | パッケージ管理 |
 
---
 
## データベース設計
 
### categoriesテーブル（カテゴリ情報）
 
| カラム名 | 型 | 詳細 |
|----------|----|------|
| id | BigInt | プライマリキー |
| name | string | カテゴリ名（例: Travel） |
| url | text | スクレイピング元URL |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |
 
### productsテーブル（書籍情報）
 
| カラム名 | 型 | 詳細 |
|----------|----|------|
| id | BigInt | プライマリキー |
| category_id | BigInt | 外部キー（categories.id） |
| title | string | 書籍タイトル |
| upc | string | 商品コード（重複禁止・独自生成） |
| price | integer | 価格（円換算済） |
| rating | integer | 評価（1〜5の星の数） |
| availability | string | 在庫状況（例: In stock） |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |
 
### statsテーブル（カテゴリ統計）
 
| カラム名 | 型 | 詳細 |
|----------|----|------|
| id | BigInt | プライマリキー |
| category_id | BigInt | 外部キー（categories.id） |
| average_price | integer | カテゴリ内平均価格（円） |
| total_count | integer | カテゴリ内書籍総数 |
| max_price | integer | カテゴリ内最高価格（円） |
| min_price | integer | カテゴリ内最安価格（円） |
| average_rating | float | カテゴリ内平均評価（1〜5） |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |
 
---
 
## ディレクトリ構成
 
```
price-tracker/
├── .env                        ← DB設定・プロジェクト全体の環境変数
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker/
│   ├── nginx/
│   │   └── default.conf        ← Laravelへのリクエスト転送設定
│   ├── php/
│   │   ├── Dockerfile          ← PHP 8.4-fpm
│   │   └── php.ini
│   ├── mysql/
│   │   ├── my.cnf
│   │   └── data/               ← DBデータ（gitignore済み）
│   ├── next/
│   │   └── Dockerfile          ← node:20-alpine
│   └── python/
│       ├── Dockerfile          ← python:3.12-slim
│       └── requirements.txt
├── laravel/                    ← Laravel 12（バックエンド）
│   └── .env                    ← Laravel用（DB接続・APP_KEY）
├── frontend/                   ← Next.js 15+（フロントエンド）
│   └── .env.local              ← Next.js用（API URL）
└── python/                     ← FastAPI（スクレイピングサービス）
    ├── main.py
    ├── requirements.txt
    └── .env                    ← 環境変数（空ファイル）
```
 
---
 
## セットアップ方法
 
### 前提条件
 
- Docker / Docker Compose がインストール済みであること
- Node.js 20以上がインストール済みであること
 
---
 
### 手順1 : リポジトリをクローン
 
```bash
git clone git@github.com:ando625/market-analyzer.git
cd market-analyzer
```
 
---
 
### 手順2 : node_modules と .next を削除する
 
> ⚠️ この手順はクローン直後に必ず実行してください。
> MacとDockerコンテナではCPUの種類が異なるため、Mac上に残った `node_modules` をそのままDockerで使うとエラーが起きます。
> コンテナ起動時に自動で正しいものが入るので、先に削除しておく必要があります。
 
```bash
rm -rf frontend/node_modules
rm -rf frontend/.next
```
 
---
 
### 手順3 : プロジェクトルートに .env を作成
 
```env
DB_ROOT_PASSWORD=rootpassword
DB_DATABASE=price_tracker_db
DB_USERNAME=tracker_user
DB_PASSWORD=tracker_pass
```
### pythonフォルダの中にも .env ファイルを作成
---
 
### 手順4 : Dockerコンテナを起動
 
```bash
docker compose up -d --build
```
 
---
 
### 手順5 : Laravel の初期設定
 
```bash
# phpコンテナに入る
docker compose exec php bash
 
# .envをコピーして編集
cp .env.example .env
```
 
`.env` を開き、以下のDB設定に書き換えてください。
 
```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=price_tracker_db
DB_USERNAME=tracker_user
DB_PASSWORD=tracker_pass
```
 
続けて以下のコマンドを実行します。
 
```bash
composer install
```

```
php artisan key:generate
```

```
php artisan migrate:fresh
```
 
---
 
### 手順6 : Next.js の初期設定
 
`frontend` フォルダ直下に `.env.local` を新規作成し、以下を書き込んでください。
 
```env
NEXT_PUBLIC_API_URL=http://localhost/api
```


> ⚠️ **`npm install` は絶対にやらないでください（Mac・Windows・Linux共通）**
> `docker-compose.yml` の `command` でコンテナ起動時に自動で実行されます。
> Mac上やWindows上で手動で実行すると、OS用のパッケージが入ってしまい
> DockerのLinux環境で動かなくなります。

~~cd frontend~~
~~npm install~~

---
### 手順7 : アクセス確認
 
| サービス | URL |
|----------|-----|
| フロントエンド（Next.js） | http://localhost:3000 |
| バックエンドAPI（Laravel） | http://localhost:80 |
| DB管理画面（phpMyAdmin） | http://localhost:8080 |
| スクレイピングサーバー（FastAPI） | http://localhost:8001 |
 
---
 
### 手順8 : データを取得する
 
ブラウザで http://localhost:3000 を開き、**「市場分析を開始する」ボタン** を押すと全カテゴリのスクレイピングが始まります。
 
> ⚠️ 初回はすべてのカテゴリを巡回するため、数分かかります。  
> ✅ Pythonコンテナが起動してから約15秒後に、バックグラウンドでも自動的に最初のスクレイピングが始まります。
 

---
 
## API一覧
 
| メソッド | エンドポイント | 内容 |
|----------|---------------|------|
| GET | `/api/categories` | カテゴリ一覧と最新統計を取得 |
| GET | `/api/categories/{id}/products` | 指定カテゴリの書籍一覧を取得 |
| POST | `/api/scrape-market` | 全カテゴリのスクレイピングを実行 |
| DELETE | `/api/products/{id}` | 指定IDの書籍を削除 |
 
---
 
## スクレイピング先について
 
このアプリは **スクレイピング練習を明示的に許可している** 以下のサイトのみを対象にしています。
 
- [books.toscrape.com](https://books.toscrape.com/) — スクレイピング学習専用の架空書店サイト
 
> ⚠️ 一般のWebサイトへのスクレイピングは、利用規約・robots.txt・著作権法に違反する可能性があります。  
> 実務でスクレイピングを行う場合は、必ず対象サイトの利用規約を確認してください。
