<?php

namespace App\Models;

use App\Enums\EmployeeStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'employees';

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'date_birth',
        'email',
        'contact_number',
        'section_id',
        'status',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'date_birth' => 'date:Y-m-d',
        'status' => EmployeeStatus::class,
    ];

    /**
     * Employee's section.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(
            Section::class,
            'section_id'
        );
    }

    /**
     * Full employee name.
     */
    public function getFullNameAttribute(): string
    {
        return trim(
            collect([
                $this->first_name,
                $this->middle_name,
                $this->last_name,
            ])
                ->filter()
                ->implode(' ')
        );
    }
}
