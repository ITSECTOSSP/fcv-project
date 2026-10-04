<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentAttachment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'equipment_id',
        'equipment_assignment_id',
        'attachment_type_id',
        'name',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'description',
        'encoded_by',
        'updated_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(
            Equipment::class,
            'equipment_id'
        );
    }

    public function equipmentAssignment(): BelongsTo
    {
        return $this->belongsTo(
            EquipmentAssignment::class,
            'equipment_assignment_id'
        );
    }

    public function attachmentType(): BelongsTo
    {
        return $this->belongsTo(
            AttachmentType::class,
            'attachment_type_id'
        );
    }
}