import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
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
    Title,
} from "@mantine/core";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";
import api from "@/lib/api/api";
import ApiHealthCheck from "@/components/api-health-check";

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters."),

        password_confirmation: z
            .string()
            .min(1, "Please confirm your password."),
    })
    .refine(
        (data) => data.password === data.password_confirmation,
        {
            message: "Passwords do not match.",
            path: ["password_confirmation"],
        },
    );

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);
    const [invalidLink, setInvalidLink] = useState(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (!token || !email) {
            setInvalidLink(true);
        }
    }, [token, email]);

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!token || !email) {
            setInvalidLink(true);
            return;
        }

        setServerError("");

        try {
            await api.post(
                "/api/auth/reset-password",
                {
                    token,
                    email,
                    password: data.password,
                    password_confirmation:
                        data.password_confirmation,
                },
            );

            setSuccess(true);

            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (error: any) {
            setServerError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Unable to reset your password. The reset link may have expired.",
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

                <ApiHealthCheck>
                    <Stack gap="xl">

                        {/* =================================================
                            RESET PASSWORD CARD
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
                                    INVALID LINK
                                ================================================= */}

                                {invalidLink ? (
                                    <>
                                        <Stack
                                            align="center"
                                            gap="md"
                                            ta="center"
                                        >
                                            <Box
                                                className="
                                                    flex
                                                    h-14
                                                    w-14
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-red-500/10
                                                    text-red-500
                                                "
                                            >
                                                <AlertCircle size={28} />
                                            </Box>

                                            <Stack gap={5}>
                                                <Title
                                                    order={3}
                                                    fw={700}
                                                    className="!text-[var(--text-h)]"
                                                >
                                                    Invalid reset link
                                                </Title>

                                                <Text
                                                    size="sm"
                                                    c="dimmed"
                                                    lh={1.6}
                                                >
                                                    This password reset link
                                                    is missing required
                                                    information or is invalid.
                                                </Text>
                                            </Stack>
                                        </Stack>

                                        <Button
                                            component={Link}
                                            to="/forgot-password"
                                            fullWidth
                                            rightSection={
                                                <ArrowRight size={17} />
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
                                            Request a New Reset Link
                                        </Button>
                                    </>
                                ) : success ? (

                                    /* =================================================
                                        SUCCESS
                                    ================================================= */

                                    <>
                                        <Stack
                                            align="center"
                                            gap="md"
                                            ta="center"
                                        >
                                            <Box
                                                className="
                                                    flex
                                                    h-14
                                                    w-14
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-[var(--accent-bg)]
                                                    text-[var(--accent)]
                                                "
                                            >
                                                <CheckCircle2 size={28} />
                                            </Box>

                                            <Stack gap={5}>
                                                <Title
                                                    order={3}
                                                    fw={700}
                                                    className="!text-[var(--text-h)]"
                                                >
                                                    Password reset successful
                                                </Title>

                                                <Text
                                                    size="sm"
                                                    c="dimmed"
                                                    lh={1.6}
                                                >
                                                    Your password has been
                                                    updated successfully.
                                                </Text>
                                            </Stack>

                                            <Text
                                                size="xs"
                                                c="dimmed"
                                            >
                                                Redirecting you to login...
                                            </Text>
                                        </Stack>
                                    </>

                                ) : (

                                    /* =================================================
                                        RESET FORM
                                    ================================================= */

                                    <>
                                        <Stack gap={5}>
                                            <Title
                                                order={3}
                                                fw={700}
                                                className="!text-[var(--text-h)]"
                                            >
                                                Create a new password
                                            </Title>

                                            <Text
                                                size="sm"
                                                c="dimmed"
                                                lh={1.6}
                                            >
                                                Choose a strong password for
                                                your FCV account.
                                            </Text>
                                        </Stack>

                                        {/* =========================================
                                            SERVER ERROR
                                        ========================================= */}

                                        {serverError && (
                                            <Alert
                                                icon={
                                                    <AlertCircle size={18} />
                                                }
                                                color="red"
                                                variant="light"
                                                title="Unable to reset password"
                                            >
                                                {serverError}
                                            </Alert>
                                        )}

                                        {/* =========================================
                                            FORM
                                        ========================================= */}

                                        <form
                                            onSubmit={handleSubmit(onSubmit)}
                                        >
                                            <Stack gap="md">

                                                <PasswordInput
                                                    label="New Password"
                                                    placeholder="Enter your new password"
                                                    autoComplete="new-password"
                                                    size="md"
                                                    leftSection={
                                                        <LockKeyhole
                                                            size={17}
                                                        />
                                                    }
                                                    {...register("password")}
                                                    error={
                                                        errors.password?.message
                                                    }
                                                    classNames={{
                                                        input: "!border-[var(--border)] focus:!border-[var(--accent)]",
                                                    }}
                                                />

                                                <PasswordInput
                                                    label="Confirm New Password"
                                                    placeholder="Re-enter your new password"
                                                    autoComplete="new-password"
                                                    size="md"
                                                    leftSection={
                                                        <LockKeyhole
                                                            size={17}
                                                        />
                                                    }
                                                    {...register(
                                                        "password_confirmation",
                                                    )}
                                                    error={
                                                        errors
                                                            .password_confirmation
                                                            ?.message
                                                    }
                                                    classNames={{
                                                        input: "!border-[var(--border)] focus:!border-[var(--accent)]",
                                                    }}
                                                />

                                                <Text
                                                    size="xs"
                                                    c="dimmed"
                                                >
                                                    Password must be at least
                                                    8 characters.
                                                </Text>

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
                                                        transition-all
                                                        duration-200
                                                        hover:-translate-y-0.5
                                                        hover:!bg-[var(--accent-hover)]
                                                        hover:!shadow-lg
                                                    "
                                                >
                                                    Reset Password
                                                </Button>
                                            </Stack>
                                        </form>

                                        {/* =========================================
                                            BACK TO LOGIN
                                        ========================================= */}

                                        <Text
                                            size="sm"
                                            ta="center"
                                            c="dimmed"
                                        >
                                            Remember your password?{" "}

                                            <Anchor
                                                component={Link}
                                                to="/login"
                                                fw={600}
                                                className="
                                                    !text-[var(--accent)]
                                                    hover:!text-[var(--accent-hover)]
                                                "
                                            >
                                                Log in
                                            </Anchor>
                                        </Text>
                                    </>
                                )}
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
                                    Secure password recovery
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