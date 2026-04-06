<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'url',
    ];

    /**
     * このカテゴリに属する本をすべて取得する
     * 「1つのカテゴリには、たくさんの(HasMany)本がある」
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * このカテゴリの統計データを取得する
     */
    public function stats()
    {
        return $this->hasMany(Stat::class);
    }
}
