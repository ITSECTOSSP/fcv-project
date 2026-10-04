import {
    Button,
    Card,
    Divider,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Save } from "lucide-react";

import type {
    AttachmentType,
    CreateAttachmentTypePayload,
} from "@/types/inv-fcv/attachment-type";

/* =====================================================
   TYPES
====================================================== */

type AttachmentTypeFormProps = {
    loading?: boolean;
    submitting?: boolean;
    error?: string | null;
    initialValues?: Partial<AttachmentType>;
    submitLabel?: string;
    onSubmit: (
        values: CreateAttachmentTypePayload,
    ) => void | Promise<void>;
    onCancel: () => void;
};

/* =====================================================
   ATTACHMENT TYPE FORM
====================================================== */

export default function AttachmentTypeForm({
    loading = false,
    submitting = false,
    error = null,
    initialValues,
    submitLabel = "Save Attachment Type",
    onSubmit,
    onCancel,
}: AttachmentTypeFormProps) {
    /* =====================================================
       FORM
    ====================================================== */

    const form = useForm<CreateAttachmentTypePayload>({
        mode: "uncontrolled",

        initialValues: {
            name: initialValues?.name ?? "",
            description: initialValues?.description ?? "",
        },

        validate: {
            name: (value) =>
                value.trim()
                    ? null
                    : "Attachment type name is required.",
        },
    });

    /* =====================================================
       SUBMIT
    ====================================================== */

    const handleSubmit = async (
        values: CreateAttachmentTypePayload,
    ) => {
        await onSubmit({
            name: values.name.trim(),
            description:
                values.description?.trim() || null,
        });
    };

    /* =====================================================
       LOADING
    ====================================================== */

    if (loading) {
        return (
            <Card
                withBorder
                radius="md"
                padding="lg"
                shadow="sm"
            >
                <Text size="sm" c="dimmed">
                    Loading attachment type...
                </Text>
            </Card>
        );
    }

    /* =====================================================
       RENDER
    ====================================================== */

    return (
        <form
            onSubmit={form.onSubmit(handleSubmit)}
        >
            <Card
                withBorder
                radius="md"
                padding={0}
                shadow="sm"
            >
                <Stack gap={0}>

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <Stack gap={8} p="lg">
                        <Text
                            fw={600}
                            size="md"
                        >
                            Attachment Type Information
                        </Text>

                        <Text
                            size="sm"
                            c="dimmed"
                        >
                            Define a type of file that can be
                            associated with equipment.
                        </Text>
                    </Stack>

                    <Divider />

                    {/* =====================================================
                        ERROR
                    ====================================================== */}

                    {error && (
                        <>
                            <Stack p="lg">
                                <Text
                                    size="sm"
                                    c="red"
                                >
                                    {error}
                                </Text>
                            </Stack>

                            <Divider />
                        </>
                    )}

                    {/* =====================================================
                        DETAILS
                    ====================================================== */}

                    <Stack
                        gap="lg"
                        p="lg"
                    >
                        <TextInput
                            label="Name"
                            placeholder="Enter attachment type"
                            description="Example: Equipment Photo, Warranty, Invoice"
                            withAsterisk
                            disabled={submitting}
                            {...form.getInputProps(
                                "name",
                            )}
                        />

                        <Textarea
                            label="Description"
                            placeholder="Enter attachment type description"
                            description="Provide a brief description of this attachment type."
                            minRows={4}
                            autosize
                            maxRows={8}
                            disabled={submitting}
                            {...form.getInputProps(
                                "description",
                            )}
                        />
                    </Stack>

                    <Divider />

                    {/* =====================================================
                        ACTIONS
                    ====================================================== */}

                    <Stack
                        p="lg"
                        align="flex-end"
                    >
                        <Stack
                            gap="sm"
                            style={{
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                type="button"
                                variant="default"
                                disabled={submitting}
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                leftSection={
                                    <Save size={17} />
                                }
                                loading={submitting}
                            >
                                {submitLabel}
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Card>
        </form>
    );
}