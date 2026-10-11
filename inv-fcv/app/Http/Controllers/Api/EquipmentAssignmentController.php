<?php
namespace App\Http\Controllers\Api;

use App\Enums\EquipmentAssignmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentAssignment;
use App\Models\EquipmentTransfer;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class EquipmentAssignmentController extends Controller
{
    /**
     * Fields to include in audit snapshots.
     */
    private function auditValues(EquipmentAssignment $assignment): array
    {
        $values = $assignment->only([
            'assignment_group_id',
            'equipment_id',
            'property_number',
            'serial_number',
            'is_care_of',
            'care_of_employee_id',
            'user_employee_id',
            'quantity',
            'assigned_at',
            'returned_at',
            'status',
            'remarks',
        ]);

        $status = $assignment->status;

        $values['status'] = $status instanceof EquipmentAssignmentStatus
            ? $status->value
            : $status;

        return $values;
    }

    /**
     * List equipment assignments.
     */
    public function index(Request $request)
    {
        $query = EquipmentAssignment::with([
            'equipment',
            'assignmentGroup',
        ]);

        if ($request->filled('equipment_id')) {
            $query->where('equipment_id', $request->equipment_id);
        }

        if ($request->filled('assignment_group_id')) {
            $query->where(
                'assignment_group_id',
                $request->assignment_group_id
            );
        }

        if ($request->filled('user_employee_id')) {
            $query->where(
                'user_employee_id',
                $request->user_employee_id
            );
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $assignments = $query
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json($assignments);
    }

    /**
     * Create an equipment assignment.
     */
    public function store(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'equipment_id' => [
                'required',
                'exists:equipment,id',
            ],
            'property_number' => [
                'nullable',
                'string',
                'max:255',
            ],
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
            ],
            'is_care_of' => [
                'required',
                'boolean',
            ],
            'care_of_employee_id' => [
                'nullable',
                'required_if:is_care_of,1',
                'exists:employees,id',
            ],
            'user_employee_id' => [
                'required',
                'exists:employees,id',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'assigned_at' => [
                'required',
                'date',
            ],
            'remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $userId = $request->attributes->get('auth_user_id');

        if (!$userId) {
            return response()->json([
                'message' => 'Authenticated user not found.',
            ], 401);
        }

        if (
            !$validated['is_care_of']
            && !empty($validated['care_of_employee_id'])
        ) {
            throw ValidationException::withMessages([
                'care_of_employee_id' =>
                    'Care-of employee must not be specified when care-of is disabled.',
            ]);
        }

        $assignment = DB::transaction(function () use (
            $validated,
            $userId
        ) {
            $equipment = Equipment::query()
                ->lockForUpdate()
                ->findOrFail($validated['equipment_id']);

            $activeQuantity = EquipmentAssignment::query()
                ->where('equipment_id', $equipment->id)
                ->where('status', EquipmentAssignmentStatus::ACTIVE->value)
                ->sum('quantity');

            $availableQuantity = $equipment->quantity - $activeQuantity;

            if ($validated['quantity'] > $availableQuantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'The requested quantity exceeds the available equipment quantity.',
                ]);
            }

            if (!empty($validated['property_number'])) {
                $propertyExists = EquipmentAssignment::query()
                    ->where('property_number', $validated['property_number'])
                    ->where('status', EquipmentAssignmentStatus::ACTIVE->value)
                    ->exists();

                if ($propertyExists) {
                    throw ValidationException::withMessages([
                        'property_number' => 'This property number is already assigned.',
                    ]);
                }
            }

            if (!empty($validated['serial_number'])) {
                $serialExists = EquipmentAssignment::query()
                    ->where('serial_number', $validated['serial_number'])
                    ->where('status', EquipmentAssignmentStatus::ACTIVE->value)
                    ->exists();

                if ($serialExists) {
                    throw ValidationException::withMessages([
                        'serial_number' => 'This serial number is already assigned.',
                    ]);
                }
            }

            $assignment = EquipmentAssignment::create([
                ...$validated,
                'assignment_group_id' => (string) Str::uuid(),
                'status' => EquipmentAssignmentStatus::ACTIVE,
                'encoded_by' => $userId,
            ]);

            return $assignment->fresh([
                'equipment',
                'assignmentGroup',
            ]);
        });

        // Audit only after the transaction has succeeded.
        $auditLog->record(
            $request,
            'CREATE',
            'equipment_assignment',
            (string) $assignment->getKey(),
            'Created equipment assignment: '
                . ($assignment->property_number ?? $assignment->getKey()),
            null,
            $this->auditValues($assignment)
        );

        return response()->json([
            'message' => 'Equipment assigned successfully.',
            'data' => $assignment,
        ], 201);
    }

    /**
     * Show a single equipment assignment.
     */
    public function show(string $id)
    {
        $assignment = EquipmentAssignment::with([
            'equipment',
            'assignmentGroup',
            'attachments.attachmentType',
            'transfersFrom.toAssignment',
            'transfersTo.fromAssignment',
        ])->findOrFail($id);

        return response()->json([
            'data' => $assignment,
        ]);
    }

    /**
     * Update an equipment assignment.
     */
    public function update(
        Request $request,
        string $id,
        AuditLogService $auditLog
    ) {
        $assignment = EquipmentAssignment::findOrFail($id);

        $validated = $request->validate([
            'property_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
            'serial_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
            'is_care_of' => [
                'sometimes',
                'boolean',
            ],
            'care_of_employee_id' => [
                'sometimes',
                'nullable',
                'exists:employees,id',
            ],
            'user_employee_id' => [
                'sometimes',
                'exists:employees,id',
            ],
            'quantity' => [
                'sometimes',
                'integer',
                'min:1',
            ],
            'assigned_at' => [
                'sometimes',
                'date',
            ],
            'returned_at' => [
                'sometimes',
                'nullable',
                'date',
            ],
            'status' => [
                'sometimes',
                Rule::enum(EquipmentAssignmentStatus::class),
            ],
            'remarks' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $userId = $request->attributes->get('auth_user_id');

        if (!$userId) {
            return response()->json([
                'message' => 'Authenticated user not found.',
            ], 401);
        }

        $oldValues = $this->auditValues($assignment);

        $assignment->fill($validated);
        $assignment->updated_by = $userId;
        $assignment->save();

        $assignment->refresh()->load([
            'equipment',
            'assignmentGroup',
        ]);

        $auditLog->record(
            $request,
            'UPDATE',
            'equipment_assignment',
            (string) $assignment->getKey(),
            'Updated equipment assignment: '
                . ($assignment->property_number ?? $assignment->getKey()),
            $oldValues,
            $this->auditValues($assignment)
        );

        return response()->json([
            'message' => 'Equipment assignment updated successfully.',
            'data' => $assignment,
        ]);
    }

    /**
     * Return assigned equipment.
     */
    public function returnEquipment(
        Request $request,
        string $id,
        AuditLogService $auditLog
    ) {
        $validated = $request->validate([
            'returned_at' => [
                'required',
                'date',
            ],
            'remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $userId = $request->attributes->get('auth_user_id');

        if (!$userId) {
            return response()->json([
                'message' => 'Authenticated user not found.',
            ], 401);
        }

        $result = DB::transaction(function () use (
            $id,
            $validated,
            $userId
        ) {
            $assignment = EquipmentAssignment::query()
                ->lockForUpdate()
                ->findOrFail($id);

            if (
                $assignment->status !== EquipmentAssignmentStatus::ACTIVE
            ) {
                throw ValidationException::withMessages([
                    'status' => 'Only active assignments can be returned.',
                ]);
            }

            $oldValues = $this->auditValues($assignment);

            $assignment->update([
                'status' => EquipmentAssignmentStatus::RETURNED,
                'returned_at' => $validated['returned_at'],
                'remarks' => $validated['remarks'] ?? $assignment->remarks,
                'updated_by' => $userId,
            ]);

            return [
                'old_values' => $oldValues,
                'assignment' => $assignment->fresh([
                    'equipment',
                    'assignmentGroup',
                ]),
            ];
        });

        $assignment = $result['assignment'];

        $auditLog->record(
            $request,
            'UPDATE',
            'equipment_assignment',
            (string) $assignment->getKey(),
            'Returned equipment assignment: '
                . ($assignment->property_number ?? $assignment->getKey()),
            $result['old_values'],
            $this->auditValues($assignment)
        );

        return response()->json([
            'message' => 'Equipment returned successfully.',
            'data' => $assignment,
        ]);
    }

    /**
     * Transfer equipment to another employee.
     */
    public function transfer(
        Request $request,
        string $id,
        AuditLogService $auditLog
    ) {
        $validated = $request->validate([
            'user_employee_id' => [
                'required',
                'exists:employees,id',
            ],
            'is_care_of' => [
                'required',
                'boolean',
            ],
            'care_of_employee_id' => [
                'nullable',
                'required_if:is_care_of,1',
                'exists:employees,id',
            ],
            'transfer_date' => [
                'required',
                'date',
            ],
            'remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $userId = $request->attributes->get('auth_user_id');

        if (!$userId) {
            return response()->json([
                'message' => 'Authenticated user not found.',
            ], 401);
        }

        $result = DB::transaction(function () use (
            $id,
            $validated,
            $userId
        ) {
            $sourceAssignment = EquipmentAssignment::query()
                ->lockForUpdate()
                ->findOrFail($id);

            if (
                $sourceAssignment->status !== EquipmentAssignmentStatus::ACTIVE
            ) {
                throw ValidationException::withMessages([
                    'status' => 'Only active assignments can be transferred.',
                ]);
            }

            if (
                (string) $sourceAssignment->user_employee_id
                === (string) $validated['user_employee_id']
            ) {
                throw ValidationException::withMessages([
                    'user_employee_id' => 'The equipment is already assigned to this employee.',
                ]);
            }

            if (
                $validated['is_care_of']
                && !empty($validated['care_of_employee_id'])
                && (string) $validated['care_of_employee_id']
                    === (string) $validated['user_employee_id']
            ) {
                throw ValidationException::withMessages([
                    'care_of_employee_id' => 'The care-of employee must be different from the assigned employee.',
                ]);
            }

            $sourceOldValues = $this->auditValues($sourceAssignment);

            $sourceAssignment->update([
                'status' => EquipmentAssignmentStatus::TRANSFERRED,
                'returned_at' => $validated['transfer_date'],
                'updated_by' => $userId,
            ]);

            $newAssignment = EquipmentAssignment::create([
                'assignment_group_id' => $sourceAssignment->assignment_group_id,
                'equipment_id' => $sourceAssignment->equipment_id,
                'property_number' => $sourceAssignment->property_number,
                'serial_number' => $sourceAssignment->serial_number,
                'is_care_of' => $validated['is_care_of'],
                'care_of_employee_id' => $validated['is_care_of']
                    ? ($validated['care_of_employee_id'] ?? null)
                    : null,
                'user_employee_id' => $validated['user_employee_id'],
                'quantity' => $sourceAssignment->quantity,
                'assigned_at' => $validated['transfer_date'],
                'status' => EquipmentAssignmentStatus::ACTIVE,
                'remarks' => $validated['remarks']
                    ?? $sourceAssignment->remarks,
                'encoded_by' => $userId,
            ]);

            /*
             * Keep the transfer model's field names aligned with your
             * existing EquipmentTransfer migration/model.
             */
            $transfer = EquipmentTransfer::create([
                'from_assignment_id' => $sourceAssignment->getKey(),
                'to_assignment_id' => $newAssignment->getKey(),
                'transfer_date' => $validated['transfer_date'],
                'remarks' => $validated['remarks'] ?? null,
                'encoded_by' => $userId,
            ]);

            return [
                'source_assignment' => $sourceAssignment->fresh([
                    'equipment',
                    'assignmentGroup',
                ]),
                'source_old_values' => $sourceOldValues,
                'assignment' => $newAssignment->fresh([
                    'equipment',
                    'assignmentGroup',
                ]),
                'transfer' => $transfer,
            ];
        });

        $sourceAssignment = $result['source_assignment'];
        $newAssignment = $result['assignment'];

        // Audit the previous assignment changing to TRANSFERRED.
        $auditLog->record(
            $request,
            'UPDATE',
            'equipment_assignment',
            (string) $sourceAssignment->getKey(),
            'Transferred equipment from employee '
                . $sourceAssignment->user_employee_id,
            $result['source_old_values'],
            $this->auditValues($sourceAssignment)
        );

        // Audit the new active assignment.
        $auditLog->record(
            $request,
            'CREATE',
            'equipment_assignment',
            (string) $newAssignment->getKey(),
            'Created equipment assignment after transfer: '
                . ($newAssignment->property_number ?? $newAssignment->getKey()),
            null,
            $this->auditValues($newAssignment)
        );

        return response()->json([
            'message' => 'Equipment transferred successfully.',
            'data' => [
                'assignment' => $newAssignment,
                'transfer' => $result['transfer'],
            ],
        ], 201);
    }

    /**
     * Dispose of assigned equipment.
     */
    public function dispose(
        Request $request,
        string $id,
        AuditLogService $auditLog
    ) {
        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:5000',
            ],
        ]);

        $userId = $request->attributes->get('auth_user_id');

        if (!$userId) {
            return response()->json([
                'message' => 'Authenticated user not found.',
            ], 401);
        }

        $result = DB::transaction(function () use (
            $id,
            $validated,
            $userId
        ) {
            $assignment = EquipmentAssignment::query()
                ->lockForUpdate()
                ->findOrFail($id);

            if (
                $assignment->status !== EquipmentAssignmentStatus::ACTIVE
            ) {
                throw ValidationException::withMessages([
                    'status' => 'Only active assignments can be disposed.',
                ]);
            }

            $oldValues = $this->auditValues($assignment);

            $assignment->update([
                'status' => EquipmentAssignmentStatus::DISPOSED,
                'remarks' => $validated['remarks'],
                'updated_by' => $userId,
            ]);

            return [
                'old_values' => $oldValues,
                'assignment' => $assignment->fresh([
                    'equipment',
                    'assignmentGroup',
                ]),
            ];
        });

        $assignment = $result['assignment'];

        $auditLog->record(
            $request,
            'UPDATE',
            'equipment_assignment',
            (string) $assignment->getKey(),
            'Disposed equipment assignment: '
                . ($assignment->property_number ?? $assignment->getKey()),
            $result['old_values'],
            $this->auditValues($assignment)
        );

        return response()->json([
            'message' => 'Equipment disposed successfully.',
            'data' => $assignment,
        ]);
    }

    /**
     * Delete an equipment assignment.
     */
    public function destroy(
        Request $request,
        string $id,
        AuditLogService $auditLog
    ) {
        $userId = $request->attributes->get('auth_user_id');

        if (!$userId) {
            return response()->json([
                'message' => 'Authenticated user not found.',
            ], 401);
        }

        $assignment = EquipmentAssignment::findOrFail($id);

        $oldValues = $this->auditValues($assignment);
        $recordId = (string) $assignment->getKey();
        $propertyNumber = $assignment->property_number;

        $assignment->delete();

        $auditLog->record(
            $request,
            'DELETE',
            'equipment_assignment',
            $recordId,
            'Deleted equipment assignment: '
                . ($propertyNumber ?? $recordId),
            $oldValues,
            null
        );

        return response()->json([
            'message' => 'Equipment assignment deleted successfully.',
        ]);
    }
}
