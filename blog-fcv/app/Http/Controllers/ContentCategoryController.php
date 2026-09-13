<?php

namespace App\Http\Controllers;

use App\Models\ContentCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ContentCategoryController extends Controller
{
    /**
     * Display categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContentCategory::query()
            ->withCount('contents')
            ->orderBy('name');

        if ($request->has('is_active')) {
            $query->where(
                'is_active',
                $request->boolean('is_active')
            );
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Store a category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:content_categories,name',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:content_categories,slug',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $category = ContentCategory::create([
            'name' => $validated['name'],

            'slug' => $validated['slug']
                ?? Str::slug($validated['name']),

            'description' => $validated['description'] ?? null,

            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    /**
     * Display a category.
     */
    public function show(ContentCategory $category): JsonResponse
    {
        return response()->json([
            'data' => $category->loadCount('contents'),
        ]);
    }

    /**
     * Update a category.
     */
    public function update(
        Request $request,
        ContentCategory $category
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',

                Rule::unique('content_categories', 'name')
                    ->ignore($category->id),
            ],

            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',

                Rule::unique('content_categories', 'slug')
                    ->ignore($category->id),
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        if (
            isset($validated['name']) &&
            !array_key_exists('slug', $validated)
        ) {
            $validated['slug'] = Str::slug(
                $validated['name']
            );
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => $category
                ->fresh()
                ->loadCount('contents'),
        ]);
    }

    /**
     * Delete a category.
     */
    public function destroy(ContentCategory $category): JsonResponse
    {
        if ($category->contents()->exists()) {
            return response()->json([
                'message' =>
                    'This category cannot be deleted because it is being used by content.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}