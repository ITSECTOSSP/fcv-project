<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * Sections under this division.
     */
    public function sections(): HasMany
    {
        return $this->hasMany(
            Section::class,
            'division_id'
        );
    }
}
