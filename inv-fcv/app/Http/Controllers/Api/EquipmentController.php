<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentAttachment;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EquipmentController extends Controller
{
    /* =====================================================
       DISPLAY A LISTING OF EQUIPMENTS
    ====================================================== */

    public function index(Request $request): JsonResponse
    {
        $query = Equipment::query()
            ->with('equipmentType');

        /* =====================================================
           SEARCH
        ====================================================== */

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'property_number',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'serial_number',
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

        /* =====================================================
           EQUIPMENT TYPE FILTER
        ====================================================== */

        if ($request->filled('equipment_type_ids')) {
            $query->whereIn(
                'equipment_type_id',
                $request->input('equipment_type_ids')
            );
        }

        /* =====================================================
           PAGINATION
        ====================================================== */

        $equipments = $query
            ->latest()
            ->paginate(
                $request->integer('per_page', 15)
            );

        /* =====================================================
           RETURN RESPONSE
        ====================================================== */

        return response()->json($equipments);
    }

    /* =====================================================
       STORE A NEW EQUIPMENT
    ====================================================== */

    public function store(
        Request $request
    ): JsonResponse {
        /* =====================================================
           VALIDATE REQUEST
        ====================================================== */

        $validated = $request->validate([
            /* =====================================================
               EQUIPMENT TYPE
            ====================================================== */

            'equipment_type_id' => [
                'required',
                'uuid',
                'exists:equipment_types,id',
            ],

            /* =====================================================
               EQUIPMENT INFORMATION
            ====================================================== */

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

        /* =====================================================
           GET AUTHENTICATED USER
        ====================================================== */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        /*
         * auth_user_id is supplied by the
         * AuthenticateAuthServiceUser middleware.
         *
         * It is the ULID from auth-fcv.users.id.
         */

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        /* =====================================================
           AUDIT INFORMATION
        ====================================================== */

        $validated['encoded_by'] = $authUserId;
        $validated['updated_by'] = $authUserId;

        /* =====================================================
           CREATE EQUIPMENT
        ====================================================== */

        $equipment = Equipment::create(
            $validated
        );

        /* =====================================================
           LOAD RELATIONSHIPS
        ====================================================== */

        $equipment->load(
            'equipmentType'
        );

        /* =====================================================
           RETURN RESPONSE
        ====================================================== */

        return response()->json([
            'message' =>
                'Equipment created successfully.',

            'data' =>
                $equipment,
        ], 201);
    }

    /* =====================================================
       DISPLAY THE SPECIFIED EQUIPMENT
    ====================================================== */

    public function show(
        Equipment $equipment
    ): JsonResponse {
        /* =====================================================
           LOAD RELATIONSHIPS
        ====================================================== */

        $equipment->load([
            'equipmentType',
            'attachments.attachmentType',
            'assignments',
        ]);

        /* =====================================================
           GENERATE PUBLIC ATTACHMENT URLS
        ====================================================== */

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $equipment->attachments->each(
            function (
                EquipmentAttachment $attachment
            ) use ($disk) {
                $attachment->file_url = $disk->url(
                    $attachment->file_path
                );
            }
        );

        /* =====================================================
           RETURN RESPONSE
        ====================================================== */

        return response()->json([
            'data' =>
                $equipment,
        ]);
    }

    /* =====================================================
       UPDATE THE SPECIFIED EQUIPMENT
    ====================================================== */

    public function update(
        Request $request,
        Equipment $equipment
    ): JsonResponse {
        /* =====================================================
           VALIDATE REQUEST
        ====================================================== */

        $validated = $request->validate([
            /* =====================================================
               EQUIPMENT TYPE
            ====================================================== */

            'equipment_type_id' => [
                'required',
                'uuid',
                'exists:equipment_types,id',
            ],

            /* =====================================================
               EQUIPMENT INFORMATION
            ====================================================== */

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
                )->ignore(
                    $equipment->id
                ),
            ],

            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique(
                    'equipments',
                    'serial_number'
                )->ignore(
                    $equipment->id
                ),
            ],

            'unit_cost' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        /* =====================================================
           GET AUTHENTICATED USER
        ====================================================== */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        /* =====================================================
           CHECK CURRENT ASSIGNED QUANTITY
        ====================================================== */

        $assignedQuantity = $equipment
            ->assignments()
            ->whereNull('returned_at')
            ->sum('quantity');

        /*
         * The equipment quantity cannot be reduced below
         * the number of units that are currently assigned.
         */

        if (
            $validated['quantity'] <
            $assignedQuantity
        ) {
            return response()->json([
                'message' =>
                    'Equipment quantity cannot be less than the currently assigned quantity.',

                'assigned_quantity' =>
                    (int) $assignedQuantity,

                'requested_quantity' =>
                    (int) $validated['quantity'],
            ], 422);
        }

        /* =====================================================
           AUDIT INFORMATION
        ====================================================== */

        /*
         * encoded_by is intentionally NOT changed.
         *
         * It represents the original user who created
         * the equipment record.
         *
         * updated_by represents the user who performed
         * this update.
         */

        $validated['updated_by'] = $authUserId;

        /* =====================================================
           UPDATE EQUIPMENT
        ====================================================== */

        $equipment->update(
            $validated
        );

        /* =====================================================
           LOAD RELATIONSHIPS
        ====================================================== */

        $equipment->load(
            'equipmentType'
        );

        /* =====================================================
           RETURN RESPONSE
        ====================================================== */

        return response()->json([
            'message' =>
                'Equipment updated successfully.',

            'data' =>
                $equipment,
        ]);
    }

    /* =====================================================
       REMOVE THE SPECIFIED EQUIPMENT
    ====================================================== */

    public function destroy(
        Request $request,
        Equipment $equipment
    ): JsonResponse {
        /* =====================================================
           GET AUTHENTICATED USER
        ====================================================== */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        /* =====================================================
           PREVENT DELETION WHILE ASSIGNED
        ====================================================== */

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

        /* =====================================================
           DELETE EQUIPMENT
        ====================================================== */

        $equipment->delete();

        /* =====================================================
           RETURN RESPONSE
        ====================================================== */

        return response()->json([
            'message' =>
                'Equipment deleted successfully.',
        ]);
    }
}