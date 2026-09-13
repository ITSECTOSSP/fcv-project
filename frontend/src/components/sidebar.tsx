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
  BarChart3,
  ChevronUp,
  FileText,
  FolderKanban,
  Home,
  Image,
  Layers,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

/*
 * =========================================================
 * MAIN NAVIGATION
 * =========================================================
 */

const navigation = [
  {
    label: "Dashboard",
    icon: Home,
    to: "/dashboard",
  },
  {
    label: "Document Tracking",
    icon: FileText,
    to: "/tracking",
  },
  {
    label: "Records",
    icon: FolderKanban,
    to: "/records",
  },
  {
    label: "Users",
    icon: Users,
    to: "/users",
  },
  {
    label: "Reports",
    icon: BarChart3,
    to: "/reports",
  },
];

/*
 * =========================================================
 * BLOG NAVIGATION
 * =========================================================
 */

const blogNavigation = [
  {
    label: "Blog Dashboard",
    icon: Home,
    to: "/blog-dashboard",
  },
  {
    label: "Contents",
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
 * =========================================================
 * SYSTEM NAVIGATION
 * =========================================================
 */

const systemNavigation = [
  {
    label: "Security",
    icon: ShieldCheck,
    to: "/security",
  },
  {
    label: "Settings",
    icon: Settings,
    to: "/settings",
  },
];

interface AuthUser {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  /*
   * =========================================================
   * ACTIVE NAVIGATION
   * =========================================================
   */

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  /*
   * =========================================================
   * GET LOGGED-IN USER
   * =========================================================
   */

  const storedUser = localStorage.getItem("auth_user");

  let user: AuthUser = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    user = {};
  }

  /*
   * =========================================================
   * USERNAME
   * =========================================================
   */

  const username =
    user.username ||
    user.name ||
    user.email ||
    "User";

  /*
   * =========================================================
   * USER INITIAL
   * =========================================================
   */

  const userInitial = username
    .charAt(0)
    .toUpperCase();

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * =========================================================
   * CLOSE MOBILE SIDEBAR
   * =========================================================
   */

  const handleNavigation = () => {
    onClose?.();
  };

  /*
   * =========================================================
   * RENDER NAVIGATION
   * =========================================================
   */

  const renderNavigation = (
    items:
      | typeof navigation
      | typeof blogNavigation
      | typeof systemNavigation
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
              color: active
                ? "var(--accent)"
                : "var(--text)",

              backgroundColor: active
                ? "var(--accent-bg)"
                : "transparent",

              fontWeight: active ? 700 : 500,
            },

            section: {
              color: active
                ? "var(--accent)"
                : "var(--text)",
            },

            label: {
              color: active
                ? "var(--accent)"
                : "var(--text)",
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
          {/* FCV LOGO */}

          <Box
            component="img"
            src="/icons.png"
            alt="FCV"
            className="
              h-10
              w-auto
              shrink-0
              object-contain
            "
          />

          {/* BRAND TEXT */}

          <Stack
            gap={1}
            className="min-w-0 flex-1"
          >
            <Text
              fw={800}
              size="sm"
              className="
                !text-[var(--text-h)]
                tracking-wide
              "
            >
              FCV
            </Text>

            <Text
              size="xs"
              c="dimmed"
              lh={1.2}
              truncate
            >
              Forward • Commitment • Vision
            </Text>
          </Stack>

          {/* MOBILE CLOSE BUTTON */}

          <UnstyledButton
            onClick={onClose}
            hiddenFrom="sm"
            aria-label="Close sidebar"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-md
              !text-[var(--text)]
              transition-all
              duration-150
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

      <ScrollArea
        type="auto"
        offsetScrollbars
        className="flex-1"
      >
        <Stack gap={4} px="sm" py="md">

          {/* =================================================
              MAIN
              ================================================= */}

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

          {/* =================================================
              BLOG
              ================================================= */}

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

          {/* =================================================
              SYSTEM
              ================================================= */}

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
        <Divider
          color="var(--border)"
          mb="sm"
        />

        <Menu
          position="top-start"
          offset={8}
          withArrow
          shadow="md"
          width={220}
        >

          {/* =================================================
              USER BUTTON
              ================================================= */}

          <Menu.Target>
            <UnstyledButton
              className="
                w-full
                rounded-md
                p-2
                transition-all
                duration-150
                hover:!bg-[var(--accent-bg)]
              "
            >
              <Group
                gap="sm"
                wrap="nowrap"
              >

                {/* AVATAR */}

                <Box
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    !bg-[var(--accent-bg)]
                    !text-[var(--accent)]
                    font-semibold
                  "
                >
                  {userInitial}
                </Box>

                {/* USERNAME */}

                <Box
                  className="
                    min-w-0
                    flex-1
                    text-left
                  "
                >
                  <Text
                    size="sm"
                    fw={600}
                    truncate
                    className="!text-[var(--text-h)]"
                  >
                    {username}
                  </Text>

                  <Text
                    size="xs"
                    truncate
                    c="dimmed"
                  >
                    {user.email ||
                      "Manage your account"}
                  </Text>
                </Box>

                <ChevronUp
                  size={16}
                  className="
                    shrink-0
                    text-[var(--text)]
                  "
                />

              </Group>
            </UnstyledButton>
          </Menu.Target>

          {/* =================================================
              DROPDOWN
              ================================================= */}

          <Menu.Dropdown
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
            "
          >

            {/* USER INFORMATION */}

            <Box px="sm" py="xs">
              <Text
                size="sm"
                fw={700}
                className="!text-[var(--text-h)]"
              >
                {username}
              </Text>

              {user.email && (
                <Text
                  size="xs"
                  c="dimmed"
                  truncate
                >
                  {user.email}
                </Text>
              )}
            </Box>

            <Menu.Divider />

            {/* PROFILE */}

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

            {/* SETTINGS */}

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

            {/* LOGOUT */}

            <Menu.Item
              leftSection={<LogOut size={16} />}
              onClick={handleLogout}
              className="
                !text-red-500
                hover:!bg-red-500/10
              "
            >
              Log out
            </Menu.Item>

          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
}