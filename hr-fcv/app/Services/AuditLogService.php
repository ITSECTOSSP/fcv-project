<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuditLogService
{
    public function record(
        Request $request,
        string $action,
        string $module,
        ?string $recordId,
        string $description,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): void {
        $token = $request->bearerToken();

        $authUrl = rtrim(
            (string) config('services.auth.url'),
            '/'
        );

        $serviceToken = config('services.audit.token');

        if (!$token || !$authUrl || !$serviceToken) {
            Log::warning(
                'Audit log skipped: required configuration is missing.',
                [
                    'service' => 'hr-fcv',
                    'module' => $module,
                    'action' => $action,
                ]
            );

            return;
        }

        try {
            $response = Http::timeout(3)
                ->acceptJson()
                ->withToken($token)
                ->withHeaders([
                    'X-Service-Name' => 'hr-fcv',
                    'X-Service-Token' => $serviceToken,
                ])
                ->post(
                    $authUrl . '/api/auth/audit-logs',
                    [
                        'action' => $action,
                        'module' => $module,
                        'record_id' => $recordId,
                        'description' => $description,
                        'old_values' => $oldValues,
                        'new_values' => $newValues,
                    ]
                );

            if (!$response->successful()) {
                Log::warning(
                    'Auth service rejected an audit event.',
                    [
                        'service' => 'hr-fcv',
                        'module' => $module,
                        'action' => $action,
                        'status' => $response->status(),
                    ]
                );
            }
        } catch (Throwable $exception) {
            Log::warning(
                'Unable to send audit event to Auth service.',
                [
                    'service' => 'hr-fcv',
                    'module' => $module,
                    'action' => $action,
                    'error' => $exception->getMessage(),
                ]
            );
        }
    }
}
