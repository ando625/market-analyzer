<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;

// 商品一覧
Route::get('/categories', [ProductController::class, 'index']);
// 特定のカテゴリ全件取得
Route::get('/categories/{id}/products', [ProductController::class, 'categoryProducts']);
// 価格更新（個別にスクレイピング）
Route::post('/scrape-market', [ProductController::class, 'scrapeMarket']);
// 削除
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
