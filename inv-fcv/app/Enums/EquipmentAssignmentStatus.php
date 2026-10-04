<?php

namespace App\Enums;

enum EquipmentAssignmentStatus: string
{
    case ACTIVE = 'active';
    case RETURNED = 'returned';
    case TRANSFERRED = 'transferred';
    case DISPOSED = 'disposed';
}