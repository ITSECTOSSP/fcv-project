import {
  Alert,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { AlertCircle, ArrowLeft, KeyRound, Save } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PermissionSelector from "@/components/service/auth-fcv/permission/permission-form";
import { useManageUserPermissions } from "@/lib/hook/auth-fcv/permission-user";
export default function UserPermissions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    permissions,
    groupedPermissions,
    selectedPermissionIds,
    setSelectedPermissionIds,
    loading,
    updating,
    error,
    updateError,
    updatePermissions,
  } = useManageUserPermissions(id);
  const handleSave = async () => {
    const response = await updatePermissions(selectedPermissionIds);
    if (response) {
      navigate("/admin/users");
    }
  };
  useEffect(() => {
    if (!id) {
      navigate("/admin/users", { replace: true });
    }
  }, [id, navigate]);
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
            <Group gap="sm">
              {" "}
              <KeyRound size={22} />{" "}
              <Title order={2} c="var(--text-h)">
                {" "}
                Manage Permissions{" "}
              </Title>{" "}
            </Group>{" "}
            <Text size="sm" c="var(--text-muted)">
              {" "}
              Manage the direct permissions assigned to this user.{" "}
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
        {/* Error */}{" "}
        {(error || updateError) && (
          <Alert color="red" variant="light" icon={<AlertCircle size={18} />}>
            {" "}
            {error || updateError}{" "}
          </Alert>
        )}{" "}
        {/* Permissions */}{" "}
        <Card withBorder radius="md" padding="lg">
          {" "}
          <Stack gap="lg">
            {" "}
            {/* Section Header */}{" "}
            <div>
              {" "}
              <Text fw={600} size="lg">
                {" "}
                Permissions{" "}
              </Text>{" "}
              <Text size="sm" c="dimmed">
                {" "}
                Select the permissions that should be directly assigned to this
                user.{" "}
              </Text>{" "}
            </div>{" "}
            <Divider /> {/* Permission Selector */}{" "}
            <PermissionSelector
              permissions={permissions}
              groupedPermissions={groupedPermissions}
              selectedPermissionIds={selectedPermissionIds}
              setSelectedPermissionIds={setSelectedPermissionIds}
              loading={loading}
            />{" "}
            <Divider /> {/* Actions */}{" "}
            <Group justify="flex-end">
              {" "}
              <Button
                variant="default"
                disabled={updating}
                onClick={() => navigate("/admin/users")}
              >
                {" "}
                Cancel{" "}
              </Button>{" "}
              <Button
                leftSection={updating ? undefined : <Save size={17} />}
                loading={updating}
                onClick={handleSave}
                disabled={loading || !!error || permissions.length === 0}
              >
                {" "}
                Save Permissions{" "}
              </Button>{" "}
            </Group>{" "}
          </Stack>{" "}
        </Card>{" "}
      </Stack>{" "}
    </Container>
  );
}
