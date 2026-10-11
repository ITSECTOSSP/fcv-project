<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AuthService
{
    /*
     * |--------------------------------------------------------------------------
     * | GET AUTHENTICATED USER
     * |--------------------------------------------------------------------------
     *
     * Sends the bearer token to Auth-FCV.
     *
     * Auth-FCV validates the Sanctum token and returns
     * the authenticated user.
     *
     * |--------------------------------------------------------------------------
     */

    public function getAuthenticatedUser(
        string $token
    ): ?array {

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->get(
                    config('services.auth.url')
                        . '/api/auth/user'
                );

            if (!$response->successful()) {
                return null;
            }

            return $response->json('user');
        } catch (\Throwable $exception) {

            report($exception);

            return null;
        }
    }

    /*
     * |--------------------------------------------------------------------------
     * | GET AUTHENTICATED USER EMPLOYEE ID
     * |--------------------------------------------------------------------------
     *
     * Retrieves the employee_id assigned to the authenticated
     * Auth-FCV user.
     *
     * |--------------------------------------------------------------------------
     */

    public function getAuthenticatedEmployeeId(
        string $token
    ): ?string {

        $user = $this->getAuthenticatedUser(
            $token
        );

        if (!$user) {
            return null;
        }

        return $user['employee_id'] ?? null;
    }
}
