<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DivisionController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET DIVISIONS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): JsonResponse
    {
        $query = Division::query()
            ->withCount('sections');

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(
                'name',
                'like',
                "%{$search}%"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        $divisions = $query
            ->orderBy('name')
            ->paginate(
                $request->integer('per_page', 15)
            );

        return response()->json(
            $divisions
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GET DIVISION
    |--------------------------------------------------------------------------
    */

    public function show(
        Division $division
    ): JsonResponse {
        $division->loadCount('sections');

        $division->load([
            'sections',
        ]);

        return response()->json([
            'data' => $division,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE DIVISION
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:divisions,name',
            ],
        ]);

        $division = Division::create(
            $validated
        );

        $division->loadCount('sections');

        return response()->json([
            'message' =>
            'Division created successfully.',

            'data' =>
            $division,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE DIVISION
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Division $division
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',

                Rule::unique(
                    'divisions',
                    'name'
                )->ignore(
                    $division->id
                ),
            ],
        ]);

        $division->update(
            $validated
        );

        $division->loadCount('sections');

        return response()->json([
            'message' =>
            'Division updated successfully.',

            'data' =>
            $division,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE DIVISION
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Division $division
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | Prevent deletion if sections exist
        |--------------------------------------------------------------------------
        */

        if (
            $division
            ->sections()
            ->exists()
        ) {
            return response()->json([
                'message' =>
                'This division cannot be deleted because sections are currently assigned to it.',
            ], 422);
        }

        $division->delete();

        return response()->json([
            'message' =>
            'Division deleted successfully.',
        ]);
    }
}
