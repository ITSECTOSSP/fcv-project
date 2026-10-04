<?php

namespace App\Models;

use App\Enums\EquipmentAssignmentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipmentAssignment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        /*
        |--------------------------------------------------------------------------
        | Assignment Group
        |--------------------------------------------------------------------------
        |
        | Groups all assignments belonging to the same equipment
        | assignment lifecycle.
        |
        */

        'assignment_group_id',

        /*
        |--------------------------------------------------------------------------
        | Equipment
        |--------------------------------------------------------------------------
        */

        'equipment_id',

        /*
        |--------------------------------------------------------------------------
        | Equipment Identification
        |--------------------------------------------------------------------------
        |
        | These values identify the specific equipment unit at the time
        | of assignment.
        |
        */

        'property_number',
        'serial_number',

        /*
        |--------------------------------------------------------------------------
        | Care Of
        |--------------------------------------------------------------------------
        */

        'is_care_of',
        'care_of_employee_id',

        /*
        |--------------------------------------------------------------------------
        | Actual User
        |--------------------------------------------------------------------------
        */

        'user_employee_id',

        /*
        |--------------------------------------------------------------------------
        | Assignment Quantity
        |--------------------------------------------------------------------------
        */

        'quantity',

        /*
        |--------------------------------------------------------------------------
        | Assignment Dates
        |--------------------------------------------------------------------------
        */

        'assigned_at',
        'returned_at',

        /*
        |--------------------------------------------------------------------------
        | Assignment Status
        |--------------------------------------------------------------------------
        */

        'status',

        /*
        |--------------------------------------------------------------------------
        | Remarks
        |--------------------------------------------------------------------------
        */

        'remarks',

        /*
        |--------------------------------------------------------------------------
        | Audit Information
        |--------------------------------------------------------------------------
        */

        'encoded_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_care_of' => 'boolean',
            'quantity' => 'integer',
            'assigned_at' => 'date',
            'returned_at' => 'date',
            'status' => EquipmentAssignmentStatus::class,
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
    | Equipment Attachment
    |--------------------------------------------------------------------------
    */
    public function attachments(): HasMany
    {
        return $this->hasMany(
            EquipmentAttachment::class,
            'equipment_assignment_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Assignment Group
    |--------------------------------------------------------------------------
    |
    | Returns all assignment records belonging to the same
    | equipment assignment lifecycle.
    |
    */

    public function assignmentGroup(): HasMany
    {
        return $this->hasMany(
            self::class,
            'assignment_group_id',
            'assignment_group_id'
        )
            ->orderBy('assigned_at', 'asc')
            ->orderBy('created_at', 'asc');
    }

    /*
    |--------------------------------------------------------------------------
    | Transfers From
    |--------------------------------------------------------------------------
    |
    | Transfers where this assignment is the source assignment.
    |
    */

    public function transfersFrom(): HasMany
    {
        return $this->hasMany(
            EquipmentTransfer::class,
            'from_assignment_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Transfers To
    |--------------------------------------------------------------------------
    |
    | Transfers where this assignment is the destination assignment.
    |
    */

    public function transfersTo(): HasMany
    {
        return $this->hasMany(
            EquipmentTransfer::class,
            'to_assignment_id'
        );
    }
}
