<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContentMedia extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'content_media';

    protected $fillable = [
        'name',
        'file_name',
        'path',
        'disk',
        'mime_type',
        'size',
        'alt_text',
        'caption',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function contents(): BelongsToMany
    {
        return $this->belongsToMany(
            Content::class,
            'contents_media_pivot',
            'media_id',
            'content_id'
        )
            ->withPivot('type')
            ->withTimestamps();
    }
}
