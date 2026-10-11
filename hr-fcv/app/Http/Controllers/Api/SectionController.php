<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SectionController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET SECTIONS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): JsonResponse
    {
        $query = Section::query()
            ->with('division');

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
        | FILTER BY DIVISION
        |--------------------------------------------------------------------------
        */

        if ($request->filled('division_ids')) {
            $query->whereIn(
                'division_id',
                $request->input('division_ids')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        $sections = $query
            ->orderBy('name')
            ->paginate(
                $request->integer('per_page', 15)
            );

        return response()->json(
            $sections
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GET SECTION
    |--------------------------------------------------------------------------
    */

    public function show(
        Section $section
    ): JsonResponse {
        $section->load([
            'division',
        ]);

        return response()->json([
            'data' => $section,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE SECTION
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'division_id' => [
                'required',
                'integer',
                'exists:divisions,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',

                Rule::unique(
                    'sections',
                    'name'
                )->where(
                    fn($query) =>
                    $query->where(
                        'division_id',
                        $request->input(
                            'division_id'
                        )
                    )
                ),
            ],
        ]);

        $section = Section::create(
            $validated
        );

        $section->load([
            'division',
        ]);

        return response()->json([
            'message' =>
            'Section created successfully.',

            'data' =>
            $section,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE SECTION
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Section $section
    ): JsonResponse {
        $validated = $request->validate([
            'division_id' => [
                'required',
                'integer',
                'exists:divisions,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',

                Rule::unique(
                    'sections',
                    'name'
                )
                    ->where(
                        fn($query) =>
                        $query->where(
                            'division_id',
                            $request->input(
                                'division_id'
                            )
                        )
                    )
                    ->ignore(
                        $section->id
                    ),
            ],
        ]);

        $section->update(
            $validated
        );

        $section->load([
            'division',
        ]);

        return response()->json([
            'message' =>
            'Section updated successfully.',

            'data' =>
            $section,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE SECTION
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Section $section
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | Prevent deletion if employees exist
        |--------------------------------------------------------------------------
        */

        if (
            $section
            ->employees()
            ->exists()
        ) {
            return response()->json([
                'message' =>
                'This section cannot be deleted because employees are currently assigned to it.',
            ], 422);
        }

        $section->delete();

        return response()->json([
            'message' =>
            'Section deleted successfully.',
        ]);
    }
}
