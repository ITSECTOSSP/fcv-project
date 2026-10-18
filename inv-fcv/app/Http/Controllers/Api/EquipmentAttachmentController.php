<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentAssignment;
use App\Models\EquipmentAttachment;
use App\Services\AuditLogService;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Throwable;

class EquipmentAttachmentController extends Controller
{
    /**
     * Fields to include in audit snapshots.
     */
    private function auditValues(
        EquipmentAttachment $attachment
    ): array {
        return $attachment->only([
            'equipment_id',
            'equipment_assignment_id',
            'attachment_type_id',
            'name',
            'file_path',
            'file_name',
            'mime_type',
            'file_size',
            'description',
            'encoded_by',
            'updated_by',
        ]);
    }

    /**
     * Display attachments for an equipment.
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

        $attachments->each(function (
            EquipmentAttachment $attachment
        ) use ($disk) {
            $attachment->file_url = $disk->url(
                $attachment->file_path
            );
        });

        return response()->json([
            'data' => $attachments,
        ]);
    }

    /**
     * Store a new equipment attachment.
     */
    public function store(
        Request $request,
        Equipment $equipment,
        AuditLogService $auditLog
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

        if ($validated['equipment_id'] !== $equipment->id) {
            return response()->json([
                'message' =>
                    'The specified equipment does not match the equipment route.',
            ], 422);
        }

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                    'Authenticated user could not be identified.',
            ], 401);
        }

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

        $file = $request->file('file');

        $filePath = $file->store(
            'equipment-attachments',
            'public'
        );

        try {
            $attachment = EquipmentAttachment::create([
                'equipment_id' => $validated['equipment_id'],
                'equipment_assignment_id' => $assignment?->id,
                'attachment_type_id' => $validated['attachment_type_id'],
                'name' => $validated['name'],
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'description' => $validated['description'] ?? null,
                'encoded_by' => $authUserId,
                'updated_by' => $authUserId,
            ]);
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($filePath);

            throw $exception;
        }

        $attachment->load([
            'attachmentType',
            'equipmentAssignment',
        ]);

        $auditLog->record(
            $request,
            'CREATE',
            'equipment_attachment',
            (string) $attachment->getKey(),
            'Uploaded equipment attachment: '
                . $attachment->name,
            null,
            $this->auditValues($attachment)
        );

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $attachment->file_url = $disk->url(
            $attachment->file_path
        );

        return response()->json([
            'message' =>
                'Equipment attachment uploaded successfully.',
            'data' => $attachment,
        ], 201);
    }

    /**
     * Display attachments for an assignment.
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

        $attachments->each(function (
            EquipmentAttachment $attachment
        ) use ($disk) {
            $attachment->file_url = $disk->url(
                $attachment->file_path
            );
        });

        return response()->json([
            'data' => $attachments,
        ]);
    }

    /**
     * Store a new assignment attachment.
     */
    public function assignmentStore(
        Request $request,
        EquipmentAssignment $equipmentAssignment,
        AuditLogService $auditLog
    ): JsonResponse {
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

        if (
            $validated['equipment_assignment_id']
            !== $equipmentAssignment->id
        ) {
            return response()->json([
                'message' =>
                    'The specified equipment assignment does not match the assignment route.',
            ], 422);
        }

        if (
            $validated['equipment_id']
            !== $equipmentAssignment->equipment_id
        ) {
            return response()->json([
                'message' =>
                    'The specified equipment does not belong to the equipment assignment.',
            ], 422);
        }

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                    'Authenticated user could not be identified.',
            ], 401);
        }

        $file = $request->file('file');

        $filePath = $file->store(
            'equipment-attachments',
            'public'
        );

        try {
            $attachment = EquipmentAttachment::create([
                'equipment_id' => $equipmentAssignment->equipment_id,
                'equipment_assignment_id' => $equipmentAssignment->id,
                'attachment_type_id' => $validated['attachment_type_id'],
                'name' => $validated['name'],
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'description' => $validated['description'] ?? null,
                'encoded_by' => $authUserId,
                'updated_by' => $authUserId,
            ]);
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($filePath);

            throw $exception;
        }

        $attachment->load([
            'attachmentType',
            'equipmentAssignment',
        ]);

        $auditLog->record(
            $request,
            'CREATE',
            'equipment_attachment',
            (string) $attachment->getKey(),
            'Uploaded attachment for equipment assignment: '
                . $attachment->name,
            null,
            $this->auditValues($attachment)
        );

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $attachment->file_url = $disk->url(
            $attachment->file_path
        );

        return response()->json([
            'message' =>
                'Equipment assignment attachment uploaded successfully.',
            'data' => $attachment,
        ], 201);
    }

    /**
     * Display the specified attachment.
     */
    public function show(
        Equipment $equipment,
        EquipmentAttachment $attachment
    ): JsonResponse {
        abort_unless(
            $attachment->equipment_id === $equipment->id,
            404
        );

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
            'data' => $attachment,
        ]);
    }

    /**
     * Update attachment information or replace its file.
     */
    public function update(
        Request $request,
        Equipment $equipment,
        EquipmentAttachment $attachment,
        AuditLogService $auditLog
    ): JsonResponse {
        abort_unless(
            $attachment->equipment_id === $equipment->id,
            404
        );

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

        if ($validated['equipment_id'] !== $equipment->id) {
            return response()->json([
                'message' =>
                    'The specified equipment does not match the equipment route.',
            ], 422);
        }

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                    'Authenticated user could not be identified.',
            ], 401);
        }

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

        $oldValues = $this->auditValues($attachment);
        $oldFilePath = $attachment->file_path;
        $newFilePath = null;

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            $newFilePath = $file->store(
                'equipment-attachments',
                'public'
            );

            $attachment->file_path = $newFilePath;
            $attachment->file_name = $file->getClientOriginalName();
            $attachment->mime_type = $file->getMimeType();
            $attachment->file_size = $file->getSize();
        }

        $attachment->equipment_id = $validated['equipment_id'];
        $attachment->equipment_assignment_id = $assignment?->id;
        $attachment->attachment_type_id = $validated['attachment_type_id'];
        $attachment->name = $validated['name'];
        $attachment->description = $validated['description'] ?? null;
        $attachment->updated_by = $authUserId;

        try {
            $attachment->save();
        } catch (Throwable $exception) {
            if ($newFilePath) {
                $disk->delete($newFilePath);
            }

            throw $exception;
        }

        $attachment->refresh();

        $auditLog->record(
            $request,
            'UPDATE',
            'equipment_attachment',
            (string) $attachment->getKey(),
            'Updated equipment attachment: '
                . $attachment->name,
            $oldValues,
            $this->auditValues($attachment)
        );

        /*
         * Delete the previous file only after the database
         * update has succeeded.
         */
        if (
            $newFilePath
            && $oldFilePath
            && $oldFilePath !== $newFilePath
            && $disk->exists($oldFilePath)
        ) {
            $disk->delete($oldFilePath);
        }

        $attachment->load([
            'attachmentType',
            'equipmentAssignment',
        ]);

        $attachment->file_url = $disk->url(
            $attachment->file_path
        );

        return response()->json([
            'message' =>
                'Equipment attachment updated successfully.',
            'data' => $attachment,
        ]);
    }

    /**
     * Delete the specified attachment.
     */
    public function destroy(
        Request $request,
        Equipment $equipment,
        EquipmentAttachment $attachment,
        AuditLogService $auditLog
    ): JsonResponse {
        abort_unless(
            $attachment->equipment_id === $equipment->id,
            404
        );

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        if (!$authUserId) {
            return response()->json([
                'message' =>
                    'Authenticated user could not be identified.',
            ], 401);
        }

        $oldValues = $this->auditValues($attachment);
        $attachmentId = (string) $attachment->getKey();
        $attachmentName = $attachment->name;
        $filePath = $attachment->file_path;

        /*
         * Delete the database record first so the audit
         * snapshot can be recorded after a successful delete.
         */
        $attachment->delete();

        $auditLog->record(
            $request,
            'DELETE',
            'equipment_attachment',
            $attachmentId,
            'Deleted equipment attachment: '
                . $attachmentName,
            $oldValues,
            null
        );

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        if (
            $filePath
            && $disk->exists($filePath)
        ) {
            $disk->delete($filePath);
        }

        return response()->json([
            'message' =>
                'Equipment attachment deleted successfully.',
        ]);
    }
}
