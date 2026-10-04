<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AuthService
{
    /*
    |--------------------------------------------------------------------------
    | Get Authenticated User
    |--------------------------------------------------------------------------
    |
    | Sends the bearer token to auth-fcv.
    | Auth-fcv validates the Sanctum token and returns
    | the authenticated user.
    |
    */

    public function getAuthenticatedUser(
        string $token
    ): ?array {
        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->get(
                    config('services.auth.url') .
                    '/api/auth/user'
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
}