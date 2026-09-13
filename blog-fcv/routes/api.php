<?php

use App\Http\Controllers\ContentCategoryController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ContentTypeController;
use App\Http\Controllers\ContentMediaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BLOG FCV API
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Content Types
|--------------------------------------------------------------------------
*/

Route::apiResource('content-types', ContentTypeController::class);


/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/

Route::apiResource('categories', ContentCategoryController::class);


/*
|--------------------------------------------------------------------------
| Contents
|--------------------------------------------------------------------------
*/

Route::apiResource('contents', ContentController::class);

Route::post(
    'contents/{content}/publish',
    [ContentController::class, 'publish']
);

Route::post(
    'contents/{content}/archive',
    [ContentController::class, 'archive']
);

Route::post(
    'contents/{id}/restore',
    [ContentController::class, 'restore']
);


/*
|--------------------------------------------------------------------------
| Media
|--------------------------------------------------------------------------
*/

Route::apiResource('media', ContentMediaController::class)
    ->only([
        'index',
        'store',
        'show',
        'destroy',
    ]);