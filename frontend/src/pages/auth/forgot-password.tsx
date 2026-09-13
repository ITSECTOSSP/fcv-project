import { useState } from "react";

import { Link } from "react-router-dom";

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
    Stack,
    Text,
    TextInput,
    Title,
    Group,
} from "@mantine/core";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Mail,
    ShieldCheck,
} from "lucide-react";

import api from "@/lib/api/api";
import ApiHealthCheck from "@/components/api-health-check";

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .email("Please enter a valid email address."),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        setServerError("");
        setSuccess(false);

        try {
            await api.post(
                "/api/auth/forgot-password",
                data,
            );

            setSuccess(true);
        } catch (error: any) {
            setServerError(
                error.response?.data?.message ||
                    "Unable to process your password reset request.",
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
                            FORGOT PASSWORD CARD
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

                                {!success ? (
                                    <>
                                        {/* =================================
                                            HEADER
                                        ================================= */}

                                        <Stack gap={5}>
                                            <Title
                                                order={3}
                                                fw={700}
                                                className="!text-[var(--text-h)]"
                                            >
                                                Forgot your password?
                                            </Title>

                                            <Text
                                                size="sm"
                                                c="dimmed"
                                                lh={1.6}
                                            >
                                                Enter the email address
                                                associated with your FCV
                                                account and we'll send you a
                                                link to reset your password.
                                            </Text>
                                        </Stack>

                                        {/* =================================
                                            SERVER ERROR
                                        ================================= */}

                                        {serverError && (
                                            <Alert
                                                icon={
                                                    <AlertCircle size={18} />
                                                }
                                                color="red"
                                                variant="light"
                                                title="Unable to send reset link"
                                            >
                                                {serverError}
                                            </Alert>
                                        )}

                                        {/* =================================
                                            FORM
                                        ================================= */}

                                        <form
                                            onSubmit={handleSubmit(onSubmit)}
                                        >
                                            <Stack gap="md">

                                                <TextInput
                                                    label="Email"
                                                    placeholder="you@example.com"
                                                    type="email"
                                                    autoComplete="email"
                                                    size="md"
                                                    leftSection={
                                                        <Mail size={17} />
                                                    }
                                                    {...register("email")}
                                                    error={
                                                        errors.email?.message
                                                    }
                                                    classNames={{
                                                        input: "!border-[var(--border)] focus:!border-[var(--accent)]",
                                                    }}
                                                />

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
                                                    Send Reset Link
                                                </Button>
                                            </Stack>
                                        </form>

                                        {/* =================================
                                            BACK TO LOGIN
                                        ================================= */}

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
                                ) : (
                                    <>
                                        {/* =================================
                                            SUCCESS
                                        ================================= */}

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
                                                    Check your email
                                                </Title>

                                                <Text
                                                    size="sm"
                                                    c="dimmed"
                                                    lh={1.6}
                                                >
                                                    If an account exists with
                                                    that email address, a
                                                    password reset link has
                                                    been sent.
                                                </Text>
                                            </Stack>

                                            <Text
                                                size="xs"
                                                c="dimmed"
                                                lh={1.5}
                                            >
                                                The reset link will expire in
                                                60 minutes.
                                            </Text>
                                        </Stack>

                                        <Button
                                            component={Link}
                                            to="/login"
                                            variant="subtle"
                                            fullWidth
                                            leftSection={
                                                <ArrowLeft size={16} />
                                            }
                                            className="
                                                !text-[var(--accent)]
                                                hover:!bg-[var(--accent-bg)]
                                            "
                                        >
                                            Back to Login
                                        </Button>
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