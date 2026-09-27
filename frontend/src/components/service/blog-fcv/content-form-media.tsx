import { ActionIcon, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import { Image as MantineImage } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Image, Upload, X } from "lucide-react";
import type { ReactNode } from "react";

import { mediaApi } from "@/lib/api/blog-fcv/media";
import type { ContentMedia } from "@/types/blog-fcv/content";

interface ContentMediaFieldProps {
  label: string;
  existingMedia?: ContentMedia | null;
  value: File | null;
  error?: ReactNode;
  loading?: boolean;
  maxSizeDescription: string;
  maxSize: number;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
}

export default function ContentMediaField({
  label,
  existingMedia,
  value,
  error,
  loading = false,
  maxSizeDescription,
  maxSize,
  onChange,
  onRemoveExisting,
}: ContentMediaFieldProps) {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>

      {/* Existing Media */}
      {existingMedia && !value && (
        <Card withBorder padding="sm" radius="sm">
          <Stack gap="xs">
            <MantineImage
              src={mediaApi.getUrl(existingMedia)}
              alt={existingMedia.alt_text ?? label}
              radius="md"
              h={200}
              fit="contain"
            />

            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed" truncate>
                {existingMedia.file_name}
              </Text>

              {onRemoveExisting && (
                <Tooltip label={`Remove ${label.toLowerCase()}`}>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    disabled={loading}
                    onClick={onRemoveExisting}
                  >
                    <X size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Stack>
        </Card>
      )}

      {/* New / Replacement Image */}
      {value && (
        <Card withBorder padding="sm" radius="sm">
          <Stack gap="xs">
            <MantineImage
              src={URL.createObjectURL(value)}
              alt={value.name}
              radius="md"
              h={200}
              fit="contain"
            />

            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed" truncate>
                {value.name}
              </Text>

              <X
                size={16}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => onChange(null)}
              />
            </Group>
          </Stack>
        </Card>
      )}

      {/* Dropzone */}
      <Dropzone
        onDrop={(files) => {
          onChange(files[0] ?? null);
        }}
        onReject={() => {
          // Validation is handled by the form.
        }}
        maxSize={maxSize}
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        disabled={loading}
      >
        <Group
          justify="center"
          gap="xl"
          mih={140}
          style={{
            pointerEvents: "none",
          }}
        >
          <Dropzone.Accept>
            <Upload size={40} />
          </Dropzone.Accept>

          <Dropzone.Reject>
            <X size={40} />
          </Dropzone.Reject>

          <Dropzone.Idle>
            <Image size={40} />
          </Dropzone.Idle>

          <div>
            <Text size="sm" fw={500}>
              {existingMedia
                ? `Drop a new ${label.toLowerCase()} here`
                : `Drop ${label.toLowerCase()} here`}
            </Text>

            <Text size="xs" c="dimmed">
              or click to browse
            </Text>

            <Text size="xs" c="dimmed" mt={4}>
              JPG, PNG, or WebP. {maxSizeDescription}
            </Text>
          </div>
        </Group>
      </Dropzone>

      {error && (
        <Text size="sm" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
}
