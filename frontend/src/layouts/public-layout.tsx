import { useEffect, useState } from "react";

import { Box, Button, Divider, Group, Stack } from "@mantine/core";

import { ArrowUp } from "lucide-react";

import { Outlet } from "react-router-dom";

import PublicNavbar from "@/components/public-navbar";
import PublicFooter from "@/components/public-footer";
import ThemeToggle from "@/components/theme-toggle";
import ClockButton from "@/components/clock";

import { useVisitorTracking } from "@/lib/hook/visitor-tracker";

export default function PublicLayout() {
  // =====================================================
  // VISITOR TRACKING
  // =====================================================

  useVisitorTracking();

  // =====================================================
  // SCROLL STATE
  // =====================================================

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show scroll-to-top button
      setShowScrollTop(currentScrollY > 400);

      // Detect scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsScrollingDown(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =====================================================
  // SCROLL TO TOP
  // =====================================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box
      mih="100vh"
      className="
        flex
        min-h-screen
        flex-col
        bg-[var(--bg)]
        text-[var(--text)]
        transition-colors
        duration-300
      "
      style={{
        overflowX: "clip",
      }}
    >
      {/* =====================================================
          PUBLIC NAVBAR
      ===================================================== */}

      <PublicNavbar />

      {/* =====================================================
          PUBLIC PAGE CONTENT
      ===================================================== */}

      <Box
        component="main"
        className="
          flex-1
          bg-[var(--bg)]
          transition-colors
          duration-300
        "
      >
        <Outlet />
      </Box>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <PublicFooter />

      {/* =====================================================
          FLOATING CONTROLS
      ===================================================== */}

      <Box
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1000,
        }}
      >
        <Stack
          gap={0}
          className="
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface)]/90
            p-1.5
            shadow-lg
            shadow-[rgba(201,162,39,0.30)]
            backdrop-blur-md
            transition-all
            duration-300
          "
        >
          {/* =====================================================
              THEME + SCROLL TO TOP
          ===================================================== */}

          <Group gap="xs" justify="center" wrap="nowrap">
            <ThemeToggle />

            {showScrollTop && (
              <>
                <Box
                  h={24}
                  w={1}
                  className="bg-[var(--border)]"
                />

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

          <Divider my={6} />

          {/* =====================================================
              CLOCK
          ===================================================== */}

          <ClockButton compact={isScrollingDown} />
        </Stack>
      </Box>
    </Box>
  );
}