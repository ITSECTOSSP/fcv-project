import { useState } from "react";
import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  {
    label: "Home",
    to: "/",
  },
    {
    label: "Solutions",
    to: "/solutions",
  },
  {
    label: "Contact",
    to: "/contact",
  },
  {
    label: "About FCV",
    to: "/about",
  },
];

const solutionNavigation = [
  {
    label: "Coming Soon",
    to: "/",
  },
  // {
  //   label: "Document Requests",
  //   to: "/requests",
  // },
  // {
  //   label: "Certified Copies",
  //   to: "/certified-copies",
  // },
  // {
  //   label: "Track Request",
  //   to: "/track-request",
  // },
];

export default function PublicNavbar() {
  const location = useLocation();

  const [mobileOpened, setMobileOpened] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const closeMobileMenu = () => {
    setMobileOpened(false);
  };

  return (
    <>
      {/* =====================================================
                PUBLIC NAVBAR
            ====================================================== */}
      <Box
        component="header"
        className="
                    sticky
                    top-0
                    z-50
                    border-b
                    border-[var(--border)]
                    bg-[var(--surface)]/95
                    shadow-sm
                    backdrop-blur-md
                    transition-colors
                    duration-200
                "
      >
        {/* =================================================
                    NAVBAR CONTAINER
                ================================================== */}
        <Box
          px={{
            base: "md",
            sm: "xl",
            lg: 60,
          }}
        >
          <Group h={76} justify="space-between" wrap="nowrap">
            {/* =================================================
                            FCV BRAND
                        ================================================== */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="
                                no-underline
                                shrink-0
                            "
            >
              <Group gap="sm" wrap="nowrap">
                <Box
                  component="img"
                  src="/icons.png"
                  alt="FCV"
                  className="
                                        h-10
                                        w-auto
                                        object-contain
                                        sm:h-11
                                    "
                />

                <Stack gap={1}>
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

                  <Text size="xs" c="dimmed" visibleFrom="sm">
                    Forward • Commitment • Vision
                  </Text>
                </Stack>
              </Group>
            </Link>

            {/* =================================================
                            DESKTOP MAIN NAVIGATION
                        ================================================== */}
            <Group gap="lg" visibleFrom="md" wrap="nowrap">
              {navigation.map((item) => {
                const active = isActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="
                                            group
                                            relative
                                            flex
                                            h-10
                                            items-center
                                            no-underline
                                        "
                  >
                    <Text
                      size="sm"
                      fw={active ? 700 : 500}
                      className={`
                                                transition-colors
                                                duration-200
                                                ${
                                                  active
                                                    ? "!text-[var(--accent)]"
                                                    : "!text-[var(--text)]"
                                                }
                                                group-hover:!text-[var(--accent)]
                                            `}
                    >
                      {item.label}
                    </Text>

                    {/* Animated underline */}
                    <Box
                      component="span"
                      className={`
                                                absolute
                                                bottom-1
                                                left-0
                                                h-[2px]
                                                w-full
                                                origin-left
                                                bg-[var(--accent)]
                                                transition-transform
                                                duration-300
                                                ${
                                                  active
                                                    ? "scale-x-100"
                                                    : "scale-x-0 group-hover:scale-x-100"
                                                }
                                            `}
                    />
                  </Link>
                );
              })}

            </Group>

            {/* =================================================
                            DESKTOP AUTH ACTIONS
                        ================================================== */}
            <Group gap="xs" wrap="nowrap" visibleFrom="sm">
              <Button
                component={Link}
                to="/login"
                variant="subtle"
                className="
                                    !text-[var(--text)]
                                    transition-colors
                                    duration-150
                                    hover:!bg-[var(--accent-bg)]
                                    hover:!text-[var(--accent)]
                                "
              >
                Log in
              </Button>

              <Button
                component={Link}
                to="/register"
                className="
                                    !bg-[var(--accent)]
                                    !text-white
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:!bg-[var(--accent-hover)]
                                    hover:!shadow-md
                                "
              >
                Register
              </Button>
            </Group>

            {/* =================================================
                            MOBILE MENU BUTTON
                        ================================================== */}
            <Burger
              opened={mobileOpened}
              onClick={() => setMobileOpened((opened) => !opened)}
              hiddenFrom="md"
              size="sm"
              aria-label={mobileOpened ? "Close navigation" : "Open navigation"}
              className="
                                !text-[var(--text)]
                            "
            />
          </Group>
        </Box>

        {/* =====================================================
                    GOLD ACCENT LINE
                ====================================================== */}
        <Box
          h={2}
          className="
                        bg-gradient-to-r
                        from-transparent
                        via-[var(--accent)]
                        to-transparent
                        opacity-70
                    "
        />
      </Box>

      {/* =========================================================
                MOBILE DRAWER
            ========================================================== */}
      <Drawer
        opened={mobileOpened}
        onClose={closeMobileMenu}
        position="right"
        size="85%"
        title={
          <Group gap="sm" wrap="nowrap">
            <Box
              component="img"
              src="/icons.png"
              alt="FCV"
              className="
                                h-9
                                w-auto
                                object-contain
                            "
            />

            <Stack gap={0}>
              <Text
                fw={800}
                size="sm"
                className="
                                    !text-[var(--text-h)]
                                "
              >
                FCV
              </Text>

              <Text size="xs" c="dimmed">
                Forward • Commitment • Vision
              </Text>
            </Stack>
          </Group>
        }
        hiddenFrom="md"
        classNames={{
          content: `
                        !bg-[var(--surface)]
                        !text-[var(--text)]
                    `,
          header: `
                        !bg-[var(--surface)]
                        !border-[var(--border)]
                    `,
          title: `
                        !text-[var(--text-h)]
                    `,
        }}
      >
        <Stack justify="space-between" className="h-[calc(100vh-80px)]">
          {/* =================================================
                        MOBILE NAVIGATION ITEMS
                    ================================================== */}
          <Stack gap="xs">
            <Text
              size="xs"
              fw={700}
              className="
                                mb-2
                                uppercase
                                tracking-[0.2em]
                                !text-[var(--accent)]
                            "
            >
              Navigation
            </Text>

            {navigation.map((item) => {
              const active = isActive(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className="
                                        no-underline
                                    "
                >
                  <Box
                    className={`
                                            flex
                                            min-h-12
                                            items-center
                                            rounded-lg
                                            px-4
                                            transition-all
                                            duration-200
                                            ${
                                              active
                                                ? "bg-[var(--accent-bg)]"
                                                : "hover:bg-[var(--accent-bg)]"
                                            }
                                        `}
                  >
                    <Text
                      size="md"
                      fw={active ? 700 : 500}
                      className={`
                                                ${
                                                  active
                                                    ? "!text-[var(--accent)]"
                                                    : "!text-[var(--text)]"
                                                }
                                                transition-colors
                                                duration-200
                                            `}
                    >
                      {item.label}
                    </Text>
                  </Box>
                </Link>
              );
            })}

            {/* =================================================
                            MOBILE SERVICES
                        ================================================== */}
            {/* <Box
              className="
                                flex
                                min-h-12
                                items-center
                                rounded-lg
                                px-4
                                transition-colors
                                duration-200
                                hover:bg-[var(--accent-bg)]
                            "
            >
              <Text
                size="md"
                fw={500}
                className="
                                    !text-[var(--text)]
                                "
              >
                Services
              </Text>
            </Box> */}
          </Stack>

          {/* =================================================
                        MOBILE AUTH ACTIONS
                    ================================================== */}
          <Stack gap="sm">
            <Divider color="var(--border)" />

            <Button
              component={Link}
              to="/login"
              onClick={closeMobileMenu}
              variant="subtle"
              fullWidth
              size="md"
              className="
                                !text-[var(--text)]
                                hover:!bg-[var(--accent-bg)]
                                hover:!text-[var(--accent)]
                            "
            >
              Log in
            </Button>

            <Button
              component={Link}
              to="/register"
              onClick={closeMobileMenu}
              fullWidth
              size="md"
              className="
                                !bg-[var(--accent)]
                                !text-white
                                shadow-sm
                                transition-all
                                duration-200
                                hover:!bg-[var(--accent-hover)]
                                hover:!shadow-md
                            "
            >
              Register
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
