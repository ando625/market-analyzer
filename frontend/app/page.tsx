"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, BookOpen, Star, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";


//評価(統計）の型
interface Stat{
    average_price: number;
    total_count: number;
    average_rating: number;
}

//カテゴリの型 カテゴリの中に統計がある
interface Category{
    id: number;
    name: string;
    url: string;
    stats: Stat[];
}


export default function Home() {

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    //画面が開いた時と登録が成功した時にリストを更新する関数
    const fetchMarketData = async () => {
        try {
            const response = await axios.get('http://localhost/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("データ取得失敗", error);
        }
    };

    //最初に一回だけ読み込む
    useEffect(() => {
        fetchMarketData();
    }, []);




    //グラフ用にデータを整形する 価格、在庫数、評価全て準備
    const chartData = categories.map(cat => ({
        name: cat.name,
        price: cat.stats[0]?.average_price || 0,
        count: cat.stats[0]?.total_count || 0,
        rating: cat.stats[0]?.average_rating || 0,
    })).slice(0, 10);  //多すぎると見づらいので上位１0件を表示


    //分析ボタンを押された時の処理
    const handleStartAnalysis = async () => {
        if (!confirm("全カテゴリのデータを取得します。開始しますか？")) return;
        setLoading(true);
        try {
            await axios.post("http://localhost/api/scrape-market");
            alert("分析完了！");
            fetchMarketData();
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }


    // 全データから高評価かつ安いカテゴリだけを抽出して掘り出し物として表示
    const bargains = categories.flatMap(cat => {
        const avgPrice = cat.stats[0]?.average_price || 0;
        return cat.stats[0]?.average_rating >= 4
            && cat.stats[0]?.average_price < 5000
            ? [cat]
            : [];
    });

   

    return (
        <main className="min-h-screen p-8 bg-gray-50 text-black">
            <div className="max-w-6xl mx-auto">

                {/* ヘッダーエリア */}
                <div className="flex flex-col md:flex-row justify-baseline items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
                            <BookOpen className="text-blue-600" size={36} />
                            Market Analyzer
                        </h1>
                        <p className="text-slate-500">書籍市場の価格と評価をリアルタイム分析</p>
                    </div>
                    <button
                        onClick={handleStartAnalysis}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-400 transition-all shadow-lg active:scale-95"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <TrendingUp />}
                        {loading ? "データを一気に収集・分析中..." : "市場分析を開始する"}
                    </button>
                </div>


                {/* グラフエリア */}
                {/* 📊 3連ダッシュボードエリア */}
                <div className="grid lg:grid-cols-3 gap-6 mb-12">
                    
                    {/* 1. 平均価格のグラフ (青) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                            <TrendingUp size={18} className="text-blue-500" />
                            平均価格 (円)
                        </h2>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
                                    <Bar dataKey="price" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. 在庫数（本の数）のグラフ (緑) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                            <BookOpen size={18} className="text-emerald-500" />
                            在庫数 (冊)
                        </h2>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip formatter={(value) => `${value} 冊`} />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. 平均評価のグラフ (黄) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                            <Star size={18} className="text-amber-500" />
                            平均評価 (★)
                        </h2>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" hide />
                                    <YAxis domain={[0, 5]} hide />
                                    <Tooltip formatter={(value) => `★ ${value.toFixed(1)}`} />
                                    <Bar dataKey="rating" fill="#f59e0b" radius={[4, 4, 0, 0]} minPointSize={5} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* 掘り出し物表示 */}
                <div>
                    {bargains.length > 0 && (
                        <div className="mb-12 p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl shadow-inner">
                            <h2 className="text-2xl font-bold text-amber-700 flex items-center gap-2 mb-4">
                                <Star className="fill-amber-500 text-amber-500" />
                                本日の掘り出し物カテゴリ
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {bargains.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
                                        <span className="font-bold">{item.name}</span>
                                        <span className="text-sm text-green-600 font-bold">狙い目です！</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* カテゴリカードエリア */}
                {/* 🗂️ カテゴリカードエリア */}
                <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => {
                        const stat = cat.stats[0];
                        return (
                            <div key={cat.id} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                                    <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-500">
                                        {stat?.total_count || 0} items
                                    </span>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                        <span className="text-sm text-slate-500">平均価格</span>
                                        <span className="text-lg font-bold text-orange-600">¥{stat?.average_price.toLocaleString() || "0"}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                        <span className="text-sm text-slate-500 flex items-center gap-1">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                            平均評価
                                        </span>
                                        <span className="font-bold">{stat?.average_rating.toFixed(1) || "0.0"}</span>
                                    </div>
                                </div>
                                
                                <a href={cat.url} target="_blank" className="mt-4 flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-blue-500 transition-colors pt-4 border-t border-slate-50">
                                    <ExternalLink size={14} />
                                    Original Page
                                </a>
                            </div>
                        );
                    })}
                </section>

            </div>
        </main>
    );
}
