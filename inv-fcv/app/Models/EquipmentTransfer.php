<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentTransfer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        /*
        |--------------------------------------------------------------------------
        | Equipment
        |--------------------------------------------------------------------------
        */

        'equipment_id',

        /*
        |--------------------------------------------------------------------------
        | Assignments
        |--------------------------------------------------------------------------
        */

        'from_assignment_id',
        'to_assignment_id',

        /*
        |--------------------------------------------------------------------------
        | Transfer Information
        |--------------------------------------------------------------------------
        */

        'quantity',
        'transferred_at',
        'remarks',

        /*
        |--------------------------------------------------------------------------
        | Audit Information
        |--------------------------------------------------------------------------
        */

        'encoded_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'transferred_at' => 'date',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Equipment
    |--------------------------------------------------------------------------
    */

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(
            Equipment::class,
            'equipment_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | From Assignment
    |--------------------------------------------------------------------------
    |
    | The assignment from which the equipment was transferred.
    |
    */

    public function fromAssignment(): BelongsTo
    {
        return $this->belongsTo(
            EquipmentAssignment::class,
            'from_assignment_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | To Assignment
    |--------------------------------------------------------------------------
    |
    | The assignment created for the receiving employee.
    |
    */

    public function toAssignment(): BelongsTo
    {
        return $this->belongsTo(
            EquipmentAssignment::class,
            'to_assignment_id'
        );
    }
}
