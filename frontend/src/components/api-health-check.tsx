import {
    Alert,
    Box,
    Button,
    Card,
    Loader,
    Stack,
    Text,
} from "@mantine/core";

import {
    AlertCircle,
    CheckCircle,
} from "lucide-react";

import { useApiHealth } from "@/lib/api/api-health";

interface ApiHealthCheckProps {
    children: React.ReactNode;
    serviceName?: string;
}

export default function ApiHealthCheck({
    children,
    serviceName = "AuthServ",
}: ApiHealthCheckProps) {
    const {
        isChecking,
        isOnline,
        isOffline,
        checkHealth,
    } = useApiHealth();

    /*
     * =====================================================
     * CHECKING
     * =====================================================
     */

    if (isChecking) {
        return (
            <Card
                withBorder
                radius="xl"
                padding="xl"
                shadow="md"
                className="
                    !border-[var(--border)]
                    !bg-[var(--surface)]
                    backdrop-blur-xl
                    transition-colors
                    duration-200
                "
            >
                <Stack
                    align="center"
                    justify="center"
                    gap="md"
                    py="xl"
                >
                    <Loader
                        size="md"
                        color="var(--accent)"
                    />

                    <Stack
                        align="center"
                        gap={4}
                    >
                        <Text
                            fw={700}
                            className="!text-[var(--text-h)]"
                        >
                            Connecting to {serviceName}
                        </Text>

                        <Text
                            size="sm"
                            c="dimmed"
                            ta="center"
                        >
                            Checking authentication service...
                        </Text>
                    </Stack>
                </Stack>
            </Card>
        );
    }

    /*
     * =====================================================
     * OFFLINE
     * =====================================================
     */

    if (isOffline) {
        return (
            <Card
                withBorder
                radius="xl"
                padding="xl"
                shadow="md"
                className="
                    !border-[var(--border)]
                    !bg-[var(--surface)]
                    backdrop-blur-xl
                    transition-colors
                    duration-200
                "
            >
                <Stack
                    align="center"
                    gap="md"
                    py="lg"
                >
                    <Box
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-red-500/10
                        "
                    >
                        <AlertCircle
                            size={26}
                            className="text-red-500"
                        />
                    </Box>

                    <Stack
                        align="center"
                        gap={4}
                    >
                        <Text
                            fw={700}
                            ta="center"
                            className="!text-[var(--text-h)]"
                        >
                            Authentication service unavailable
                        </Text>

                        <Text
                            size="sm"
                            c="dimmed"
                            ta="center"
                            lh={1.5}
                        >
                            We could not connect to the FCV
                            authentication service. Please try
                            again.
                        </Text>
                    </Stack>

                    <Button
                        onClick={checkHealth}
                        className="
                            !bg-[var(--accent)]
                            !text-white
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:!bg-[var(--accent-hover)]
                        "
                    >
                        Try again
                    </Button>
                </Stack>
            </Card>
        );
    }

    /*
     * =====================================================
     * ONLINE
     * =====================================================
     */

    if (isOnline) {
        return <>{children}</>;
    }

    /*
     * =====================================================
     * FALLBACK
     * =====================================================
     */

    return null;
}