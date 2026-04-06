<?php

use Illuminate\Support\Facades\Route;
use App\Services\ScraperService;

Route::get('/', function () {
    return view('welcome');
});

// 2. ブラウザで「/test-scrape」という住所にアクセスが来た時のルールを決めます
Route::get('/test-scrape', function (ScraperService $scraper) {

    // 3. 調査したいWebサイトのURLを決めます（今回は例としてGoogle）
    $targetUrl = 'https://www.google.com';

    // 4. コンピュータに「職人の $scraper さん、このURLを調べて結果を持ってきて！」と命令しています
    $result = $scraper->requestScrape($targetUrl);

    // 5. もし結果が空っぽ（null）だったら、「失敗しちゃった」と画面に出します
    if (!$result) {
        return "スクレイピングに失敗しました。Pythonコンテナが動いているか確認してね！";
    }

    // 6. うまくいったら、Pythonから届いた結果をそのまま画面に表示します
    return $result;
});
