<?php

/*
|--------------------------------------------------------------------------
| INVENTORY API ROUTES
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AttachmentTypeController;
use App\Http\Controllers\Api\EquipmentAttachmentController;
use App\Http\Controllers\Api\EquipmentAssignmentController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\EquipmentTypeController;
use Illuminate\Support\Facades\Route;

Route::prefix('inventory')
    ->middleware('auth.fcv')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | EQUIPMENT TYPES
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'equipment-types',
            EquipmentTypeController::class
        );

        /*
        |--------------------------------------------------------------------------
        | ATTACHMENT TYPES
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'attachment-types',
            AttachmentTypeController::class
        );

        /*
        |--------------------------------------------------------------------------
        | EQUIPMENTS
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'equipments',
            EquipmentController::class
        );

        /*
        |--------------------------------------------------------------------------
        | EQUIPMENT ASSIGNMENT ACTIONS
        |--------------------------------------------------------------------------
        */

        Route::post(
            'equipment-assignments/{equipmentAssignment}/return',
            [
                EquipmentAssignmentController::class,
                'returnEquipment',
            ]
        )->name('equipment-assignments.return');

        Route::post(
            'equipment-assignments/{equipmentAssignment}/transfer',
            [
                EquipmentAssignmentController::class,
                'transfer',
            ]
        )->name('equipment-assignments.transfer');

        Route::post(
            'equipment-assignments/{equipmentAssignment}/dispose',
            [
                EquipmentAssignmentController::class,
                'dispose',
            ]
        )->name('equipment-assignments.dispose');

        /*
        |--------------------------------------------------------------------------
        | EQUIPMENT ASSIGNMENTS
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'equipment-assignments',
            EquipmentAssignmentController::class
        );

        /*
        |--------------------------------------------------------------------------
        | EQUIPMENT ATTACHMENTS
        |--------------------------------------------------------------------------
        |
        | General equipment attachments.
        |
        */

        Route::get(
            'equipments/{equipment}/attachments',
            [
                EquipmentAttachmentController::class,
                'index',
            ]
        )->name('equipments.attachments.index');

        Route::post(
            'equipments/{equipment}/attachments',
            [
                EquipmentAttachmentController::class,
                'store',
            ]
        )->name('equipments.attachments.store');

        Route::get(
            'equipments/{equipment}/attachments/{attachment}',
            [
                EquipmentAttachmentController::class,
                'show',
            ]
        )->name('equipments.attachments.show');

        Route::post(
            'equipments/{equipment}/attachments/{attachment}',
            [
                EquipmentAttachmentController::class,
                'update',
            ]
        )->name('equipments.attachments.update');

        Route::delete(
            'equipments/{equipment}/attachments/{attachment}',
            [
                EquipmentAttachmentController::class,
                'destroy',
            ]
        )->name('equipments.attachments.destroy');

        /*
        |--------------------------------------------------------------------------
        | EQUIPMENT ASSIGNMENT ATTACHMENTS
        |--------------------------------------------------------------------------
        |
        | Attachments specifically associated with an equipment assignment.
        |
        */

        Route::get(
            'equipment-assignments/{equipmentAssignment}/attachments',
            [
                EquipmentAttachmentController::class,
                'assignmentIndex',
            ]
        )->name('equipment-assignments.attachments.index');

        Route::post(
            'equipment-assignments/{equipmentAssignment}/attachments',
            [
                EquipmentAttachmentController::class,
                'assignmentStore',
            ]
        )->name('equipment-assignments.attachments.store');
    });
