<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Stat;
use App\Services\ScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    // ScraperServiceをこのクラスの中で使えるように保持する入れ物
    // コンピュータに「ScraperServiceはずっと使うから手元に置いておいて」と命令
    public function __construct(
        private ScraperService $scraperService
    ) {}

    /**
     * カテゴリ一覧とそれぞれの統計を取得
     * GET /api/categories
     */
    public function index(): JsonResponse
    {
        //全てのカテゴリを最新の統計データ(stats)と一緒に取得
        $categories = Category::with(['stats' => function ($query){
            $query->latest()->limit(1);
        }])->get();

        // JSON形式で返す（200 = 成功のコード）
        return response()->json($categories, 200);
    }


    /**
     * 特定のカテゴリの商品を全件取得する
     * POST /api/categories/{id}/products
     */
    public function categoryProducts(int $id): JsonResponse
    {
        //指定されたカテゴリに属する本を全て取得
        $products = Product::where('category_id', $id)->get();

        return response()->json($products, 200);
    }

    /**
     * スクレイピングを実行してデータを保存・分析する
     * POST /api/scrape-market
     */
    public function scrapeMarket(Request $request): JsonResponse
    {
        //Pythonに「前カテゴリの情報を持ってきて」
        $marketData = $this->scraperService->fetchFullMarketData();

        if(!$marketData){
            return response()->json(['message' => "データ取得失敗"],500);
        }

        //データベースに保存 やるなら全部成功させる、ダメなら1つも保存しないDBを壊さない
        DB::transaction(function () use ($marketData){
            foreach ($marketData['categories'] as $catData){
                //カテゴリを保存（あれば取得、なければ作成
                $category = Category::updateOrCreate(
                    ['name' => $catData['name']],
                    ['url' => $catData['url']]
                );

                foreach ($catData['books'] as $book){
                    //本の情報を保存
                    $category->products()->updateOrCreate(
                        ['upc' => $book['upc']],
                        [
                            'title' => $book['title'],
                            'price' => $book['price'],
                            'rating' => $book['rating'],
                            'availability' => $book['availability'],
                        ]
                    );
                }

                //このカテゴリの統計（Stats） を計算して保存
                $products = $category->products;
                Stat::create([
                    'category_id' => $category->id,
                    'average_price' => $products->avg('price') ?? 0,    //平均
                    'total_count' => $products->count() ?? 0,           //合計数
                    'max_price' => $products->max('price') ?? 0,        //最高値
                    'min_price' => $products->min('price') ?? 0,        //最安値
                    'average_rating' => $products->avg('rating') ?? 0,  //平均評価
                ]);

            }
        });

        return response()->json(['message' => "全データの取得と分析が完了しました"]);
    }


    /**
     * 商品を削除するメソッド
     * DELETE /api/products/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $product->delete();

        return response()->json(['message' => '削除しました'],200);


    }
}
