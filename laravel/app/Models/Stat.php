<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stat extends Model
{
    protected $fillable = [
        'category_id',
        'average_price',
        'total_count',
        'max_price',
        'min_price',
        'average_rating',
    ];

    /**
     * どのカテゴリの統計かを紐付ける
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
