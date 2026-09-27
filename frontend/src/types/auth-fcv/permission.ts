export type Permission = {
  id: string;
  group: string;
  name: string;
  key: string;
};

export type PermissionOption = {
  value: string;
  label: string;
};

export type PermissionsResponse = {
  data: Permission[];
};

export type UserPermissionsResponse = {
  data: Permission[];
};

export type UpdateUserPermissionsPayload = {
  permission_ids: string[];
};

export type UpdateUserPermissionsResponse = {
  message: string;
  data: Permission[];
};

