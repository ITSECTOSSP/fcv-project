import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import UserForm from "@/components/service/auth-fcv/user-form";
export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <Container size="lg" py="xl">
      {" "}
      <Stack gap="xl">
        {" "}
        {/* Header */}{" "}
        <Group justify="space-between" align="flex-start">
          {" "}
          <Stack gap={4}>
            {" "}
            <Title order={2} c="var(--text-h)">
              {" "}
              Edit User{" "}
            </Title>{" "}
            <Text size="sm" c="var(--text-muted)">
              {" "}
              Update the user's account information and access.{" "}
            </Text>{" "}
          </Stack>{" "}
          <Button
            variant="default"
            leftSection={<ArrowLeft size={17} />}
            onClick={() => navigate("/admin/users")}
          >
            {" "}
            Back to Users{" "}
          </Button>{" "}
        </Group>{" "}
        {/* User Form */}{" "}
        <UserForm
          mode="edit"
          userId={id}
          onSuccess={() => navigate("/admin/users")}
          onCancel={() => navigate("/admin/users")}
        />{" "}
      </Stack>{" "}
    </Container>
  );
}
