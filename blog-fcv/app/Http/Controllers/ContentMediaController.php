<?php

namespace App\Http\Controllers;

use App\Models\ContentMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ContentMediaController extends Controller
{
    /**
     * Display media.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContentMedia::query()
            ->latest();

        if ($request->filled('mime_type')) {
            $query->where(
                'mime_type',
                'like',
                $request->string('mime_type')->toString() . '%'
            );
        }

        $media = $query->paginate(
            min($request->integer('per_page', 20), 100)
        );

        return response()->json($media);
    }

    /**
     * Upload media.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx,xls,xlsx',
            ],

            'name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'alt_text' => [
                'nullable',
                'string',
                'max:255',
            ],

            'caption' => [
                'nullable',
                'string',
            ],

            'disk' => [
                'nullable',
                'string',
                Rule::in([
                    'public',
                ]),
            ],
        ]);

        $file = $validated['file'];

        $disk = $validated['disk'] ?? 'public';

        $path = $file->store(
            'blog-media',
            $disk
        );

        $media = ContentMedia::create([
            'name' => $validated['name']
                ?? pathinfo(
                    $file->getClientOriginalName(),
                    PATHINFO_FILENAME
                ),

            'file_name' => $file->getClientOriginalName(),

            'path' => $path,

            'disk' => $disk,

            'mime_type' => $file->getMimeType(),

            'size' => $file->getSize(),

            'alt_text' => $validated['alt_text'] ?? null,

            'caption' => $validated['caption'] ?? null,
        ]);

        return response()->json([
            'message' => 'Media uploaded successfully.',
            'data' => $media,
        ], 201);
    }

    /**
     * Display media.
     */
    public function show(ContentMedia $media): JsonResponse
    {
        return response()->json([
            'data' => $media,
        ]);
    }

    /**
     * Delete media.
     */
    public function destroy(ContentMedia $media): JsonResponse
    {
        Storage::disk($media->disk)
            ->delete($media->path);

        $media->delete();

        return response()->json([
            'message' => 'Media deleted successfully.',
        ]);
    }
}