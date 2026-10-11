<?php

/*
|--------------------------------------------------------------------------
| HUMAN RESOURCES API ROUTES
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\SectionController;
use Illuminate\Support\Facades\Route;

Route::prefix('hr')
    ->middleware('auth.fcv')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | DIVISIONS
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'divisions',
            DivisionController::class
        );

        /*
        |--------------------------------------------------------------------------
        | SECTIONS
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'sections',
            SectionController::class
        );

        /*
        |--------------------------------------------------------------------------
        | EMPLOYEES
        |--------------------------------------------------------------------------
        */

        /*
         * Get the employee record linked to the
         * currently authenticated Auth-FCV user.
         *
         * GET /api/hr/employees/me
         */
        Route::get(
            'employees/me',
            [EmployeeController::class, 'me']
        );

        Route::apiResource(
            'employees',
            EmployeeController::class
        );
    });
