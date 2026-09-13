import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Alert,
    Anchor,
    Box,
    Button,
    Card,
    Container,
    Group,
    Loader,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle,
    ShieldCheck,
} from "lucide-react";
import api from "@/lib/api/api";
import { useApiHealth } from "@/lib/api/api-health";

const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters."),

        email: z
            .string()
            .email("Please enter a valid email address."),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters."),

        password_confirmation: z
            .string()
            .min(1, "Please confirm your password."),
    })
    .refine(
        (data) =>
            data.password === data.password_confirmation,
        {
            message: "Passwords do not match.",
            path: ["password_confirmation"],
        },
    );

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
     * =====================================================
     * API HEALTH CHECK
     * =====================================================
     */

    const {
        isChecking,
        isOnline,
        isOffline,
        checkHealth,
    } = useApiHealth();

    /*
     * =====================================================
     * REGISTER FORM
     * =====================================================
     */

    const {
        register,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    /*
     * =====================================================
     * REGISTER
     * =====================================================
     */

    const onSubmit = async (data: RegisterForm) => {
        setServerError("");
        setSuccessMessage("");

        try {
            const response = await api.post(
                "/api/auth/register",
                data,
            );

            /*
             * If the backend automatically authenticates
             * the user after registration, store the token.
             */

            if (response.data.token) {
                localStorage.setItem(
                    "auth_token",
                    response.data.token,
                );
            }

            /*
             * Store authenticated user information
             * when returned by the API.
             */

            if (response.data.user) {
                localStorage.setItem(
                    "auth_user",
                    JSON.stringify(response.data.user),
                );
            }

            /*
             * If registration automatically logs
             * the user in, go directly to dashboard.
             */

            if (response.data.token) {
                navigate("/dashboard");
                return;
            }

            /*
             * Otherwise registration succeeded and
             * the user needs to log in.
             */

            setSuccessMessage(
                response.data.message ||
                    "Registration successful. You can now log in.",
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error: any) {
            const response = error.response;

            /*
             * Laravel validation errors.
             */

            if (response?.status === 422) {
                const validationErrors =
                    response.data?.errors;

                if (validationErrors) {
                    Object.entries(
                        validationErrors,
                    ).forEach(
                        ([field, messages]) => {
                            setError(
                                field as keyof RegisterForm,
                                {
                                    type: "server",
                                    message:
                                        Array.isArray(messages)
                                            ? String(messages[0])
                                            : String(messages),
                                },
                            );
                        },
                    );

                    return;
                }
            }

            setServerError(
                response?.data?.message ||
                    "Unable to create your account.",
            );
        }
    };

    return (
        <Container
            size={460}
            w="100%"
            px={{
                base: "md",
                sm: "xl",
            }}
        >
            <Stack gap="xl">

                {/* =====================================================
                    FCV BRANDING
                ===================================================== */}

                <Stack
                    align="center"
                    gap="md"
                >
                    <Box
                        component="img"
                        src="/brand.svg"
                        alt="FCV — Forward • Commitment • Vision"
                        className="
                            h-auto
                            w-full
                            max-w-[280px]
                            object-contain
                        "
                    />
                </Stack>

                {/* =====================================================
                    API CHECKING
                ===================================================== */}

                {isChecking && (
                    <Card
                        withBorder
                        radius="xl"
                        padding="xl"
                        shadow="md"
                        className="
                            !border-[var(--border)]
                            !bg-[var(--surface)]
                            !text-[var(--text)]
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
                                    Connecting to AuthServ
                                </Text>

                                <Text
                                    size="sm"
                                    ta="center"
                                    className="!text-[var(--text-muted)]"
                                >
                                    Checking authentication service...
                                </Text>
                            </Stack>
                        </Stack>
                    </Card>
                )}

                {/* =====================================================
                    API OFFLINE
                ===================================================== */}

                {isOffline && (
                    <Card
                        withBorder
                        radius="xl"
                        padding="xl"
                        shadow="md"
                        className="
                            !border-[var(--border)]
                            !bg-[var(--surface)]
                            !text-[var(--text)]
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
                                    ta="center"
                                    lh={1.5}
                                    className="!text-[var(--text-muted)]"
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
                )}

                {/* =====================================================
                    REGISTRATION CARD
                    Only displayed when API is online
                ===================================================== */}

                {isOnline && (
                    <Card
                        withBorder
                        radius="xl"
                        padding="xl"
                        shadow="md"
                        className="
                            !border-[var(--border)]
                            !bg-[var(--surface)]
                            !text-[var(--text)]
                            backdrop-blur-xl
                            transition-colors
                            duration-200
                        "
                    >
                        <Stack gap="lg">

                            {/* =================================================
                                HEADER
                            ================================================= */}

                            <Stack gap={5}>
                                <Title
                                    order={2}
                                    fw={800}
                                    className="
                                        !text-[var(--text-h)]
                                        tracking-tight
                                    "
                                >
                                    Create an account
                                </Title>

                                <Text
                                    size="sm"
                                    className="!text-[var(--text-muted)]"
                                >
                                    Register for secure access to
                                    the FCV digital environment.
                                </Text>
                            </Stack>

                            {/* =================================================
                                SERVER ERROR
                            ================================================= */}

                            {serverError && (
                                <Alert
                                    icon={
                                        <AlertCircle size={18} />
                                    }
                                    color="red"
                                    variant="light"
                                    title="Registration failed"
                                >
                                    {serverError}
                                </Alert>
                            )}

                            {/* =================================================
                                SUCCESS
                            ================================================= */}

                            {successMessage && (
                                <Alert
                                    icon={
                                        <CheckCircle size={18} />
                                    }
                                    color="green"
                                    variant="light"
                                    title="Registration successful"
                                >
                                    {successMessage}
                                </Alert>
                            )}

                            {/* =================================================
                                FORM
                            ================================================= */}

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <Stack gap="md">

                                    {/* Full Name */}

                                    <TextInput
                                        label="Full name"
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        size="md"
                                        {...register("name")}
                                        error={errors.name?.message}
                                        classNames={{
                                            label: "!text-[var(--text-h)]",

                                            input: `
                                                !border-[var(--border)]
                                                !bg-[var(--surface)]
                                                !text-[var(--text-h)]
                                                placeholder:!text-[var(--text-muted)]
                                                focus:!border-[var(--accent)]
                                            `,
                                        }}
                                    />

                                    {/* Email */}

                                    <TextInput
                                        label="Email"
                                        placeholder="you@example.com"
                                        type="email"
                                        autoComplete="email"
                                        size="md"
                                        {...register("email")}
                                        error={errors.email?.message}
                                        classNames={{
                                            label: "!text-[var(--text-h)]",

                                            input: `
                                                !border-[var(--border)]
                                                !bg-[var(--surface)]
                                                !text-[var(--text-h)]
                                                placeholder:!text-[var(--text-muted)]
                                                focus:!border-[var(--accent)]
                                            `,
                                        }}
                                    />

                                    {/* Password */}

                                    <PasswordInput
                                        label="Password"
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        size="md"
                                        {...register("password")}
                                        error={
                                            errors.password?.message
                                        }
                                        classNames={{
                                            label: "!text-[var(--text-h)]",

                                            input: `
                                                !border-[var(--border)]
                                                !bg-[var(--surface)]
                                                !text-[var(--text-h)]
                                                placeholder:!text-[var(--text-muted)]
                                                focus:!border-[var(--accent)]
                                            `,

                                            innerInput: `
                                                !bg-[var(--surface)]
                                                !text-[var(--text-h)]
                                            `,
                                        }}
                                    />

                                    {/* Confirm Password */}

                                    <PasswordInput
                                        label="Confirm password"
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        size="md"
                                        {...register(
                                            "password_confirmation",
                                        )}
                                        error={
                                            errors
                                                .password_confirmation
                                                ?.message
                                        }
                                        classNames={{
                                            label: "!text-[var(--text-h)]",

                                            input: `
                                                !border-[var(--border)]
                                                !bg-[var(--surface)]
                                                !text-[var(--text-h)]
                                                placeholder:!text-[var(--text-muted)]
                                                focus:!border-[var(--accent)]
                                            `,

                                            innerInput: `
                                                !bg-[var(--surface)]
                                                !text-[var(--text-h)]
                                            `,
                                        }}
                                    />

                                    {/* Submit */}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        size="md"
                                        mt="sm"
                                        loading={isSubmitting}
                                        rightSection={
                                            !isSubmitting ? (
                                                <ArrowRight
                                                    size={17}
                                                />
                                            ) : undefined
                                        }
                                        className="
                                            !bg-[var(--accent)]
                                            !text-white
                                            shadow-md
                                            shadow-[rgba(201,162,39,0.20)]
                                            transition-all
                                            duration-200
                                            hover:-translate-y-0.5
                                            hover:!brightness-95
                                            hover:!shadow-lg
                                        "
                                    >
                                        Create account
                                    </Button>
                                </Stack>
                            </form>

                            {/* =================================================
                                LOGIN
                            ================================================= */}

                            <Text
                                size="sm"
                                ta="center"
                                className="!text-[var(--text-muted)]"
                            >
                                Already have an account?{" "}

                                <Anchor
                                    component={Link}
                                    to="/login"
                                    fw={600}
                                    className="
                                        !text-[var(--accent)]
                                        hover:!underline
                                    "
                                >
                                    Log in
                                </Anchor>
                            </Text>

                        </Stack>
                    </Card>
                )}

                {/* =====================================================
                    SECURITY NOTICE
                ===================================================== */}

                {isOnline && (
                    <Group
                        justify="center"
                        gap="xs"
                    >
                        <ShieldCheck
                            size={15}
                            className="text-[var(--accent)]"
                        />

                        <Text
                            size="xs"
                            className="!text-[var(--text-muted)]"
                        >
                            Your account is protected by
                            secure authentication.
                        </Text>
                    </Group>
                )}

                {/* =====================================================
                    BRAND STATEMENT
                ===================================================== */}

                {isOnline && (
                    <Stack
                        align="center"
                        gap={3}
                    >
                        <Text
                            size="xs"
                            fw={700}
                            className="!text-[var(--accent)]"
                        >
                            Forward • Commitment • Vision
                        </Text>

                        <Text
                            size="xs"
                            ta="center"
                            className="!text-[var(--text-muted)]"
                        >
                            Secure access for authorized personnel.
                        </Text>
                    </Stack>
                )}

            </Stack>
        </Container>
    );
}
