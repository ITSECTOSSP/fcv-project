import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Home,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      className="
        relative
        flex
        min-h-[calc(100vh-80px)]
        items-center
        justify-center
        overflow-hidden
        bg-[var(--bg)]
        px-6
        py-20
        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          DECORATIVE GLOW
      ===================================================== */}
      <Box
        pos="absolute"
        top={-180}
        right={-120}
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
          CONTENT
      ===================================================== */}
      <Stack
        align="center"
        gap="xl"
        ta="center"
        maw={680}
        pos="relative"
        style={{ zIndex: 1 }}
      >
        {/* 404 */}
        <Box
          className="
            select-none
            font-black
            leading-none
            tracking-[-0.08em]
            text-[var(--accent)]
          "
          style={{
            fontSize: "clamp(7rem, 20vw, 13rem)",
            lineHeight: 0.8,
          }}
        >
          404
        </Box>

        {/* Compass icon */}
        <Box
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            border
            border-[var(--accent-border)]
            bg-[var(--accent-bg)]
            text-[var(--accent)]
          "
        >
          <Compass size={30} />
        </Box>

        {/* Heading */}
        <Stack gap="sm" align="center">
          <Title
            order={1}
            fw={800}
            className="!text-[var(--text-h)]"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            }}
          >
            Page not found
          </Title>

          <Text
            size="lg"
            c="dimmed"
            lh={1.7}
            maw={560}
          >
            The page you're looking for doesn't exist, may have been moved,
            or is no longer available.
          </Text>
        </Stack>

        {/* Actions */}
        <Group
          gap="sm"
          justify="center"
          wrap="wrap"
        >
          <Button
            component={Link}
            to="/"
            size="lg"
            leftSection={<Home size={18} />}
            className="
              !bg-[var(--accent)]
              !text-[var(--accent-contrast)]
              shadow-lg
              shadow-[var(--accent-shadow)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:!brightness-95
              hover:!shadow-xl
            "
          >
            Back to Home
          </Button>

          <Button
            onClick={() => navigate(-1)}
            size="lg"
            variant="default"
            leftSection={<ArrowLeft size={18} />}
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
              !text-[var(--text-h)]
              transition
              hover:!border-[var(--accent-border)]
              hover:!bg-[var(--accent-bg)]
            "
          >
            Go Back
          </Button>
        </Group>

        {/* Helpful links */}
        <Group
          gap="lg"
          justify="center"
          mt="sm"
        >
          <Button
            component={Link}
            to="/solutions"
            variant="subtle"
            size="sm"
            rightSection={<ArrowRight size={14} />}
            className="
              !text-[var(--text-muted)]
              hover:!bg-[var(--accent-bg)]
              hover:!text-[var(--accent)]
            "
          >
            Explore Solutions
          </Button>

          <Button
            component={Link}
            to="/contact"
            variant="subtle"
            size="sm"
            rightSection={<ArrowRight size={14} />}
            className="
              !text-[var(--text-muted)]
              hover:!bg-[var(--accent-bg)]
              hover:!text-[var(--accent)]
            "
          >
            Contact Us
          </Button>
        </Group>

        {/* Footer message */}
        <Group
          gap="xs"
          mt="md"
          className="text-[var(--text-muted)]"
        >
          <Search size={14} />

          <Text size="xs" c="dimmed">
            Try returning to the homepage and continue exploring FCV.
          </Text>
        </Group>
      </Stack>
    </Box>
  );
}