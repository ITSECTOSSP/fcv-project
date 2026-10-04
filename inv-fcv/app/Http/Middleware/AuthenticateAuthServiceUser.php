<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAuthServiceUser
{
    /**
     * Authenticate Auth Service User.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /*
         * ---------------------------------------------------------------
         * Allow CORS preflight requests
         * ---------------------------------------------------------------
         *
         * Browser preflight requests use OPTIONS and do not contain
         * the bearer token used by the actual authenticated request.
         *
         * CORS should be handled by Laravel's CORS middleware before
         * authentication is required.
         */
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }

        /*
         * ---------------------------------------------------------------
         * Get Bearer Token
         * ---------------------------------------------------------------
         */
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Authentication token is required.',
            ], 401);
        }

        /*
         * ---------------------------------------------------------------
         * Authenticate Through Auth-FCV
         * ---------------------------------------------------------------
         */
        $authService = app(AuthService::class);

        $user = $authService->getAuthenticatedUser($token);

        if (!$user || empty($user['id'])) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
         * ---------------------------------------------------------------
         * Store Authenticated User
         * ---------------------------------------------------------------
         */
        $request->attributes->set(
            'auth_user',
            $user
        );

        /*
         * ---------------------------------------------------------------
         * Store Authenticated User ID
         * ---------------------------------------------------------------
         */
        $request->attributes->set(
            'auth_user_id',
            $user['id']
        );

        return $next($request);
    }
}