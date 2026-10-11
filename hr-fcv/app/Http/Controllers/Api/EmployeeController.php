<?php

namespace App\Http\Controllers\Api;

use App\Enums\EmployeeStatus;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Services\AuthService;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{

    /*
    * |--------------------------------------------------------------------------
    * | DISPLAY THE AUTHENTICATED USER'S EMPLOYEE
    * |--------------------------------------------------------------------------
    *
    * Retrieves the employee record associated with the currently
    * authenticated Auth-FCV user.
    *
    * |--------------------------------------------------------------------------
    */

    public function me(
        Request $request,
        AuthService $authService
    ): JsonResponse {

        /*
     * |--------------------------------------------------------------------------
     * | GET BEARER TOKEN
     * |--------------------------------------------------------------------------
     */

        $token = $request->bearerToken();

        /*
     * |--------------------------------------------------------------------------
     * | VERIFY BEARER TOKEN
     * |--------------------------------------------------------------------------
     */

        if (!$token) {
            return response()->json([
                'message' =>
                'Authentication token could not be identified.',
            ], 401);
        }

        /*
     * |--------------------------------------------------------------------------
     * | GET EMPLOYEE ID FROM AUTH-FCV
     * |--------------------------------------------------------------------------
     */

        $employeeId =
            $authService->getAuthenticatedEmployeeId(
                $token
            );

        /*
     * |--------------------------------------------------------------------------
     * | USER IS NOT LINKED TO AN EMPLOYEE
     * |--------------------------------------------------------------------------
     */

        if (!$employeeId) {
            return response()->json([
                'data' => null,
                'message' =>
                'The authenticated user is not linked to an employee.',
            ]);
        }

        /*
     * |--------------------------------------------------------------------------
     * | FIND EMPLOYEE
     * |--------------------------------------------------------------------------
     */

        $employee = Employee::query()
            ->with([
                'section.division',
            ])
            ->find($employeeId);

        /*
     * |--------------------------------------------------------------------------
     * | EMPLOYEE NOT FOUND
     * |--------------------------------------------------------------------------
     */

        if (!$employee) {
            return response()->json([
                'data' => null,
                'message' =>
                'The employee linked to this account could not be found.',
            ], 404);
        }

        /*
     * |--------------------------------------------------------------------------
     * | RETURN EMPLOYEE
     * |--------------------------------------------------------------------------
     */

        return response()->json([
            'data' => $employee,
        ]);
    }
    /*
    |--------------------------------------------------------------------------
    | DISPLAY A LISTING OF EMPLOYEES
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): JsonResponse
    {
        /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

        $query = Employee::query()
            ->with([
                'section.division',
            ]);

        /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'first_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'middle_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'last_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'email',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'contact_number',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        /*
    |--------------------------------------------------------------------------
    | STATUS FILTER
    |--------------------------------------------------------------------------
    |
    | Supported values:
    |
    | active
    | retired
    | resigned
    |
    */

        if ($request->filled('status')) {
            $status = $request->input('status');

            $query->where(
                'status',
                $status
            );
        }

        /*
    |--------------------------------------------------------------------------
    | DIVISION FILTER
    |--------------------------------------------------------------------------
    |
    | Employees do not have a direct division_id.
    |
    | Division is obtained through:
    |
    | Employee
    |     -> Section
    |         -> Division
    |
    */

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

        /*
    |--------------------------------------------------------------------------
    | SECTION FILTER
    |--------------------------------------------------------------------------
    */

        if ($request->filled('section_ids')) {
            $query->whereIn(
                'section_id',
                $request->input('section_ids')
            );
        }

        /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

        $employees = $query
            ->latest()
            ->paginate(
                $request->integer('per_page', 15)
            );

        /*
    |--------------------------------------------------------------------------
    | RETURN RESPONSE
    |--------------------------------------------------------------------------
    */

        return response()->json(
            $employees
        );
    }

    /*
    |--------------------------------------------------------------------------
    | STORE A NEW EMPLOYEE
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | VALIDATE REQUEST
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            /*
            |--------------------------------------------------------------------------
            | PERSONAL INFORMATION
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | CONTACT INFORMATION
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | ORGANIZATION
            |--------------------------------------------------------------------------
            |
            | An employee belongs directly to a section.
            |
            | The division is obtained through:
            |
            | Employee
            |     -> Section
            |         -> Division
            |
            */

            'section_id' => [
                'required',
                'integer',
                'exists:sections,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | EMPLOYMENT STATUS
            |--------------------------------------------------------------------------
            |
            | Status is optional during creation.
            |
            | If omitted, it defaults to active.
            |
            */

            'status' => [
                'sometimes',
                Rule::enum(EmployeeStatus::class),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | GET AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFY AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        if (!$authUserId) {
            return response()->json([
                'message' =>
                'Authenticated user could not be identified.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | DEFAULT EMPLOYEE STATUS
        |--------------------------------------------------------------------------
        */

        $validated['status'] ??=
            EmployeeStatus::ACTIVE->value;

        /*
        |--------------------------------------------------------------------------
        | AUDIT INFORMATION
        |--------------------------------------------------------------------------
        |
        | These UUIDs reference users from auth-fcv.
        |
        | encoded_by:
        | The user who originally created the employee.
        |
        | updated_by:
        | The user who most recently modified the employee.
        |
        */

        $validated['encoded_by'] =
            $authUserId;

        $validated['updated_by'] =
            $authUserId;

        /*
        |--------------------------------------------------------------------------
        | CREATE EMPLOYEE
        |--------------------------------------------------------------------------
        */

        $employee = DB::transaction(
            function () use ($validated) {
                return Employee::create(
                    $validated
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $employee->load([
            'section.division',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RETURN RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
            'Employee created successfully.',

            'data' =>
            $employee,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | DISPLAY THE SPECIFIED EMPLOYEE
    |--------------------------------------------------------------------------
    */

    public function show(
        Employee $employee
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $employee->load([
            'section.division',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RETURN RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'data' =>
            $employee,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE THE SPECIFIED EMPLOYEE
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Employee $employee
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | VALIDATE REQUEST
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            /*
            |--------------------------------------------------------------------------
            | PERSONAL INFORMATION
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | CONTACT INFORMATION
            |--------------------------------------------------------------------------
            */

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique(
                    'employees',
                    'email'
                )->ignore(
                    $employee->id
                ),
            ],

            'contact_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique(
                    'employees',
                    'contact_number'
                )->ignore(
                    $employee->id
                ),
            ],

            /*
            |--------------------------------------------------------------------------
            | ORGANIZATION
            |--------------------------------------------------------------------------
            */

            'section_id' => [
                'required',
                'integer',
                'exists:sections,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | EMPLOYMENT STATUS
            |--------------------------------------------------------------------------
            */

            'status' => [
                'required',
                Rule::enum(EmployeeStatus::class),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | GET AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFY AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        if (!$authUserId) {
            return response()->json([
                'message' =>
                'Authenticated user could not be identified.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | AUDIT INFORMATION
        |--------------------------------------------------------------------------
        |
        | encoded_by remains unchanged.
        |
        | updated_by records the Auth-FCV user who
        | performed the update.
        |
        */

        $validated['updated_by'] =
            $authUserId;

        /*
        |--------------------------------------------------------------------------
        | UPDATE EMPLOYEE
        |--------------------------------------------------------------------------
        */

        $employee->update(
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $employee->load([
            'section.division',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RETURN RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
            'Employee updated successfully.',

            'data' =>
            $employee,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE THE SPECIFIED EMPLOYEE
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Employee $employee
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | GET AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $authUserId = $request->attributes->get(
            'auth_user_id'
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFY AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        if (!$authUserId) {
            return response()->json([
                'message' =>
                'Authenticated user could not be identified.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | DELETE EMPLOYEE
        |--------------------------------------------------------------------------
        */

        $employee->delete();

        /*
        |--------------------------------------------------------------------------
        | RETURN RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
            'Employee deleted successfully.',
        ]);
    }
}
