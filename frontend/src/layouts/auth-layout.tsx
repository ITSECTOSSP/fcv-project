import { Box, Group, Text } from "@mantine/core";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <Box
      mih="100vh"
      w="100%"
      className="
        relative
        flex
        min-h-screen
        flex-col
        overflow-hidden
        bg-[var(--bg)]
        text-[var(--text)]
        transition-colors
        duration-200
      "
    >
      {/* =====================================================
          DECORATIVE GOLD GLOW
          ===================================================== */}

      <Box
        pos="absolute"
        top={-180}
        right={-150}
        w={500}
        h={500}
        className="
          pointer-events-none
          rounded-full
          bg-[var(--accent-glow)]
          blur-3xl
        "
      />

      <Box
        pos="absolute"
        bottom={-200}
        left={-150}
        w={450}
        h={450}
        className="
          pointer-events-none
          rounded-full
          bg-[var(--accent-glow-soft)]
          blur-3xl
        "
      />

      {/* =====================================================
          AUTH PAGE
          ===================================================== */}

      <Box
        component="main"
        className="
          relative
          z-10
          flex
          min-h-screen
          flex-1
          items-center
          justify-center
        "
        px={{
          base: "md",
          sm: "xl",
        }}
        py={{
          base: 40,
          sm: 60,
        }}
      >
        <Outlet />
      </Box>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <Box
        component="footer"
        className="
          relative
          z-10
          border-t
          border-[var(--border)]
          bg-[var(--surface)]
        "
        px={{
          base: "md",
          sm: "xl",
        }}
        py="sm"
      >
        <Group justify="center" gap="xs">
          <Text size="xs" c="dimmed">
            FCV
          </Text>

          <Text size="xs" c="dimmed">
            •
          </Text>

          <Text size="xs" c="dimmed">
            Forward • Commitment • Vision
          </Text>
        </Group>
      </Box>
    </Box>
  );
}
