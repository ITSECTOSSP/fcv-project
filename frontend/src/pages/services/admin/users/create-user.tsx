import { Container, Group, Stack, Text, Title, Button } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import UserForm from "@/components/service/auth-fcv/user-form";

export default function CreateUser() {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={2} c="var(--text-h)">
              Create User
            </Title>

            <Text size="sm" c="var(--text-muted)">
              Create a new user account and assign access to the system.
            </Text>
          </Stack>

          <Button
            variant="default"
            leftSection={<ArrowLeft size={17} />}
            onClick={() => navigate("/admin/users")}
          >
            Back to Users
          </Button>
        </Group>

        {/* User Form */}
        <UserForm
          mode="create"
          onSuccess={() => navigate("/admin/users")}
          onCancel={() => navigate("/admin/users")}
        />
      </Stack>
    </Container>
  );
}
