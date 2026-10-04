<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'equipments';

    protected $fillable = [
        'equipment_type_id',
        'description',
        'property_number',
        'serial_number',
        'unit_cost',
        'date_acquired',
        'quantity',
        'encoded_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'date_acquired' => 'date:Y-m-d',
            'quantity' => 'integer',
            'unit_cost' => 'decimal:2',
        ];
    }

    protected $appends = [
        'assigned_quantity',
        'available_quantity',
        'returned_quantity',
        'disposed_quantity',
    ];

    /* =====================================================
     * EQUIPMENT TYPE
     * ===================================================== */

    public function equipmentType(): BelongsTo
    {
        return $this->belongsTo(
            EquipmentType::class,
            'equipment_type_id'
        );
    }

    /* =====================================================
     * ASSIGNMENTS
     * ===================================================== */

    public function assignments(): HasMany
    {
        return $this->hasMany(
            EquipmentAssignment::class,
            'equipment_id'
        );
    }

    /* =====================================================
     * ATTACHMENTS
     * ===================================================== */

    public function attachments(): HasMany
    {
        return $this->hasMany(
            EquipmentAttachment::class,
            'equipment_id'
        );
    }

    /* =====================================================
     * CALCULATED ASSIGNED QUANTITY
     * ===================================================== */

    public function getAssignedQuantityAttribute(): int
    {
        return (int) $this->assignments()
            ->where('status', 'active')
            ->sum('quantity');
    }

    /* =====================================================
     * CALCULATED RETURNED QUANTITY
     * ===================================================== */

    public function getReturnedQuantityAttribute(): int
    {
        return (int) $this->assignments()
            ->where('status', 'returned')
            ->sum('quantity');
    }

    /* =====================================================
     * CALCULATED DISPOSED QUANTITY
     * ===================================================== */

    public function getDisposedQuantityAttribute(): int
    {
        return (int) $this->assignments()
            ->where('status', 'disposed')
            ->sum('quantity');
    }

    /* =====================================================
     * CALCULATED AVAILABLE QUANTITY
     * ===================================================== */

    public function getAvailableQuantityAttribute(): int
    {
        return max(
            0,
            $this->quantity
            - $this->assigned_quantity
            - $this->disposed_quantity
        );
    }
}