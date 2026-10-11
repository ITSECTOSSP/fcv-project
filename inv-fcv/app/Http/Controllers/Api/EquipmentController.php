<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentAttachment;
use App\Services\AuditLogService;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EquipmentController extends Controller
{
    /**
     * Return a listing of equipment.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Equipment::query()
            ->with('equipmentType');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($query) use ($search) {
                $query
                    ->where('property_number', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('equipment_type_ids')) {
            $query->whereIn(
                'equipment_type_id',
                $request->input('equipment_type_ids')
            );
        }

        $equipments = $query
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($equipments);
    }

    /**
     * Store a new equipment record.
     */
    public function store(
        Request $request,
        AuditLogService $auditLog
    ): JsonResponse {
        $validated = $request->validate([
            'equipment_type_id' => [
                'required',
                'uuid',
                'exists:equipment_types,id',
            ],
            'date_acquired' => [
                'required',
                'date',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'description' => [
                'required',
                'string',
            ],
            'property_number' => [
                'required',
                'string',
                'max:255',
                'unique:equipments,property_number',
            ],
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                'unique:equipments,serial_number',
            ],
            'unit_cost' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        $validated['encoded_by'] = $authUserId;
        $validated['updated_by'] = $authUserId;

        $equipment = Equipment::create($validated);
        $equipment->load('equipmentType');

        // Record the successful creation.
        $auditLog->record(
            $request,
            'CREATE',
            'equipment',
            (string) $equipment->getKey(),
            'Created equipment: ' . $equipment->property_number,
            null,
            $this->auditValues($equipment),
        );

        return response()->json([
            'message' => 'Equipment created successfully.',
            'data' => $equipment,
        ], 201);
    }

    /**
     * Display the specified equipment.
     */
    public function show(Equipment $equipment): JsonResponse
    {
        $equipment->load([
            'equipmentType',
            'attachments.attachmentType',
            'assignments',
        ]);

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $equipment->attachments->each(
            function (EquipmentAttachment $attachment) use ($disk) {
                $attachment->file_url = $disk->url(
                    $attachment->file_path
                );
            }
        );

        return response()->json([
            'data' => $equipment,
        ]);
    }

    /**
     * Update the specified equipment.
     */
    public function update(
        Request $request,
        Equipment $equipment,
        AuditLogService $auditLog
    ): JsonResponse {
        $validated = $request->validate([
            'equipment_type_id' => [
                'required',
                'uuid',
                'exists:equipment_types,id',
            ],
            'date_acquired' => [
                'required',
                'date',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'description' => [
                'required',
                'string',
            ],
            'property_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique(
                    'equipments',
                    'property_number'
                )->ignore($equipment->id),
            ],
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique(
                    'equipments',
                    'serial_number'
                )->ignore($equipment->id),
            ],
            'unit_cost' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        $assignedQuantity = $equipment
            ->assignments()
            ->whereNull('returned_at')
            ->sum('quantity');

        if ($validated['quantity'] < $assignedQuantity) {
            return response()->json([
                'message' =>
                'Equipment quantity cannot be less than the currently assigned quantity.',
                'assigned_quantity' => (int) $assignedQuantity,
                'requested_quantity' => (int) $validated['quantity'],
            ], 422);
        }

        // Capture the existing values before updating.
        $oldValues = $this->auditValues($equipment);

        // Preserve encoded_by; update only updated_by.
        $validated['updated_by'] = $authUserId;

        $equipment->update($validated);
        $equipment->load('equipmentType');

        // Record the successful update.
        $auditLog->record(
            $request,
            'UPDATE',
            'equipment',
            (string) $equipment->getKey(),
            'Updated equipment: ' . $equipment->property_number,
            $oldValues,
            $this->auditValues($equipment),
        );

        return response()->json([
            'message' => 'Equipment updated successfully.',
            'data' => $equipment,
        ]);
    }

    /**
     * Remove the specified equipment.
     */
    public function destroy(
        Request $request,
        Equipment $equipment,
        AuditLogService $auditLog
    ): JsonResponse {
        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        $hasActiveAssignments = $equipment
            ->assignments()
            ->whereNull('returned_at')
            ->exists();

        if ($hasActiveAssignments) {
            return response()->json([
                'message' =>
                'Equipment cannot be deleted while it has active assignments.',
            ], 422);
        }

        // Preserve the record details before deleting it.
        $oldValues = $this->auditValues($equipment);
        $recordId = (string) $equipment->getKey();
        $propertyNumber = $equipment->property_number;

        $equipment->delete();

        // Record the successful deletion.
        $auditLog->record(
            $request,
            'DELETE',
            'equipment',
            $recordId,
            'Deleted equipment: ' . $propertyNumber,
            $oldValues,
            null,
        );

        return response()->json([
            'message' => 'Equipment deleted successfully.',
        ]);
    }

    /**
     * Select the business fields stored in audit snapshots.
     */
    private function auditValues(Equipment $equipment): array
    {
        return $equipment->only([
            'equipment_type_id',
            'date_acquired',
            'quantity',
            'description',
            'property_number',
            'serial_number',
            'unit_cost',
        ]);
    }
}
