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
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {
    AlertCircle,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import api from "@/lib/api/api";
import ApiHealthCheck from "@/components/api-health-check";

const loginSchema = z.object({
    email: z
        .string()
        .email("Please enter a valid email address."),

    password: z
        .string()
        .min(1, "Password is required."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();

    const [serverError, setServerError] = useState("");

    /*
     * =====================================================
     * LOGIN FORM
     * =====================================================
     */

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    /*
     * =====================================================
     * LOGIN
     * =====================================================
     */

    const onSubmit = async (data: LoginForm) => {
        setServerError("");

        try {
            const response = await api.post(
                "/api/auth/login",
                data,
            );

            localStorage.setItem(
                "auth_token",
                response.data.token,
            );

            localStorage.setItem(
                "auth_user",
                JSON.stringify(response.data.user),
            );

            navigate("/dashboard");
        } catch (error: any) {
            setServerError(
                error.response?.data?.message ||
                    "Invalid email or password.",
            );
        }
    };

    return (
        <Container
            size={440}
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
                    API HEALTH CHECK

                    Login content will only appear when
                    the authentication service is online.
                ===================================================== */}

                <ApiHealthCheck>

                    <Stack gap="xl">

                        {/* =================================================
                            LOGIN CARD
                        ================================================= */}

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
                            <Stack gap="lg">

                                {/* =================================================
                                    HEADER
                                ================================================= */}

                                <Stack gap={5}>
                                    <Title
                                        order={3}
                                        fw={700}
                                        className="!text-[var(--text-h)]"
                                    >
                                        Welcome back
                                    </Title>

                                    <Text
                                        size="sm"
                                        c="dimmed"
                                        lh={1.6}
                                    >
                                        Sign in to continue to your FCV
                                        digital environment.
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
                                        title="Unable to log in"
                                    >
                                        {serverError}
                                    </Alert>
                                )}

                                {/* =================================================
                                    LOGIN FORM
                                ================================================= */}

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                >
                                    <Stack gap="md">

                                        {/* Email */}

                                        <TextInput
                                            label="Email"
                                            placeholder="you@example.com"
                                            type="email"
                                            autoComplete="email"
                                            size="md"
                                            {...register("email")}
                                            error={
                                                errors.email?.message
                                            }
                                            classNames={{
                                                input: "!border-[var(--border)] focus:!border-[var(--accent)]",
                                            }}
                                        />

                                        {/* Password */}

                                        <PasswordInput
                                            label={
                                                <Group
                                                    justify="space-between"
                                                    w="100%"
                                                >
                                                    <Text
                                                        component="span"
                                                        size="sm"
                                                        fw={500}
                                                    >
                                                        Password
                                                    </Text>

                                                    <Anchor
                                                        component={Link}
                                                        to="/forgot-password"
                                                        size="xs"
                                                        fw={500}
                                                        className="
                                                            !text-[var(--accent)]
                                                            hover:!text-[var(--accent-hover)]
                                                        "
                                                    >
                                                        Forgot password?
                                                    </Anchor>
                                                </Group>
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            size="md"
                                            {...register("password")}
                                            error={
                                                errors.password?.message
                                            }
                                            classNames={{
                                                input: "!border-[var(--border)] focus:!border-[var(--accent)]",
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
                                                    <ArrowRight size={17} />
                                                ) : undefined
                                            }
                                            className="
                                                !bg-[var(--accent)]
                                                !text-white
                                                shadow-md
                                                transition-all
                                                duration-200
                                                hover:-translate-y-0.5
                                                hover:!bg-[var(--accent-hover)]
                                                hover:!shadow-lg
                                            "
                                        >
                                            Log in
                                        </Button>

                                    </Stack>
                                </form>

                                {/* =================================================
                                    REGISTER
                                ================================================= */}

                                <Text
                                    size="sm"
                                    c="dimmed"
                                    ta="center"
                                >
                                    Don't have an account?{" "}

                                    <Anchor
                                        component={Link}
                                        to="/register"
                                        fw={600}
                                        className="
                                            !text-[var(--accent)]
                                            hover:!text-[var(--accent-hover)]
                                        "
                                    >
                                        Register
                                    </Anchor>
                                </Text>

                            </Stack>
                        </Card>

                        {/* =================================================
                            SECURITY NOTICE
                        ================================================= */}

                        <Stack
                            align="center"
                            gap={5}
                        >
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
                                    c="dimmed"
                                >
                                    Secure access for authorized personnel
                                </Text>
                            </Group>

                            <Text
                                size="xs"
                                c="dimmed"
                                ta="center"
                            >
                                © {new Date().getFullYear()} FCV
                            </Text>

                            <Text
                                size="xs"
                                c="dimmed"
                                ta="center"
                            >
                                Forward • Commitment • Vision
                            </Text>
                        </Stack>

                    </Stack>

                </ApiHealthCheck>

            </Stack>
        </Container>
    );
}
