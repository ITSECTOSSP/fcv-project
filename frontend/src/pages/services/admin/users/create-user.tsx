import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";

import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

import UserForm from "@/components/service/auth-fcv/user-form";

/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

export default function CreateUser() {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    navigate("/admin/users");
  };

  const handleSuccess = () => {
    navigate("/admin/users");
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/*
        |--------------------------------------------------------------------------
        | PAGE HEADER
        |--------------------------------------------------------------------------
        */}

        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Title order={2} c="var(--text-h)">
              Create User
            </Title>

            <Text size="sm" c="var(--text-muted)">
              Create a new user account and assign an HR-FCV employee to the
              account.
            </Text>
          </Stack>

          <Button
            variant="default"
            leftSection={<ArrowLeft size={17} />}
            onClick={handleBack}
          >
            Back to Users
          </Button>
        </Group>

        {/*
        |--------------------------------------------------------------------------
        | USER FORM
        |--------------------------------------------------------------------------
        */}

        <UserForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      </Stack>
    </Container>
  );
}
