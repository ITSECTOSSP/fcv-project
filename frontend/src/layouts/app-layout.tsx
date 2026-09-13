import { useEffect, useState } from "react";
import { AppShell, Box, Burger, Button, Group, Text } from "@mantine/core";
import { ArrowUp } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/sidebar";
import ThemeToggle from "@/components/theme-toggle";

export default function AppLayout() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [desktopOpened, setDesktopOpened] = useState(true);
  const [mobileOpened, setMobileOpened] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const location = useLocation();

  const pageTitle =
    location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Dashboard";

  return (
    <AppShell
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened,
        },
      }}
      padding={0}
      className="
        !bg-[var(--bg)]
        !text-[var(--text)]
      "
    >
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <AppShell.Navbar
        p={0}
        className="
          !border-r
          !border-[var(--border)]
          !bg-[var(--surface)]
          !text-[var(--text)]
          transition-colors
          duration-200
        "
      >
        <AppShell.Navbar
          p={0}
          className="
    !border-r
    !border-[var(--border)]
    !bg-[var(--surface)]
    !text-[var(--text)]
    transition-colors
    duration-200
  "
        >
          <Sidebar onClose={() => setMobileOpened(false)} />
        </AppShell.Navbar>
      </AppShell.Navbar>

      {/* =====================================================
          CONTENT AREA
          ===================================================== */}

      <AppShell.Main
        className="
          !bg-[var(--bg)]
          !text-[var(--text)]
          transition-colors
          duration-200
        "
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <Box
          component="header"
          h={50}
          className="
            sticky
            top-0
            z-40
            border-b
            border-[var(--border)]
            bg-[var(--surface)]/95
            text-[var(--text)]
            shadow-sm
            backdrop-blur-md
            transition-colors
            duration-200
          "
        >
          <Group h="100%" px="md" gap="md">
            <Group gap="sm">
              {/* DESKTOP */}
              <Burger
                opened={desktopOpened}
                onClick={() => setDesktopOpened((current) => !current)}
                visibleFrom="sm"
                size="sm"
                color="var(--text)"
                aria-label="Toggle sidebar"
              />

              {/* MOBILE */}
              <Burger
                opened={mobileOpened}
                onClick={() => setMobileOpened((current) => !current)}
                hiddenFrom="sm"
                size="sm"
                color="var(--text)"
                aria-label="Toggle sidebar"
              />
            </Group>

            <Text
              size="sm"
              fw={600}
              className="
      !text-[var(--text)]
      tracking-tight
    "
            >
              {pageTitle}
            </Text>
          </Group>

          {/* FCV ACCENT */}

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

        {/* =================================================
            PAGE CONTENT
            ================================================= */}

        <Box className="p-4">
          <Outlet />
        </Box>
      </AppShell.Main>

      {/* =====================================================
          FLOATING CONTROLS
          ===================================================== */}

      <Box
        className="
          fixed
          bottom-6
          left-1/2
          z-50
          -translate-x-1/2
        "
      >
        <Group
          gap="xs"
          className="
            rounded-full
            border
            border-[var(--border)]
            bg-[var(--surface)]/95
            p-1.5
            shadow-lg
            shadow-[rgba(201,162,39,0.30)]
            backdrop-blur-md
            transition-colors
            duration-200
          "
        >
          <ThemeToggle />

          {showScrollTop && (
            <>
              <Box h={24} w={1} className="bg-[var(--border)]" />

              <Button
                onClick={scrollToTop}
                aria-label="Scroll to top"
                variant="subtle"
                className="
                  !h-10
                  !w-10
                  !min-w-0
                  !rounded-full
                  !p-0
                  !text-[var(--text)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:!bg-[var(--accent-bg)]
                  hover:!text-[var(--accent)]
                "
              >
                <ArrowUp size={19} />
              </Button>
            </>
          )}
        </Group>
      </Box>
    </AppShell>
  );
}
