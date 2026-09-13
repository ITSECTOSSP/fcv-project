<?php

namespace App\Http\Controllers;

use App\Enums\ContentStatus;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

use Illuminate\Http\UploadedFile;
use App\Models\ContentMedia;

class ContentController extends Controller
{
    /**
     * Handle File Upload.
     */
    private function storeMedia(
        Content $content,
        UploadedFile $file,
        string $type
    ): ContentMedia {
        $path = $file->store(
            "contents/{$content->id}/{$type}",
            'public'
        );

        $media = ContentMedia::create([
            'name' => pathinfo(
                $file->getClientOriginalName(),
                PATHINFO_FILENAME
            ),
            'file_name' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        $content->media()->attach($media->id, [
            'type' => $type,
        ]);

        return $media;
    }
    /**
     * Display a listing of contents.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Content::query()
            ->with([
                'contentType',
                'categories',
                'media',
            ])
            ->latest();

        // Search
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Content type
        if ($request->filled('content_type_id')) {
            $query->where(
                'content_type_id',
                $request->integer('content_type_id')
            );
        }

        // Status
        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->string('status')->toString()
            );
        }

        // Featured
        if ($request->has('is_featured')) {
            $query->where(
                'is_featured',
                $request->boolean('is_featured')
            );
        }

        $contents = $query->paginate(
            $request->integer('per_page', 15)
        );

        return response()->json($contents);
    }

    /**
     * Store a newly created content.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content_type_id' => [
                'required',
                'integer',
                Rule::exists('content_types', 'id')
                    ->where('is_active', true),
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:contents,slug',
            ],

            'excerpt' => [
                'nullable',
                'string',
            ],

            'content' => [
                'nullable',
                'string',
            ],

            'status' => [
                'nullable',
                Rule::enum(ContentStatus::class),
            ],

            'is_featured' => [
                'nullable',
                'boolean',
            ],

            'published_at' => [
                'nullable',
                'date',
            ],

            'category_ids' => [
                'nullable',
                'array',
            ],

            'category_ids.*' => [
                'integer',
                Rule::exists('content_categories', 'id')
                    ->where('is_active', true),
            ],

            // Media
            'featured_media' => [
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'banner_media' => [
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],

            'attachments' => [
                'nullable',
                'array',
            ],

            'attachments.*' => [
                'file',
                'max:20480',
            ],
        ]);

        $content = DB::transaction(function () use ($validated, $request) {
            $status = isset($validated['status'])
                ? ContentStatus::from($validated['status'])
                : ContentStatus::DRAFT;

            $content = Content::create([
                'content_type_id' => $validated['content_type_id'],
                'author_id' => $request->user()?->id,
                'title' => $validated['title'],
                'slug' => $validated['slug']
                    ?? Str::slug($validated['title']),
                'excerpt' => $validated['excerpt'] ?? null,
                'content' => $validated['content'] ?? null,
                'status' => $status,
                'is_featured' => $validated['is_featured'] ?? false,
                'published_at' => $this->resolvePublishedAt(
                    $status,
                    $validated['published_at'] ?? null
                ),
            ]);

            /*
        |--------------------------------------------------------------------------
        | Categories
        |--------------------------------------------------------------------------
        */

            if (!empty($validated['category_ids'])) {
                $content->categories()->sync(
                    $validated['category_ids']
                );
            }

            /*
        |--------------------------------------------------------------------------
        | Featured Media
        |--------------------------------------------------------------------------
        */

            if ($request->hasFile('featured_media')) {
                $this->storeMedia(
                    $content,
                    $request->file('featured_media'),
                    'featured'
                );
            }

            /*
        |--------------------------------------------------------------------------
        | Banner Media
        |--------------------------------------------------------------------------
        */

            if ($request->hasFile('banner_media')) {
                $this->storeMedia(
                    $content,
                    $request->file('banner_media'),
                    'banner'
                );
            }

            /*
        |--------------------------------------------------------------------------
        | Attachments
        |--------------------------------------------------------------------------
        */

            foreach ($request->file('attachments', []) as $file) {
                $this->storeMedia(
                    $content,
                    $file,
                    'attachment'
                );
            }

            return $content;
        });

        return response()->json(
            $content->load([
                'contentType',
                'categories',
                'media',
            ]),
            201
        );
    }
    /**
     * Display the specified content.
     */
    public function show(Content $content): JsonResponse
    {
        $content->load([
            'contentType',
            'categories',
            'media',
        ]);

        return response()->json($content);
    }

    /**
     * Update the specified content.
     */
    public function update(
        Request $request,
        Content $content
    ): JsonResponse {

        $validated = $request->validate([
            'content_type_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('content_types', 'id')
                    ->where('is_active', true),
            ],

            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                Rule::unique('contents', 'slug')
                    ->ignore($content->id),
            ],

            'excerpt' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'content' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'status' => [
                'sometimes',
                Rule::enum(ContentStatus::class),
            ],

            'is_featured' => [
                'sometimes',
                'boolean',
            ],

            'published_at' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'category_ids' => [
                'sometimes',
                'array',
            ],

            'category_ids.*' => [
                'integer',
                Rule::exists('categories', 'id')
                    ->where('is_active', true),
            ],
        ]);

        DB::transaction(function () use (
            $validated,
            $content
        ) {

            if (
                isset($validated['title']) &&
                !isset($validated['slug'])
            ) {

                $validated['slug'] = $this->generateUniqueSlug(
                    $validated['title'],
                    $content->id
                );
            }

            if (isset($validated['status'])) {
                $status = ContentStatus::from(
                    $validated['status']
                );

                $validated['published_at'] =
                    $this->resolvePublishedAt(
                        $status,
                        $validated['published_at'] ?? null
                    );
            }

            $categoryIds = $validated['category_ids'] ?? null;

            unset($validated['category_ids']);

            $content->update($validated);

            if ($categoryIds !== null) {
                $content->categories()->sync($categoryIds);
            }
        });

        return response()->json(
            $content->fresh()->load([
                'contentType',
                'categories',
                'media',
            ])
        );
    }

    /**
     * Remove the specified content.
     */
    public function destroy(Content $content): JsonResponse
    {
        $content->delete();

        return response()->json([
            'message' => 'Content deleted successfully.',
        ]);
    }

    /**
     * Publish the specified content.
     */
    public function publish(Content $content): JsonResponse
    {
        $content->update([
            'status' => ContentStatus::PUBLISHED,
            'published_at' => now(),
        ]);

        return response()->json([
            'message' => 'Content published successfully.',
            'content' => $content->fresh()->load([
                'contentType',
                'categories',
                'media',
            ]),
        ]);
    }

    /**
     * Archive the specified content.
     */
    public function archive(Content $content): JsonResponse
    {
        $content->update([
            'status' => ContentStatus::ARCHIVED,
        ]);

        return response()->json([
            'message' => 'Content archived successfully.',
            'content' => $content->fresh(),
        ]);
    }

    /**
     * Restore an archived/deleted content.
     */
    public function restore(int $id): JsonResponse
    {
        $content = Content::withTrashed()->findOrFail($id);

        $content->restore();

        return response()->json([
            'message' => 'Content restored successfully.',
            'content' => $content->fresh()->load([
                'contentType',
                'categories',
                'media',
            ]),
        ]);
    }

    /**
     * Generate a unique slug.
     */
    private function generateUniqueSlug(
        string $title,
        ?int $ignoreId = null
    ): string {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (
            Content::withTrashed()
            ->where('slug', $slug)
            ->when(
                $ignoreId,
                fn($query) =>
                $query->where('id', '!=', $ignoreId)
            )
            ->exists()
        ) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Resolve published_at based on status.
     */
    private function resolvePublishedAt(
        ContentStatus $status,
        mixed $publishedAt = null
    ): mixed {
        if ($status === ContentStatus::PUBLISHED) {
            return $publishedAt ?? now();
        }

        return $publishedAt;
    }
}
