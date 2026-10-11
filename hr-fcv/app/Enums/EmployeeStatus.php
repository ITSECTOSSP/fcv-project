<?php

namespace App\Enums;

enum EmployeeStatus: string
{
    case ACTIVE = 'active';
    case RETIRED = 'retired';
    case RESIGNED = 'resigned';
}
