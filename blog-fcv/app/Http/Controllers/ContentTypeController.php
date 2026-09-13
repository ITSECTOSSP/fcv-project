<?php

namespace App\Http\Controllers;

use App\Models\ContentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ContentTypeController extends Controller
{
    /**
     * Display all content types.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContentType::query()
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
     * Store a new content type.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:content_types,name',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:content_types,slug',
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

        $contentType = ContentType::create([
            'name' => $validated['name'],
            'slug' => $validated['slug']
                ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Content type created successfully.',
            'data' => $contentType,
        ], 201);
    }

    /**
     * Display a content type.
     */
    public function show(ContentType $contentType): JsonResponse
    {
        return response()->json([
            'data' => $contentType->loadCount('contents'),
        ]);
    }

    /**
     * Update a content type.
     */
    public function update(
        Request $request,
        ContentType $contentType
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('content_types', 'name')
                    ->ignore($contentType->id),
            ],

            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                Rule::unique('content_types', 'slug')
                    ->ignore($contentType->id),
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

        $contentType->update($validated);

        return response()->json([
            'message' => 'Content type updated successfully.',
            'data' => $contentType->fresh()->loadCount('contents'),
        ]);
    }

    /**
     * Delete a content type.
     */
    public function destroy(ContentType $contentType): JsonResponse
    {
        if ($contentType->contents()->exists()) {
            return response()->json([
                'message' =>
                    'This content type cannot be deleted because it is being used by content.',
            ], 409);
        }

        $contentType->delete();

        return response()->json([
            'message' => 'Content type deleted successfully.',
        ]);
    }
}