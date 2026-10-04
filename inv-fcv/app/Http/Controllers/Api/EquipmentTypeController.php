<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EquipmentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EquipmentTypeController extends Controller
{
    /**
     * Display a listing of equipment types.
     */
    public function index(Request $request): JsonResponse
    {
        $query = EquipmentType::query()
            ->withCount('equipments');

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($query) use ($search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere(
                        'description',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        $equipmentTypes = $query
            ->orderBy('name')
            ->paginate(
                $request->integer('per_page', 15)
            );

        return response()->json($equipmentTypes);
    }

    /**
     * Store a newly created equipment type.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:equipment_types,name',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $equipmentType = EquipmentType::create($validated);

        return response()->json([
            'message' => 'Equipment type created successfully.',
            'data' => $equipmentType,
        ], 201);
    }

    /**
     * Display the specified equipment type.
     */
    public function show(
        EquipmentType $equipmentType
    ): JsonResponse {
        $equipmentType->loadCount('equipments');

        return response()->json([
            'data' => $equipmentType,
        ]);
    }

    /**
     * Update the specified equipment type.
     */
    public function update(
        Request $request,
        EquipmentType $equipmentType
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(
                    'equipment_types',
                    'name'
                )->ignore($equipmentType->id),
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $equipmentType->update($validated);

        return response()->json([
            'message' => 'Equipment type updated successfully.',
            'data' => $equipmentType->fresh(),
        ]);
    }

    /**
     * Remove the specified equipment type.
     */
    public function destroy(
        EquipmentType $equipmentType
    ): JsonResponse {
        if ($equipmentType->equipments()->exists()) {
            return response()->json([
                'message' =>
                    'Equipment type cannot be deleted because it is being used by equipment.',
            ], 409);
        }

        $equipmentType->delete();

        return response()->json([
            'message' => 'Equipment type deleted successfully.',
        ]);
    }
}