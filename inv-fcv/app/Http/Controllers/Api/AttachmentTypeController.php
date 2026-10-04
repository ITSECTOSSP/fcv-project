<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttachmentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttachmentTypeController extends Controller
{
    /**
     * Display a listing of attachment types.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AttachmentType::query()
            ->withCount('attachments');

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'description',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        $attachmentTypes = $query
            ->orderBy('name')
            ->paginate(
                $request->integer('per_page', 15)
            );

        return response()->json($attachmentTypes);
    }

    /**
     * Store a newly created attachment type.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:attachment_types,name',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $attachmentType = AttachmentType::create(
            $validated
        );

        return response()->json([
            'message' =>
            'Attachment type created successfully.',
            'data' => $attachmentType,
        ], 201);
    }

    /**
     * Display the specified attachment type.
     */
    public function show(
        AttachmentType $attachmentType
    ): JsonResponse {
        $attachmentType->loadCount('attachments');

        return response()->json([
            'data' => $attachmentType,
        ]);
    }

    /**
     * Update the specified attachment type.
     */
    public function update(
        Request $request,
        AttachmentType $attachmentType
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(
                    'attachment_types',
                    'name'
                )->ignore($attachmentType->id),
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $attachmentType->update($validated);

        return response()->json([
            'message' =>
            'Attachment type updated successfully.',
            'data' => $attachmentType->fresh(),
        ]);
    }

    /**
     * Remove the specified attachment type.
     */
    public function destroy(
        AttachmentType $attachmentType
    ): JsonResponse {
        if ($attachmentType->attachments()->exists()) {
            return response()->json([
                'message' =>
                'Attachment type cannot be deleted because it is being used by equipment attachments.',
            ], 409);
        }

        $attachmentType->delete();

        return response()->json([
            'message' =>
            'Attachment type deleted successfully.',
        ]);
    }
}
