<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\ContentType;

class Content extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'contents';

    protected $fillable = [
        'content_type_id',
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'status',
        'is_featured',
        'published_at',
    ];

    protected $casts = [
        'status' => ContentStatus::class,
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function contentType(): BelongsTo
    {
        return $this->belongsTo(ContentType::class, 'content_type_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            ContentCategory::class,
            'contents_categories_pivot',
            'content_id',
            'category_id'
        )->withTimestamps();
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(
            ContentMedia::class,
            'contents_media_pivot',
            'content_id',
            'media_id'
        )
            ->withPivot('type')
            ->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | Media Helpers
    |--------------------------------------------------------------------------
    */

    public function bannerMedia(): BelongsToMany
    {
        return $this->media()->wherePivot('type', 'banner');
    }

    public function featuredMedia(): BelongsToMany
    {
        return $this->media()->wherePivot('type', 'featured');
    }

    public function attachments(): BelongsToMany
    {
        return $this->media()->wherePivot('type', 'attachment');
    }

    public function gallery(): BelongsToMany
    {
        return $this->media()->wherePivot('type', 'gallery');
    }

    public function inlineMedia(): BelongsToMany
    {
        return $this->media()->wherePivot('type', 'inline');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopePublished($query)
    {
        return $query
            ->where('status', ContentStatus::PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
