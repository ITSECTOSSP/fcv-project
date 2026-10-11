import {
  Box,
  Divider,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";

import {
  ChevronUp,
  FileText,
  FolderKanban,
  Home,
  Image,
  Layers,
  LogOut,
  Settings,
  Settings2,
  User,
  X,
  Boxes,
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  ClipboardList,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/api/auth/use-auth";

/*
|--------------------------------------------------------------------------
| MAIN NAVIGATION
|--------------------------------------------------------------------------
*/

const navigation = [
  {
    label: "Dashboard",
    icon: Home,
    to: "/dashboard",
  },
];

/*
|--------------------------------------------------------------------------
| INVENTORY NAVIGATION
|--------------------------------------------------------------------------
*/

const invNavigation = [
  {
    label: "Inventory Dashboard",
    icon: ClipboardList,
    to: "/inventory/dashboard",
  },
  {
    label: "Manage Equipments",
    icon: Boxes,
    to: "/inventory/manage",
  },
  {
    label: "Inventory Configuration",
    icon: Settings2,
    to: "/inventory/configutation",
  },
];

/*
|--------------------------------------------------------------------------
| HR NAVIGATION
|--------------------------------------------------------------------------
*/

const hrNavigation = [
  {
    label: "Employees Dashboard",
    icon: LayoutDashboard,
    to: "/human-resource/dashboard",
  },
  {
    label: "Manage Employees",
    icon: Users,
    to: "/human-resource/manage",
  },
  {
    label: "HR Configuration",
    icon: SlidersHorizontal,
    to: "/human-resource/configuration",
  },
];

/*
|--------------------------------------------------------------------------
| BLOG NAVIGATION
|--------------------------------------------------------------------------
*/

const blogNavigation = [
  {
    label: "Blog Dashboard",
    icon: Home,
    to: "/blog-dashboard",
  },
  {
    label: "Manage Contents",
    icon: FileText,
    to: "/blog/contents",
  },
  {
    label: "Categories",
    icon: FolderKanban,
    to: "/blog/categories",
  },
  {
    label: "Content Types",
    icon: Layers,
    to: "/blog/content-types",
  },
  {
    label: "Media",
    icon: Image,
    to: "/blog/media",
  },
];

/*
|--------------------------------------------------------------------------
| SYSTEM NAVIGATION
|--------------------------------------------------------------------------
*/

const systemNavigation = [
  {
    label: "Users",
    icon: Users,
    to: "/admin/users",
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | SHARED AUTHENTICATION STATE
  |--------------------------------------------------------------------------
  */

  const { user, isCheckingAuth, isAuthenticated } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | ACTIVE NAVIGATION
  |--------------------------------------------------------------------------
  */

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | AUTH ACCOUNT INFORMATION
  |--------------------------------------------------------------------------
  */

  const username = user?.name || user?.email || "User";

  /*
  |--------------------------------------------------------------------------
  | EMPLOYEE NAME
  |--------------------------------------------------------------------------
  */

  const employeeName = user?.employee
    ? [
        user.employee.first_name,
        user.employee.middle_name,
        user.employee.last_name,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  /*
  |--------------------------------------------------------------------------
  | DISPLAY NAME
  |--------------------------------------------------------------------------
  */

  const displayName = isCheckingAuth
    ? "Loading account..."
    : employeeName || username;

  /*
  |--------------------------------------------------------------------------
  | USER INITIAL
  |--------------------------------------------------------------------------
  */

  const userInitial = isCheckingAuth
    ? "…"
    : displayName.charAt(0).toUpperCase();

  /*
  |--------------------------------------------------------------------------
  | EMPLOYEE ORGANIZATION
  |--------------------------------------------------------------------------
  */

  const sectionName = user?.employee?.section?.name;
  const divisionName = user?.employee?.section?.division?.name;

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();

    window.location.assign("/login");
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MOBILE SIDEBAR
  |--------------------------------------------------------------------------
  */

  const handleNavigation = () => {
    onClose?.();
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER NAVIGATION
  |--------------------------------------------------------------------------
  */

  const renderNavigation = (
    items:
      | typeof navigation
      | typeof invNavigation
      | typeof hrNavigation
      | typeof blogNavigation
      | typeof systemNavigation,
  ) => {
    return items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.to);

      return (
        <NavLink
          key={item.to}
          component={Link}
          to={item.to}
          label={item.label}
          leftSection={<Icon size={18} />}
          active={active}
          onClick={handleNavigation}
          className="
            rounded-md
            transition-all
            duration-150
            hover:!bg-[var(--accent-bg)]
          "
          styles={{
            root: {
              color: active ? "var(--accent)" : "var(--text)",
              backgroundColor: active ? "var(--accent-bg)" : "transparent",
              fontWeight: active ? 700 : 500,
            },
            section: {
              color: active ? "var(--accent)" : "var(--text)",
            },
            label: {
              color: active ? "var(--accent)" : "var(--text)",
            },
          }}
        />
      );
    });
  };

  return (
    <Box
      h="100%"
      className="
        flex
        flex-col
        border-r
        !border-[var(--border)]
        !bg-[var(--surface)]
        !text-[var(--text)]
        transition-colors
        duration-200
      "
    >
      {/* =====================================================
          BRAND
      ===================================================== */}

      <Box px="lg" py="md">
        <Group gap="sm" wrap="nowrap">
          <Box
            component="img"
            src="/icons.png"
            alt="FCV"
            className="h-10 w-auto shrink-0 object-contain"
          />

          <Stack gap={1} className="min-w-0 flex-1">
            <Text
              fw={800}
              size="sm"
              className="!text-[var(--text-h)] tracking-wide"
            >
              FCV
            </Text>

            <Text size="xs" c="dimmed" lh={1.2} truncate>
              Forward • Commitment • Vision
            </Text>
          </Stack>

          <UnstyledButton
            onClick={onClose}
            hiddenFrom="sm"
            aria-label="Close sidebar"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-md !text-[var(--text)]
              transition-all duration-150
              hover:!bg-[var(--accent-bg)]
              hover:!text-[var(--accent)]
            "
          >
            <X size={20} />
          </UnstyledButton>
        </Group>
      </Box>

      <Divider color="var(--border)" />

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <ScrollArea type="auto" offsetScrollbars className="flex-1">
        <Stack gap={4} px="sm" py="md">
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            px="sm"
            mb={4}
            tt="uppercase"
            className="tracking-wider"
          >
            Main
          </Text>

          {renderNavigation(navigation)}

          <Text
            size="xs"
            fw={700}
            c="dimmed"
            px="sm"
            mt="lg"
            mb={4}
            tt="uppercase"
            className="tracking-wider"
          >
            Inventory
          </Text>

          {renderNavigation(invNavigation)}

          <Text
            size="xs"
            fw={700}
            c="dimmed"
            px="sm"
            mt="lg"
            mb={4}
            tt="uppercase"
            className="tracking-wider"
          >
            Human Resource
          </Text>

          {renderNavigation(hrNavigation)}

          <Text
            size="xs"
            fw={700}
            c="dimmed"
            px="sm"
            mt="lg"
            mb={4}
            tt="uppercase"
            className="tracking-wider"
          >
            Blog
          </Text>

          {renderNavigation(blogNavigation)}

          <Text
            size="xs"
            fw={700}
            c="dimmed"
            px="sm"
            mt="lg"
            mb={4}
            tt="uppercase"
            className="tracking-wider"
          >
            System
          </Text>

          {renderNavigation(systemNavigation)}
        </Stack>
      </ScrollArea>

      {/* =====================================================
          USER ACCOUNT
      ===================================================== */}

      <Box px="sm" py="sm">
        <Divider color="var(--border)" mb="sm" />

        <Menu position="top-start" offset={8} withArrow shadow="md" width={260}>
          <Menu.Target>
            <UnstyledButton
              className="
                w-full rounded-md p-2
                transition-all duration-150
                hover:!bg-[var(--accent-bg)]
              "
            >
              <Group gap="sm" wrap="nowrap">
                {/* AVATAR */}

                <Box
                  className="
                    flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-full !bg-[var(--accent-bg)]
                    !text-[var(--accent)] font-semibold
                  "
                >
                  {userInitial}
                </Box>

                {/* USER INFORMATION */}

                <Box className="min-w-0 flex-1 text-left">
                  <Text
                    size="sm"
                    fw={600}
                    truncate
                    className="!text-[var(--text-h)]"
                  >
                    {displayName}
                  </Text>

                  <Text size="xs" truncate c="dimmed">
                    {isCheckingAuth
                      ? "Verifying account..."
                      : user?.email || "Manage your account"}
                  </Text>
                </Box>

                <ChevronUp size={16} className="shrink-0 text-[var(--text)]" />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          {/* DROPDOWN */}

          <Menu.Dropdown className="!border-[var(--border)] !bg-[var(--surface)]">
            <Box px="sm" py="xs">
              <Text size="sm" fw={700} className="!text-[var(--text-h)]">
                {displayName}
              </Text>

              {employeeName && (
                <Text size="xs" c="dimmed" truncate>
                  Account: {username}
                </Text>
              )}

              {sectionName && (
                <Text size="xs" c="dimmed" truncate>
                  Section: {sectionName}
                </Text>
              )}

              {divisionName && (
                <Text size="xs" c="dimmed" truncate>
                  Division: {divisionName}
                </Text>
              )}

              {!isCheckingAuth && !isAuthenticated && (
                <Text size="xs" c="dimmed">
                  Not authenticated
                </Text>
              )}
            </Box>

            <Menu.Divider />

            <Menu.Item
              component={Link}
              to="/profile"
              leftSection={<User size={16} />}
              onClick={handleNavigation}
              className="
                !text-[var(--text)]
                hover:!bg-[var(--accent-bg)]
                hover:!text-[var(--accent)]
              "
            >
              Profile
            </Menu.Item>

            <Menu.Item
              component={Link}
              to="/settings"
              leftSection={<Settings size={16} />}
              onClick={handleNavigation}
              className="
                !text-[var(--text)]
                hover:!bg-[var(--accent-bg)]
                hover:!text-[var(--accent)]
              "
            >
              Settings
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={<LogOut size={16} />}
              onClick={handleLogout}
              className="!text-red-500 hover:!bg-red-500/10"
            >
              Log out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
}
