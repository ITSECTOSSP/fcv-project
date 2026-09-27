export type Role = {
  id: string;
  name: string;
  key: string;
};

export type RoleOption = {
  value: string;
  label: string;
};

export type RolesResponse = {
  data: Role[];
};