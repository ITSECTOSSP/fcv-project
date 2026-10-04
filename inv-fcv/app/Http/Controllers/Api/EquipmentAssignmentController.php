<?php

namespace App\Http\Controllers\Api;

use App\Enums\EquipmentAssignmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentAssignment;
use App\Models\EquipmentTransfer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EquipmentAssignmentController extends Controller
{
    /**
     * Display a listing of equipment assignments.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id' => [
                'nullable',
                'uuid',
                'exists:equipments,id',
            ],
            'assignment_group_id' => [
                'nullable',
                'uuid',
            ],
            'user_employee_id' => [
                'nullable',
                'uuid',
            ],
            'status' => [
                'nullable',
                'in:active,returned,transferred,disposed',
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $assignments = EquipmentAssignment::query()
            ->with([
                'equipment',
            ])
            ->when(
                $validated['equipment_id'] ?? null,
                function ($query, $equipmentId) {
                    $query->where(
                        'equipment_id',
                        $equipmentId
                    );
                }
            )
            ->when(
                $validated['assignment_group_id'] ?? null,
                function ($query, $assignmentGroupId) {
                    $query->where(
                        'assignment_group_id',
                        $assignmentGroupId
                    );
                }
            )
            ->when(
                $validated['user_employee_id'] ?? null,
                function ($query, $userEmployeeId) {
                    $query->where(
                        'user_employee_id',
                        $userEmployeeId
                    );
                }
            )
            ->when(
                $validated['status'] ?? null,
                function ($query, $status) {
                    $query->where(
                        'status',
                        $status
                    );
                }
            )
            ->orderByDesc('assigned_at')
            ->orderByDesc('created_at')
            ->paginate(
                $validated['per_page'] ?? 15
            );

        return response()->json($assignments);
    }

    /**
     * Store a newly created equipment assignment.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id' => [
                'required',
                'uuid',
                'exists:equipments,id',
            ],
            'property_number' => [
                'required',
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
                'uuid',
            ],
            'user_employee_id' => [
                'required',
                'uuid',
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
            ],
        ]);

        /*
         * --------------------------------------------------------------------------
         * Get Authenticated User
         * --------------------------------------------------------------------------
         */

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * --------------------------------------------------------------------------
         * Care Of Validation
         * --------------------------------------------------------------------------
         */

        if (
            $validated['is_care_of'] === true &&
            empty($validated['care_of_employee_id'])
        ) {
            throw ValidationException::withMessages([
                'care_of_employee_id' => [
                    'The care of employee is required when the equipment is under care of an employee.',
                ],
            ]);
        }

        /*
         * --------------------------------------------------------------------------
         * Create Assignment
         * --------------------------------------------------------------------------
         */

        $assignment = DB::transaction(function () use (
            $validated,
            $authUserId
        ) {
            /*
             * ----------------------------------------------------------------------
             * Lock Equipment
             * ----------------------------------------------------------------------
             */

            $equipment = Equipment::query()
                ->lockForUpdate()
                ->findOrFail($validated['equipment_id']);

            /*
             * ----------------------------------------------------------------------
             * Calculate Currently Assigned Quantity
             * ----------------------------------------------------------------------
             */

            $assignedQuantity = EquipmentAssignment::query()
                ->where(
                    'equipment_id',
                    $equipment->id
                )
                ->where(
                    'status',
                    EquipmentAssignmentStatus::ACTIVE
                )
                ->sum('quantity');

            $availableQuantity =
                $equipment->quantity - $assignedQuantity;

            /*
             * ----------------------------------------------------------------------
             * Validate Available Quantity
             * ----------------------------------------------------------------------
             */

            if ($validated['quantity'] > $availableQuantity) {
                throw ValidationException::withMessages([
                    'quantity' => [
                        "Only {$availableQuantity} unit(s) are currently available.",
                    ],
                ]);
            }

            /*
             * ----------------------------------------------------------------------
             * Validate Property Number
             * ----------------------------------------------------------------------
             */

            $propertyNumberExists = EquipmentAssignment::query()
                ->where(
                    'property_number',
                    $validated['property_number']
                )
                ->where(
                    'status',
                    EquipmentAssignmentStatus::ACTIVE
                )
                ->exists();

            if ($propertyNumberExists) {
                throw ValidationException::withMessages([
                    'property_number' => [
                        'This property number is already assigned.',
                    ],
                ]);
            }

            /*
             * ----------------------------------------------------------------------
             * Validate Serial Number
             * ----------------------------------------------------------------------
             */

            if (!empty($validated['serial_number'])) {
                $serialNumberExists = EquipmentAssignment::query()
                    ->where(
                        'serial_number',
                        $validated['serial_number']
                    )
                    ->where(
                        'status',
                        EquipmentAssignmentStatus::ACTIVE
                    )
                    ->exists();

                if ($serialNumberExists) {
                    throw ValidationException::withMessages([
                        'serial_number' => [
                            'This serial number is already assigned.',
                        ],
                    ]);
                }
            }

            /*
             * ----------------------------------------------------------------------
             * Create Assignment Group
             * ----------------------------------------------------------------------
             */

            $assignmentGroupId = (string) Str::uuid();

            /*
             * ----------------------------------------------------------------------
             * Create Assignment
             * ----------------------------------------------------------------------
             */

            return EquipmentAssignment::create([
                'assignment_group_id' =>
                $assignmentGroupId,

                'equipment_id' =>
                $equipment->id,

                'property_number' =>
                $validated['property_number'],

                'serial_number' =>
                $validated['serial_number'] ?? null,

                'is_care_of' =>
                $validated['is_care_of'],

                'care_of_employee_id' =>
                $validated['care_of_employee_id'] ?? null,

                'user_employee_id' =>
                $validated['user_employee_id'],

                'quantity' =>
                $validated['quantity'],

                'assigned_at' =>
                $validated['assigned_at'],

                'status' =>
                EquipmentAssignmentStatus::ACTIVE,

                'remarks' =>
                $validated['remarks'] ?? null,

                'encoded_by' =>
                $authUserId,
            ]);
        });

        return response()->json([
            'message' => 'Equipment assigned successfully.',
            'data' => $assignment->load('equipment'),
        ], 201);
    }

    /**
     * Display the specified equipment assignment.
     */
    public function show(
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {
        return response()->json([
            'data' => $equipmentAssignment->load([
                'equipment',
                'assignmentGroup',
                'attachments.attachmentType',
                'transfersFrom.toAssignment',
                'transfersTo.fromAssignment',
            ]),
        ]);
    }

    /**
     * Update the specified equipment assignment.
     */
    public function update(
        Request $request,
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {
        $validated = $request->validate([
            'property_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
            ],
            'is_care_of' => [
                'sometimes',
                'boolean',
            ],
            'care_of_employee_id' => [
                'nullable',
                'uuid',
            ],
            'user_employee_id' => [
                'sometimes',
                'required',
                'uuid',
            ],
            'quantity' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],
            'assigned_at' => [
                'sometimes',
                'required',
                'date',
            ],
            'returned_at' => [
                'nullable',
                'date',
            ],
            'status' => [
                'sometimes',
                'required',
                'in:active,returned,transferred,disposed',
            ],
            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * --------------------------------------------------------------------------
         * Get Authenticated User
         * --------------------------------------------------------------------------
         */

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        $validated['updated_by'] = $authUserId;

        $equipmentAssignment->update($validated);

        return response()->json([
            'message' => 'Equipment assignment updated successfully.',
            'data' => $equipmentAssignment
                ->fresh()
                ->load([
                    'equipment',
                    'attachments.attachmentType',
                ]),
        ]);
    }

    /**
     * Mark an equipment assignment as returned.
     *
     * This is a terminal state for the current assignment.
     */
    public function returnEquipment(
        Request $request,
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {
        $validated = $request->validate([
            'returned_at' => [
                'required',
                'date',
            ],
            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * --------------------------------------------------------------------------
         * Get Authenticated User
         * --------------------------------------------------------------------------
         */

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * --------------------------------------------------------------------------
         * Return Assignment
         * --------------------------------------------------------------------------
         *
         * Lock the assignment so two simultaneous requests cannot both
         * successfully change the same active assignment.
         */

        $updatedAssignment = DB::transaction(function () use (
            $equipmentAssignment,
            $validated,
            $authUserId
        ) {
            $assignment = EquipmentAssignment::query()
                ->lockForUpdate()
                ->findOrFail($equipmentAssignment->id);

            /*
             * ----------------------------------------------------------------------
             * Validate Current Status
             * ----------------------------------------------------------------------
             */

            if (
                $assignment->status !==
                EquipmentAssignmentStatus::ACTIVE
            ) {
                throw ValidationException::withMessages([
                    'status' => [
                        'Only active equipment assignments can be returned.',
                    ],
                ]);
            }

            /*
             * ----------------------------------------------------------------------
             * Mark Assignment as Returned
             * ----------------------------------------------------------------------
             */

            $assignment->update([
                'status' =>
                EquipmentAssignmentStatus::RETURNED,

                'returned_at' =>
                $validated['returned_at'],

                'remarks' =>
                $validated['remarks'] ?? null,

                'updated_by' =>
                $authUserId,
            ]);

            return $assignment;
        });

        return response()->json([
            'message' => 'Equipment returned successfully.',
            'data' => $updatedAssignment
                ->fresh()
                ->load([
                    'equipment',
                    'attachments.attachmentType',
                ]),
        ]);
    }

    /**
     * Transfer an equipment assignment to another employee.
     *
     * This creates a new assignment while preserving the
     * assignment history and transfer relationship.
     */
    public function transfer(
        Request $request,
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {
        $validated = $request->validate([
            /*
             * ----------------------------------------------------------------------
             * Receiving Employee
             * ----------------------------------------------------------------------
             */

            'user_employee_id' => [
                'required',
                'uuid',
            ],

            /*
             * ----------------------------------------------------------------------
             * Care Of
             * ----------------------------------------------------------------------
             */

            'is_care_of' => [
                'required',
                'boolean',
            ],

            'care_of_employee_id' => [
                'nullable',
                'uuid',
            ],

            /*
             * ----------------------------------------------------------------------
             * Transfer Date
             * ----------------------------------------------------------------------
             */

            'transferred_at' => [
                'required',
                'date',
            ],

            /*
             * ----------------------------------------------------------------------
             * Remarks
             * ----------------------------------------------------------------------
             */

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * --------------------------------------------------------------------------
         * Get Authenticated User
         * --------------------------------------------------------------------------
         */

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * --------------------------------------------------------------------------
         * Care Of Validation
         * --------------------------------------------------------------------------
         */

        if (
            $validated['is_care_of'] === true &&
            empty($validated['care_of_employee_id'])
        ) {
            throw ValidationException::withMessages([
                'care_of_employee_id' => [
                    'The care of employee is required when the equipment is under care of an employee.',
                ],
            ]);
        }

        /*
         * --------------------------------------------------------------------------
         * Prevent Self Transfer
         * --------------------------------------------------------------------------
         */

        if (
            $validated['user_employee_id'] ===
            $equipmentAssignment->user_employee_id
        ) {
            throw ValidationException::withMessages([
                'user_employee_id' => [
                    'The equipment is already assigned to this employee.',
                ],
            ]);
        }

        /*
         * --------------------------------------------------------------------------
         * Transfer Assignment
         * --------------------------------------------------------------------------
         */

        $result = DB::transaction(function () use (
            $equipmentAssignment,
            $validated,
            $authUserId
        ) {
            /*
             * ----------------------------------------------------------------------
             * Lock Equipment
             * ----------------------------------------------------------------------
             */

            $equipment = Equipment::query()
                ->lockForUpdate()
                ->findOrFail($equipmentAssignment->equipment_id);

            /*
             * ----------------------------------------------------------------------
             * Lock Source Assignment
             * ----------------------------------------------------------------------
             */

            $sourceAssignment = EquipmentAssignment::query()
                ->lockForUpdate()
                ->findOrFail($equipmentAssignment->id);

            /*
             * ----------------------------------------------------------------------
             * Validate Source Assignment
             * ----------------------------------------------------------------------
             */

            if (
                $sourceAssignment->status !==
                EquipmentAssignmentStatus::ACTIVE
            ) {
                throw ValidationException::withMessages([
                    'status' => [
                        'Only active equipment assignments can be transferred.',
                    ],
                ]);
            }

            /*
             * ----------------------------------------------------------------------
             * Prevent Same Employee Transfer
             * ----------------------------------------------------------------------
             */

            if (
                $sourceAssignment->user_employee_id ===
                $validated['user_employee_id']
            ) {
                throw ValidationException::withMessages([
                    'user_employee_id' => [
                        'The equipment is already assigned to this employee.',
                    ],
                ]);
            }

            /*
             * ----------------------------------------------------------------------
             * Mark Source Assignment as Transferred
             * ----------------------------------------------------------------------
             */

            $sourceAssignment->update([
                'status' =>
                EquipmentAssignmentStatus::TRANSFERRED,

                'returned_at' =>
                $validated['transferred_at'],

                'updated_by' =>
                $authUserId,
            ]);

            /*
             * ----------------------------------------------------------------------
             * Create Destination Assignment
             * ----------------------------------------------------------------------
             *
             * The new assignment inherits:
             *
             * - assignment_group_id
             * - equipment_id
             * - property_number
             * - serial_number
             * - quantity
             *
             * This keeps the physical equipment identity and lifecycle
             * connected.
             */

            $newAssignment = EquipmentAssignment::create([
                'assignment_group_id' =>
                $sourceAssignment->assignment_group_id,

                'equipment_id' =>
                $equipment->id,

                'property_number' =>
                $sourceAssignment->property_number,

                'serial_number' =>
                $sourceAssignment->serial_number,

                'is_care_of' =>
                $validated['is_care_of'],

                'care_of_employee_id' =>
                $validated['care_of_employee_id'] ?? null,

                'user_employee_id' =>
                $validated['user_employee_id'],

                'quantity' =>
                $sourceAssignment->quantity,

                'assigned_at' =>
                $validated['transferred_at'],

                'status' =>
                EquipmentAssignmentStatus::ACTIVE,

                'remarks' =>
                $validated['remarks'] ?? null,

                'encoded_by' =>
                $authUserId,
            ]);

            /*
             * ----------------------------------------------------------------------
             * Create Transfer Record
             * ----------------------------------------------------------------------
             */

            $transfer = EquipmentTransfer::create([
                'equipment_id' =>
                $equipment->id,

                'from_assignment_id' =>
                $sourceAssignment->id,

                'to_assignment_id' =>
                $newAssignment->id,

                'quantity' =>
                $sourceAssignment->quantity,

                'transferred_at' =>
                $validated['transferred_at'],

                'remarks' =>
                $validated['remarks'] ?? null,

                'encoded_by' =>
                $authUserId,
            ]);

            return [
                'assignment' => $newAssignment,
                'transfer' => $transfer,
            ];
        });

        return response()->json([
            'message' => 'Equipment transferred successfully.',

            'data' => [
                'assignment' => $result['assignment']
                    ->load([
                        'equipment',
                        'attachments.attachmentType',
                    ]),

                'transfer' => $result['transfer']
                    ->load([
                        'fromAssignment',
                        'toAssignment',
                    ]),
            ],
        ], 201);
    }

    /**
     * Mark an equipment assignment as disposed.
     *
     * Disposal is a terminal state for the current assignment.
     */
    public function dispose(
        Request $request,
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {
        $validated = $request->validate([
            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * --------------------------------------------------------------------------
         * Get Authenticated User
         * --------------------------------------------------------------------------
         */

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * --------------------------------------------------------------------------
         * Dispose Assignment
         * --------------------------------------------------------------------------
         */

        $updatedAssignment = DB::transaction(function () use (
            $equipmentAssignment,
            $validated,
            $authUserId
        ) {
            /*
             * ----------------------------------------------------------------------
             * Lock Assignment
             * ----------------------------------------------------------------------
             */

            $assignment = EquipmentAssignment::query()
                ->lockForUpdate()
                ->findOrFail($equipmentAssignment->id);

            /*
             * ----------------------------------------------------------------------
             * Validate Current Status
             * ----------------------------------------------------------------------
             */

            if (
                $assignment->status !==
                EquipmentAssignmentStatus::ACTIVE
            ) {
                throw ValidationException::withMessages([
                    'status' => [
                        'Only active equipment assignments can be disposed.',
                    ],
                ]);
            }

            /*
             * ----------------------------------------------------------------------
             * Mark Assignment as Disposed
             * ----------------------------------------------------------------------
             *
             * Do NOT set returned_at here.
             *
             * returned_at represents an actual equipment return and
             * should remain null for disposed equipment.
             */

            $assignment->update([
                'status' =>
                EquipmentAssignmentStatus::DISPOSED,

                'remarks' =>
                $validated['remarks'] ?? null,

                'updated_by' =>
                $authUserId,
            ]);

            return $assignment;
        });

        return response()->json([
            'message' => 'Equipment assignment disposed successfully.',
            'data' => $updatedAssignment
                ->fresh()
                ->load([
                    'equipment',
                    'attachments.attachmentType',
                ]),
        ]);
    }

    /**
     * Remove the specified equipment assignment.
     */
    public function destroy(
        Request $request,
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {
        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        $equipmentAssignment->delete();

        return response()->json([
            'message' => 'Equipment assignment deleted successfully.',
        ]);
    }
}
