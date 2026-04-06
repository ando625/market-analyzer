<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'upc',
        'price',
        'rating',
        'availability',
    ];



    /**
     * この本が所属しているカテゴリを取得する
     * 「この本は、あるカテゴリに(BelongsTo)所属している」
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
