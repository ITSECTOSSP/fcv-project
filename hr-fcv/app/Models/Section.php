<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasFactory;

    protected $table = 'sections';

    protected $fillable = [
        'division_id',
        'name',
    ];

    /**
     * The division this section belongs to.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(
            Division::class,
            'division_id'
        );
    }

    /**
     * Employees assigned to this section.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(
            Employee::class,
            'section_id'
        );
    }
}
