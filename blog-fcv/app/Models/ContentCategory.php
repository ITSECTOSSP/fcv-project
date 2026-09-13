<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ContentCategory extends Model
{
    use HasFactory;

    protected $table = 'content_categories';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function contents(): BelongsToMany
    {
        return $this->belongsToMany(
            Content::class,
            'contents_categories_pivot',
            'category_id',
            'content_id'
        )->withTimestamps();
    }
}
