<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// AppServiceProvider は 「アプリ全体のルール（設定）を書く場所」 。
// ScraperService は 「Pythonと通信するという具体的なスキル（実務）を書く場所」
// Laravelハスレイピングをしないので（処理をするわけではない）Pythonにお願いしている

class ScraperService
{
    /**
     * Pythonに「スクレイピングして！市場全体のデータを一気に取ってきて！」とお願いする命令文
     * URLを受け取ってスクレイピングを依頼する関数
     */
    public function fetchFullMarketData()
    {
        //コンピュータに「相手（Python)は同じ Docker 内のここにいると教えている
        $pythonUrl = 'http://python:8000/scrape-all';

        try{
            //このURLをPythonに送ってスクレイピングして
            $response = Http::timeout(300)->post($pythonUrl);

            //もしエラーだったら
            if($response->failed()){
                Log::error('市場データの取得に失敗しました:' .$response->body());
                return null;
            }

            return $response->json();
        }catch(\Exception $e){
            Log::error('Pythonコンテナに接続できませんでした:' . $e->getMessage());
            return null;
        }

    }
}
