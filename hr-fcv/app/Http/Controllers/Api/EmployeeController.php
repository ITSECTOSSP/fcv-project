<?php

namespace App\Http\Controllers\Api;

use App\Enums\EmployeeStatus;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Services\AuthService;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /**
     * Build a snapshot of employee values for audit logging.
     */
    private function auditValues(Employee $employee): array
    {
        $values = $employee->only([
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'date_birth',
            'email',
            'contact_number',
            'section_id',
            'status',
        ]);

        // Keep the date consistent in audit records.
        $values['date_birth'] = $employee->date_birth
            ? $employee->date_birth->format('Y-m-d')
            : null;

        // Store the enum's scalar value rather than the enum object.
        $status = $employee->status;

        $values['status'] = $status instanceof EmployeeStatus
            ? $status->value
            : $status;

        return $values;
    }

    /**
     * Display the authenticated user's employee.
     */
    public function me(
        Request $request,
        AuthService $authService
    ): JsonResponse {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Authentication token could not be identified.',
            ], 401);
        }

        $employeeId = $authService->getAuthenticatedEmployeeId($token);

        if (!$employeeId) {
            return response()->json([
                'data' => null,
                'message' => 'The authenticated user is not linked to an employee.',
            ]);
        }

        $employee = Employee::query()
            ->with(['section.division'])
            ->find($employeeId);

        if (!$employee) {
            return response()->json([
                'data' => null,
                'message' => 'The employee linked to this account could not be found.',
            ], 404);
        }

        return response()->json([
            'data' => $employee,
        ]);
    }

    /**
     * Display a listing of employees.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::query()
            ->with(['section.division']);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($query) use ($search) {
                $query
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('division_ids')) {
            $query->whereHas(
                'section',
                function ($sectionQuery) use ($request) {
                    $sectionQuery->whereIn(
                        'division_id',
                        $request->input('division_ids')
                    );
                }
            );
        }

        if ($request->filled('section_ids')) {
            $query->whereIn(
                'section_id',
                $request->input('section_ids')
            );
        }

        $employees = $query
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($employees);
    }

    /**
     * Store a newly created employee.
     */
    public function store(
        Request $request,
        AuditLogService $auditLog
    ): JsonResponse {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],
            'middle_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'last_name' => [
                'required',
                'string',
                'max:255',
            ],
            'date_birth' => [
                'required',
                'date',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:employees,email',
            ],
            'contact_number' => [
                'required',
                'string',
                'max:20',
                'unique:employees,contact_number',
            ],
            'section_id' => [
                'required',
                'integer',
                'exists:sections,id',
            ],
            'status' => [
                'sometimes',
                Rule::enum(EmployeeStatus::class),
            ],
        ]);

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        $validated['status'] ??= EmployeeStatus::ACTIVE->value;
        $validated['encoded_by'] = $authUserId;
        $validated['updated_by'] = $authUserId;

        // Create the employee inside a transaction.
        $employee = DB::transaction(function () use ($validated) {
            return Employee::create($validated);
        });

        $employee->load(['section.division']);

        // Audit only after the database transaction succeeds.
        $auditLog->record(
            $request,
            'CREATE',
            'employee',
            (string) $employee->getKey(),
            'Created employee: '
                . $employee->first_name . ' ' . $employee->last_name,
            null,
            $this->auditValues($employee)
        );

        return response()->json([
            'message' => 'Employee created successfully.',
            'data' => $employee,
        ], 201);
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): JsonResponse
    {
        $employee->load(['section.division']);

        return response()->json([
            'data' => $employee,
        ]);
    }

    /**
     * Update the specified employee.
     */
    public function update(
        Request $request,
        Employee $employee,
        AuditLogService $auditLog
    ): JsonResponse {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],
            'middle_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'last_name' => [
                'required',
                'string',
                'max:255',
            ],
            'date_birth' => [
                'required',
                'date',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('employees', 'email')
                    ->ignore($employee->id),
            ],
            'contact_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('employees', 'contact_number')
                    ->ignore($employee->id),
            ],
            'section_id' => [
                'required',
                'integer',
                'exists:sections,id',
            ],
            'status' => [
                'required',
                Rule::enum(EmployeeStatus::class),
            ],
        ]);

        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        // Capture the original state before modifying the model.
        $oldValues = $this->auditValues($employee);

        $validated['updated_by'] = $authUserId;

        // Commit the employee update before sending the audit event.
        $employee = DB::transaction(function () use (
            $employee,
            $validated
        ) {
            $employee->update($validated);

            return $employee->fresh();
        });

        $employee->load(['section.division']);

        $auditLog->record(
            $request,
            'UPDATE',
            'employee',
            (string) $employee->getKey(),
            'Updated employee: '
                . $employee->first_name . ' ' . $employee->last_name,
            $oldValues,
            $this->auditValues($employee)
        );

        return response()->json([
            'message' => 'Employee updated successfully.',
            'data' => $employee,
        ]);
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(
        Request $request,
        Employee $employee,
        AuditLogService $auditLog
    ): JsonResponse {
        $authUserId = $request->attributes->get('auth_user_id');

        if (!$authUserId) {
            return response()->json([
                'message' => 'Authenticated user could not be identified.',
            ], 401);
        }

        // Preserve the employee data before deletion.
        $oldValues = $this->auditValues($employee);
        $recordId = (string) $employee->getKey();

        $employeeName = trim(
            $employee->first_name . ' ' . $employee->last_name
        );

        DB::transaction(function () use ($employee) {
            $employee->delete();
        });

        $auditLog->record(
            $request,
            'DELETE',
            'employee',
            $recordId,
            'Deleted employee: ' . $employeeName,
            $oldValues,
            null
        );

        return response()->json([
            'message' => 'Employee deleted successfully.',
        ]);
    }
}
