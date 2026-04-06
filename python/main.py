from fastapi import FastAPI, HTTPException
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel
import re
import time
import threading

app = FastAPI()


#練習サイトのベースURL
BASE_URL = "https://books.toscrape.com/"

@app.post("/scrape-all")
def scrape_all_market_data():
    try:
        # トップページにアクセスして「カテゴリ一覧」を取得
        response = requests.get(BASE_URL, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # サイドバーにあるカテゴリリンクを全て探して取得
        category_tags = soup.select(".side_categories ul li ul li a")
        
        all_categories_data = []
        
        #各カテゴリのページを順番に巡回する
        for tag in category_tags:
            cat_name = tag.get_text().strip()
            cat_url = BASE_URL + tag['href']
            
            books_in_category = []
            
            #カテゴリの１ページ目にアクセスして解析
            cat_response = requests.get(cat_url, timeout=10)
            cat_soup = BeautifulSoup(cat_response.text, 'html.parser')
            
            #そのカテゴリにある本を全て探す
            book_elements = cat_soup.select(".product_pod")
            
            for book in book_elements:
                title = book.h3.a["title"]
                
                # 価格取得（£マークを消して数字だけにする）
                price_text = book.select_one(".price_color").get_text()
                # 実務的な工夫：ポンドを円に換算（1ポンド200円計算）
                price_val = int(float(re.sub(r'[^\d.]', '', price_text)) * 200)
                
                #星の数（評価）取得
                rating_tag = book.select_one("p.star-rating")
                rating = 0
                
                if rating_tag:
                    classes = rating_tag.get('class', [])
                    
                    if "Five" in classes: rating = 5
                    elif "Four" in classes: rating = 4
                    elif "Three" in classes: rating = 3
                    elif "Two" in classes: rating = 2
                    elif "One" in classes: rating = 1
                
                #在庫状況
                availability = book.select_one(".availability").get_text().strip()
                
                upc = re.sub(r'[^\w]', '', title)[:10] + str(price_val)
                
                #１冊分のデータを追加
                books_in_category.append({
                    "title": title,
                    "price": price_val,
                    "rating": rating,
                    "availability": availability,
                    "upc": upc
                })
            
            #カテゴリごとのデータをまとめる
            all_categories_data.append({
                "name": cat_name,
                "url": cat_url,
                "books": books_in_category
            })
            
            #相手のサーバーに負担をかけないように0.1秒入れる
            time.sleep(0.1)
        #Laravelが受け取る形で返す
        return {"categories": all_categories_data}
    
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pythonクローラエラー: {str(e)}")
    
    
# --- 自動更新タイマーの魔法 ---

def schedule_scrape():
    print("📢 自動分析スレッドがバックグラウンドで開始されました。")
    
    # 最初の10秒間は、コンテナ全体が落ち着くまで待つ
    time.sleep(15)
    
    while True:
        print("⏰ 【自動分析】タイマー発動中...", flush=True)
        try:
            # 💡 http://php/ はDocker内のLaravelを指します
            response = requests.post("http://nginx/api/scrape-market", timeout=310)
            if response.status_code == 200:
                print("✅ 【自動分析】成功！Laravelのデータを更新しました。")
            else:
                print(f"⚠️ 【自動分析】失敗。Laravelがエラーを返しました: {response.status_code}")
        except Exception as e:
            print(f"❌ 【自動分析】エラーが発生しました: {e}")
            
        print("💤 次の実行まで1時間スリープします...")
        time.sleep(3600) 

# --- FastAPI起動時の儀式 ---

@app.on_event("startup")
def startup_event():
    # アプリが起動した時に別スレッドでタイマーを動かす
    print("📢 システム起動：自動分析スレッドをバックグラウンドで開始します。")
    thread = threading.Thread(target=schedule_scrape, daemon=True)
    thread.start()


@app.get("/")
def read_root():
    return {"message": "Python Scraping API with Translation is running!"}


