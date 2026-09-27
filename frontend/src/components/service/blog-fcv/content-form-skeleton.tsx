import {
  Card,
  Divider,
  Grid,
  Group,
  Skeleton,
  Stack,
} from "@mantine/core";

export default function ContentFormSkeleton() {
  return (
    <Stack gap="lg">
      {/* Basic Information */}
      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Group gap="sm">
            <Skeleton height={20} width={20} radius="sm" />

            <Stack gap={6}>
              <Skeleton height={16} width={160} radius="sm" />
              <Skeleton height={12} width={280} radius="sm" />
            </Stack>
          </Group>

          <Divider />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Skeleton height={36} radius="sm" />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Skeleton height={36} radius="sm" />
            </Grid.Col>

            <Grid.Col span={12}>
              <Skeleton height={36} radius="sm" />
            </Grid.Col>

            <Grid.Col span={12}>
              <Skeleton height={36} radius="sm" />
            </Grid.Col>

            <Grid.Col span={12}>
              <Skeleton height={90} radius="sm" />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Content */}
      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Group gap="sm">
            <Skeleton height={20} width={20} radius="sm" />

            <Stack gap={6}>
              <Skeleton height={16} width={100} radius="sm" />
              <Skeleton height={12} width={280} radius="sm" />
            </Stack>
          </Group>

          <Divider />

          <Skeleton height={420} radius="sm" />
        </Stack>
      </Card>

      {/* Categories */}
      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Stack gap={6}>
            <Skeleton height={16} width={100} radius="sm" />
            <Skeleton height={12} width={300} radius="sm" />
          </Stack>

          <Divider />

          <Grid>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid.Col
                key={index}
                span={{
                  base: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Group gap="sm">
                  <Skeleton height={18} width={18} radius="sm" />
                  <Skeleton height={14} width="65%" radius="sm" />
                </Group>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Card>

      {/* Media */}
      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Group gap="sm">
            <Skeleton height={20} width={20} radius="sm" />

            <Stack gap={6}>
              <Skeleton height={16} width={70} radius="sm" />
              <Skeleton height={12} width={300} radius="sm" />
            </Stack>
          </Group>

          <Divider />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Skeleton height={16} width={120} radius="sm" />
                <Skeleton height={200} radius="md" />
                <Skeleton height={36} radius="sm" />
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Skeleton height={16} width={120} radius="sm" />
                <Skeleton height={200} radius="md" />
                <Skeleton height={36} radius="sm" />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Attachments */}
      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Group gap="sm">
            <Skeleton height={20} width={20} radius="sm" />

            <Stack gap={6}>
              <Skeleton height={16} width={110} radius="sm" />
              <Skeleton height={12} width={300} radius="sm" />
            </Stack>
          </Group>

          <Divider />

          <Skeleton height={36} radius="sm" />
        </Stack>
      </Card>

      {/* Publication Settings */}
      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Stack gap={6}>
            <Skeleton height={16} width={150} radius="sm" />
            <Skeleton height={12} width={300} radius="sm" />
          </Stack>

          <Divider />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Skeleton height={36} radius="sm" />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Skeleton height={24} width={180} mt={20} radius="sm" />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Actions */}
      <Group justify="flex-end">
        <Skeleton height={36} width={90} radius="sm" />
        <Skeleton height={36} width={150} radius="sm" />
      </Group>
    </Stack>
  );
}