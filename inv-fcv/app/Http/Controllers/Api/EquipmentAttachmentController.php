<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentAssignment;
use App\Models\EquipmentAttachment;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EquipmentAttachmentController extends Controller
{
    /*
     * =====================================================
     *       DISPLAY ATTACHMENTS FOR AN EQUIPMENT
     * =====================================================
     */
    public function index(
        Equipment $equipment
    ): JsonResponse {

        $attachments = $equipment
            ->attachments()
            ->with([
                'attachmentType',
                'equipmentAssignment',
            ])
            ->latest()
            ->get();

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $attachments->each(
            function (
                EquipmentAttachment $attachment
            ) use ($disk) {

                $attachment->file_url = $disk->url(
                    $attachment->file_path
                );
            }
        );

        return response()->json([
            'data' => $attachments,
        ]);
    }


    /*
     * =====================================================
     *       STORE A NEW EQUIPMENT ATTACHMENT
     * =====================================================
     */
    public function store(
        Request $request,
        Equipment $equipment
    ): JsonResponse {

        $validated = $request->validate([
            'equipment_id' => [
                'required',
                'uuid',
                'exists:equipments,id',
            ],

            'equipment_assignment_id' => [
                'nullable',
                'uuid',
                'exists:equipment_assignments,id',
            ],

            'attachment_type_id' => [
                'required',
                'uuid',
                'exists:attachment_types,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'file' => [
                'required',
                'file',
                'max:20480',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * =====================================================
         *       VERIFY EQUIPMENT
         * =====================================================
         */

        if ($validated['equipment_id'] !== $equipment->id) {
            return response()->json([
                'message' =>
                'The specified equipment does not match the equipment route.',
            ], 422);
        }

        /*
         * =====================================================
         *       GET AUTHENTICATED USER
         * =====================================================
         */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * =====================================================
         *       VERIFY EQUIPMENT ASSIGNMENT
         * =====================================================
         */

        $assignment = null;

        if (!empty($validated['equipment_assignment_id'])) {

            $assignment = EquipmentAssignment::query()
                ->where(
                    'id',
                    $validated['equipment_assignment_id']
                )
                ->where(
                    'equipment_id',
                    $validated['equipment_id']
                )
                ->first();

            if (!$assignment) {
                return response()->json([
                    'message' =>
                    'The specified equipment assignment does not belong to the specified equipment.',
                ], 422);
            }
        }

        /*
         * =====================================================
         *       STORE FILE
         * =====================================================
         */

        $file = $request->file('file');

        $filePath = $file->store(
            'equipment-attachments',
            'public'
        );

        /*
         * =====================================================
         *       CREATE ATTACHMENT
         * =====================================================
         */

        $attachment = EquipmentAttachment::create([
            'equipment_id' =>
            $validated['equipment_id'],

            'equipment_assignment_id' =>
            $assignment?->id,

            'attachment_type_id' =>
            $validated['attachment_type_id'],

            'name' =>
            $validated['name'],

            'file_path' =>
            $filePath,

            'file_name' =>
            $file->getClientOriginalName(),

            'mime_type' =>
            $file->getMimeType(),

            'file_size' =>
            $file->getSize(),

            'description' =>
            $validated['description'] ?? null,

            /*
             * =====================================================
             *       AUDIT INFORMATION
             * =====================================================
             */

            'encoded_by' =>
            $authUserId,

            'updated_by' =>
            $authUserId,
        ]);

        /*
         * =====================================================
         *       LOAD RELATIONSHIPS
         * =====================================================
         */

        $attachment->load([
            'attachmentType',
            'equipmentAssignment',
        ]);

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $attachment->file_url = $disk->url(
            $attachment->file_path
        );

        return response()->json([
            'message' =>
            'Equipment attachment uploaded successfully.',

            'data' =>
            $attachment,
        ], 201);
    }


    /*
     * =====================================================
     *       DISPLAY ATTACHMENTS FOR AN ASSIGNMENT
     * =====================================================
     */
    public function assignmentIndex(
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {

        $attachments = $equipmentAssignment
            ->attachments()
            ->with([
                'attachmentType',
                'equipmentAssignment',
            ])
            ->latest()
            ->get();

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $attachments->each(
            function (
                EquipmentAttachment $attachment
            ) use ($disk) {

                $attachment->file_url = $disk->url(
                    $attachment->file_path
                );
            }
        );

        return response()->json([
            'data' => $attachments,
        ]);
    }


    /*
     * =====================================================
     *       STORE A NEW ASSIGNMENT ATTACHMENT
     * =====================================================
     */
    public function assignmentStore(
        Request $request,
        EquipmentAssignment $equipmentAssignment
    ): JsonResponse {

        /*
         * =====================================================
         *       VALIDATE REQUEST
         * =====================================================
         */

        $validated = $request->validate([
            'equipment_id' => [
                'required',
                'uuid',
                'exists:equipments,id',
            ],

            'equipment_assignment_id' => [
                'required',
                'uuid',
                'exists:equipment_assignments,id',
            ],

            'attachment_type_id' => [
                'required',
                'uuid',
                'exists:attachment_types,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'file' => [
                'required',
                'file',
                'max:20480',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * =====================================================
         *       VERIFY ASSIGNMENT
         * =====================================================
         */

        if (
            $validated['equipment_assignment_id']
            !== $equipmentAssignment->id
        ) {
            return response()->json([
                'message' =>
                'The specified equipment assignment does not match the assignment route.',
            ], 422);
        }

        /*
         * =====================================================
         *       VERIFY EQUIPMENT
         * =====================================================
         */

        if (
            $validated['equipment_id']
            !== $equipmentAssignment->equipment_id
        ) {
            return response()->json([
                'message' =>
                'The specified equipment does not belong to the equipment assignment.',
            ], 422);
        }

        /*
         * =====================================================
         *       GET AUTHENTICATED USER
         * =====================================================
         */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * =====================================================
         *       STORE FILE
         * =====================================================
         */

        $file = $request->file('file');

        $filePath = $file->store(
            'equipment-attachments',
            'public'
        );

        /*
         * =====================================================
         *       CREATE ATTACHMENT
         * =====================================================
         */

        $attachment = EquipmentAttachment::create([
            'equipment_id' =>
            $equipmentAssignment->equipment_id,

            'equipment_assignment_id' =>
            $equipmentAssignment->id,

            'attachment_type_id' =>
            $validated['attachment_type_id'],

            'name' =>
            $validated['name'],

            'file_path' =>
            $filePath,

            'file_name' =>
            $file->getClientOriginalName(),

            'mime_type' =>
            $file->getMimeType(),

            'file_size' =>
            $file->getSize(),

            'description' =>
            $validated['description'] ?? null,

            /*
             * =====================================================
             *       AUDIT INFORMATION
             * =====================================================
             */

            'encoded_by' =>
            $authUserId,

            'updated_by' =>
            $authUserId,
        ]);

        /*
         * =====================================================
         *       LOAD RELATIONSHIPS
         * =====================================================
         */

        $attachment->load([
            'attachmentType',
            'equipmentAssignment',
        ]);

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $attachment->file_url = $disk->url(
            $attachment->file_path
        );

        return response()->json([
            'message' =>
            'Equipment assignment attachment uploaded successfully.',

            'data' =>
            $attachment,
        ], 201);
    }


    /*
     * =====================================================
     *       DISPLAY THE SPECIFIED ATTACHMENT
     * =====================================================
     */
    public function show(
        Equipment $equipment,
        EquipmentAttachment $attachment
    ): JsonResponse {

        /*
         * =====================================================
         *       VERIFY ATTACHMENT OWNERSHIP
         * =====================================================
         */

        abort_unless(
            $attachment->equipment_id === $equipment->id,
            404
        );

        /*
         * =====================================================
         *       LOAD RELATIONSHIPS
         * =====================================================
         */

        $attachment->load([
            'attachmentType',
            'equipmentAssignment',
        ]);

        /*
         * =====================================================
         *       GENERATE FILE URL
         * =====================================================
         */

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $attachment->file_url = $disk->url(
            $attachment->file_path
        );

        return response()->json([
            'data' => $attachment,
        ]);
    }


    /*
     * =====================================================
     *       UPDATE THE SPECIFIED ATTACHMENT
     * =====================================================
     */
    public function update(
        Request $request,
        Equipment $equipment,
        EquipmentAttachment $attachment
    ): JsonResponse {

        /*
         * =====================================================
         *       VERIFY ATTACHMENT OWNERSHIP
         * =====================================================
         */

        abort_unless(
            $attachment->equipment_id === $equipment->id,
            404
        );

        /*
         * =====================================================
         *       VALIDATE REQUEST
         * =====================================================
         */

        $validated = $request->validate([
            'equipment_id' => [
                'required',
                'uuid',
                'exists:equipments,id',
            ],

            'equipment_assignment_id' => [
                'nullable',
                'uuid',
                'exists:equipment_assignments,id',
            ],

            'attachment_type_id' => [
                'required',
                'uuid',
                'exists:attachment_types,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'file' => [
                'nullable',
                'file',
                'max:20480',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * =====================================================
         *       VERIFY EQUIPMENT
         * =====================================================
         */

        if ($validated['equipment_id'] !== $equipment->id) {
            return response()->json([
                'message' =>
                'The specified equipment does not match the equipment route.',
            ], 422);
        }

        /*
         * =====================================================
         *       GET AUTHENTICATED USER
         * =====================================================
         */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * =====================================================
         *       VERIFY EQUIPMENT ASSIGNMENT
         * =====================================================
         */

        $assignment = null;

        if (!empty($validated['equipment_assignment_id'])) {

            $assignment = EquipmentAssignment::query()
                ->where(
                    'id',
                    $validated['equipment_assignment_id']
                )
                ->where(
                    'equipment_id',
                    $validated['equipment_id']
                )
                ->first();

            if (!$assignment) {
                return response()->json([
                    'message' =>
                    'The specified equipment assignment does not belong to the specified equipment.',
                ], 422);
            }
        }

        /*
         * =====================================================
         *       STORAGE DISK
         * =====================================================
         */

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        /*
         * =====================================================
         *       REPLACE FILE
         * =====================================================
         */

        if ($request->hasFile('file')) {

            $file = $request->file('file');

            $oldFilePath = $attachment->file_path;

            /*
             * Store new file first.
             */

            $filePath = $file->store(
                'equipment-attachments',
                'public'
            );

            $attachment->file_path =
                $filePath;

            $attachment->file_name =
                $file->getClientOriginalName();

            $attachment->mime_type =
                $file->getMimeType();

            $attachment->file_size =
                $file->getSize();

            /*
             * Delete previous file.
             */

            if (
                $oldFilePath &&
                $disk->exists($oldFilePath)
            ) {
                $disk->delete(
                    $oldFilePath
                );
            }
        }

        /*
         * =====================================================
         *       UPDATE ATTACHMENT INFORMATION
         * =====================================================
         */

        $attachment->equipment_id =
            $validated['equipment_id'];

        $attachment->equipment_assignment_id =
            $assignment?->id;

        $attachment->attachment_type_id =
            $validated['attachment_type_id'];

        $attachment->name =
            $validated['name'];

        $attachment->description =
            $validated['description'] ?? null;

        /*
         * =====================================================
         *       AUDIT INFORMATION
         * =====================================================
         */

        /*
         * encoded_by is intentionally not changed.
         *
         * updated_by records the authenticated user
         * who performed this update.
         */

        $attachment->updated_by =
            $authUserId;

        /*
         * =====================================================
         *       SAVE ATTACHMENT
         * =====================================================
         */

        $attachment->save();

        /*
         * =====================================================
         *       LOAD RELATIONSHIPS
         * =====================================================
         */

        $attachment->load([
            'attachmentType',
            'equipmentAssignment',
        ]);

        /*
         * =====================================================
         *       GENERATE FILE URL
         * =====================================================
         */

        $attachment->file_url = $disk->url(
            $attachment->file_path
        );

        return response()->json([
            'message' =>
            'Equipment attachment updated successfully.',

            'data' =>
            $attachment,
        ]);
    }


    /*
     * =====================================================
     *       REMOVE THE SPECIFIED ATTACHMENT
     * =====================================================
     */
    public function destroy(
        Request $request,
        Equipment $equipment,
        EquipmentAttachment $attachment
    ): JsonResponse {

        /*
         * =====================================================
         *       VERIFY ATTACHMENT OWNERSHIP
         * =====================================================
         */

        abort_unless(
            $attachment->equipment_id === $equipment->id,
            404
        );

        /*
         * =====================================================
         *       GET AUTHENTICATED USER
         * =====================================================
         */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                'Authenticated user could not be identified.',
            ], 401);
        }

        /*
         * =====================================================
         *       STORAGE DISK
         * =====================================================
         */

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        /*
         * =====================================================
         *       DELETE FILE
         * =====================================================
         */

        if (
            $attachment->file_path &&
            $disk->exists($attachment->file_path)
        ) {
            $disk->delete(
                $attachment->file_path
            );
        }

        /*
         * =====================================================
         *       DELETE DATABASE RECORD
         * =====================================================
         */

        $attachment->delete();

        /*
         * =====================================================
         *       RETURN RESPONSE
         * =====================================================
         */

        return response()->json([
            'message' =>
            'Equipment attachment deleted successfully.',
        ]);
    }
}
