import {
  Activity,
  Bell,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("auth_user") || "null",
  );

  const firstName =
    user?.name?.split(" ")[0] || "User";

  return (
    <Box
      className="
        min-h-full
        bg-[var(--bg)]
        text-[var(--text)]
        transition-colors
        duration-300
      "
    >
      <Stack
        gap="xl"
        p={{
          base: "md",
          sm: "xl",
        }}
        maw={1600}
        mx="auto"
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <Group
          justify="space-between"
          align="flex-end"
          gap="md"
          wrap="wrap"
        >
          <Stack gap={6}>
            <Group gap="sm">
              <Badge
                variant="light"
                radius="xl"
                className="
                  !border
                  !border-[var(--accent-border)]
                  !bg-[var(--accent-bg)]
                  !text-[var(--accent)]
                "
              >
                FCV SYSTEM
              </Badge>

              <Group gap={5}>
                <Activity
                  size={13}
                  className="text-[var(--accent)]"
                />

                <Text size="xs" c="dimmed">
                  System Overview
                </Text>
              </Group>
            </Group>

            <Title
              order={1}
              fw={800}
              className="!text-[var(--text-h)]"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              }}
            >
              Welcome back,{" "}
              <Text
                component="span"
                inherit
                className="!text-[var(--accent)]"
              >
                {firstName}
              </Text>
            </Title>

            <Text
              size="sm"
              c="dimmed"
              maw={650}
            >
              Here's an overview of your FCV workspace and
              the latest system activity.
            </Text>
          </Stack>

          {/* Header action */}
          <Button
            component={Link}
            to="/settings/profile"
            variant="default"
            leftSection={<UserRound size={17} />}
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
              !text-[var(--text-h)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:!border-[var(--accent-border)]
              hover:!bg-[var(--accent-bg)]
              hover:!text-[var(--accent)]
            "
          >
            My Profile
          </Button>
        </Group>

        {/* =====================================================
            STATISTICS
        ===================================================== */}
        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
            lg: 4,
          }}
          spacing="lg"
        >
          <StatCard
            icon={<FileText size={21} />}
            label="Documents"
            value="0"
            description="Total documents"
          />

          <StatCard
            icon={<Activity size={21} />}
            label="Pending"
            value="0"
            description="Awaiting action"
          />

          <StatCard
            icon={<Bell size={21} />}
            label="Notifications"
            value="0"
            description="Unread notifications"
          />

          <StatCard
            icon={<Users size={21} />}
            label="Users"
            value="0"
            description="Active system users"
          />
        </SimpleGrid>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}
        <SimpleGrid
          cols={{
            base: 1,
            lg: 2,
          }}
          spacing="lg"
        >
          {/* =================================================
              QUICK ACTIONS
          ================================================= */}
          <Card
            withBorder
            radius="lg"
            padding="xl"
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
              transition-colors
              duration-300
            "
          >
            <Stack gap="lg">

              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon
                    size={42}
                    radius="md"
                    variant="light"
                    className="
                      !border
                      !border-[var(--accent-border)]
                      !bg-[var(--accent-bg)]
                      !text-[var(--accent)]
                    "
                  >
                    <LayoutDashboard size={20} />
                  </ThemeIcon>

                  <Stack gap={2}>
                    <Text
                      fw={700}
                      className="!text-[var(--text-h)]"
                    >
                      Quick Actions
                    </Text>

                    <Text size="xs" c="dimmed">
                      Frequently used system actions
                    </Text>
                  </Stack>
                </Group>
              </Group>

              <Divider className="!border-[var(--border)]" />

              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                }}
                spacing="sm"
              >
                <ActionButton
                  icon={<Plus size={17} />}
                  title="Create Document"
                  description="Start a new document"
                />

                <ActionButton
                  icon={<FileText size={17} />}
                  title="View Documents"
                  description="Browse your records"
                />

                <ActionButton
                  icon={<Bell size={17} />}
                  title="Notifications"
                  description="View system updates"
                />

                <ActionButton
                  icon={<Settings size={17} />}
                  title="Settings"
                  description="Manage your account"
                />
              </SimpleGrid>

            </Stack>
          </Card>

          {/* =================================================
              SYSTEM STATUS
          ================================================= */}
          <Card
            withBorder
            radius="lg"
            padding="xl"
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
              transition-colors
              duration-300
            "
          >
            <Stack gap="lg">

              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon
                    size={42}
                    radius="md"
                    variant="light"
                    className="
                      !border
                      !border-[var(--accent-border)]
                      !bg-[var(--accent-bg)]
                      !text-[var(--accent)]
                    "
                  >
                    <ShieldCheck size={20} />
                  </ThemeIcon>

                  <Stack gap={2}>
                    <Text
                      fw={700}
                      className="!text-[var(--text-h)]"
                    >
                      System Status
                    </Text>

                    <Text size="xs" c="dimmed">
                      Current FCV platform status
                    </Text>
                  </Stack>
                </Group>

                <Badge
                  variant="light"
                  radius="xl"
                  className="
                    !border
                    !border-[var(--accent-border)]
                    !bg-[var(--accent-bg)]
                    !text-[var(--accent)]
                  "
                >
                  Operational
                </Badge>
              </Group>

              <Divider className="!border-[var(--border)]" />

              <Stack gap="md">

                <StatusRow
                  label="Authentication Service"
                  status="Operational"
                />

                <StatusRow
                  label="Document Services"
                  status="Operational"
                />

                <StatusRow
                  label="Notification Service"
                  status="Operational"
                />

                <StatusRow
                  label="Database"
                  status="Operational"
                />

              </Stack>

            </Stack>
          </Card>
        </SimpleGrid>

        {/* =====================================================
            FCV WELCOME / OVERVIEW
        ===================================================== */}
        <Card
          withBorder
          radius="lg"
          padding="xl"
          className="
            relative
            overflow-hidden
            !border-[var(--border)]
            !bg-[var(--surface)]
            transition-colors
            duration-300
          "
        >
          {/* Decorative glow */}
          <Box
            pos="absolute"
            top={-100}
            right={-100}
            w={260}
            h={260}
            className="
              pointer-events-none
              rounded-full
              bg-[var(--accent-glow)]
              blur-3xl
            "
          />

          <Box
            pos="relative"
            style={{
              zIndex: 1,
            }}
          >
            <SimpleGrid
              cols={{
                base: 1,
                md: 2,
              }}
              spacing={{
                base: "xl",
                md: 60,
              }}
              verticalSpacing="xl"
            >
              {/* Left */}
              <Stack
                gap="md"
                justify="center"
              >
                <Badge
                  variant="light"
                  size="md"
                  radius="xl"
                  w="fit-content"
                  className="
                    !border
                    !border-[var(--accent-border)]
                    !bg-[var(--accent-bg)]
                    !text-[var(--accent)]
                  "
                >
                  FORWARD • COMMITMENT • VISION
                </Badge>

                <Title
                  order={2}
                  fw={800}
                  className="!text-[var(--text-h)]"
                >
                  Your digital workspace for
                  <Text
                    component="span"
                    inherit
                    className="!text-[var(--accent)]"
                  >
                    {" "}better public service.
                  </Text>
                </Title>

                <Text
                  size="sm"
                  c="dimmed"
                  lh={1.75}
                  maw={600}
                >
                  FCV brings together connected digital systems,
                  streamlined workflows, and secure information
                  management to support a more efficient and
                  responsive office.
                </Text>

                <Group gap="sm" mt="sm">
                  <Button
                    component={Link}
                    to="/settings/profile"
                    variant="default"
                    leftSection={<UserRound size={17} />}
                    className="
                      !border-[var(--border)]
                      !bg-[var(--surface)]
                      !text-[var(--text-h)]
                      hover:!border-[var(--accent-border)]
                      hover:!bg-[var(--accent-bg)]
                      hover:!text-[var(--accent)]
                    "
                  >
                    Manage Profile
                  </Button>
                </Group>
              </Stack>

              {/* Right */}
              <Paper
                radius="lg"
                p="xl"
                className="
                  !border
                  !border-[var(--border)]
                  !bg-[var(--surface-soft)]
                "
              >
                <Stack gap="lg">
                  <Group gap="sm">
                    <ThemeIcon
                      size={42}
                      radius="md"
                      variant="light"
                      className="
                        !border
                        !border-[var(--accent-border)]
                        !bg-[var(--accent-bg)]
                        !text-[var(--accent)]
                      "
                    >
                      <ShieldCheck size={20} />
                    </ThemeIcon>

                    <Stack gap={2}>
                      <Text
                        fw={700}
                        className="!text-[var(--text-h)]"
                      >
                        Built for Progress
                      </Text>

                      <Text size="xs" c="dimmed">
                        Designed around the FCV principles
                      </Text>
                    </Stack>
                  </Group>

                  <Divider className="!border-[var(--border)]" />

                  <Stack gap="md">
                    <Principle
                      number="01"
                      title="Forward"
                      description="Embrace innovation and continuously improve digital workflows."
                    />

                    <Principle
                      number="02"
                      title="Commitment"
                      description="Strengthen service delivery through reliable and accountable systems."
                    />

                    <Principle
                      number="03"
                      title="Vision"
                      description="Build a connected digital environment prepared for tomorrow."
                    />
                  </Stack>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Box>
        </Card>

      </Stack>
    </Box>
  );
}


/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card
      withBorder
      radius="lg"
      padding="lg"
      className="
        relative
        overflow-hidden
        !border-[var(--border)]
        !bg-[var(--surface)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:!border-[var(--accent-border)]
        hover:!shadow-lg
      "
    >
      <Stack gap="md">

        <Group justify="space-between">
          <ThemeIcon
            size={44}
            radius="md"
            variant="light"
            className="
              !border
              !border-[var(--accent-border)]
              !bg-[var(--accent-bg)]
              !text-[var(--accent)]
            "
          >
            {icon}
          </ThemeIcon>

          <Text
            size="xs"
            fw={600}
            c="dimmed"
          >
            FCV
          </Text>
        </Group>

        <Stack gap={3}>
          <Text
            size="sm"
            c="dimmed"
          >
            {label}
          </Text>

          <Text
            fw={800}
            className="!text-[var(--text-h)]"
            style={{
              fontSize: "2rem",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </Text>

          <Text
            size="xs"
            c="dimmed"
            mt={3}
          >
            {description}
          </Text>
        </Stack>

      </Stack>
    </Card>
  );
}


/* =============================================================
   QUICK ACTION
============================================================= */

function ActionButton({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Button
      component={Link}
      to="#"
      variant="default"
      h="auto"
      p="md"
      justify="flex-start"
      className="
        !border-[var(--border)]
        !bg-[var(--surface)]
        !text-[var(--text)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:!border-[var(--accent-border)]
        hover:!bg-[var(--accent-bg)]
      "
    >
      <Group
        gap="sm"
        wrap="nowrap"
      >
        <ThemeIcon
          size={36}
          radius="md"
          variant="light"
          className="
            !bg-[var(--accent-bg)]
            !text-[var(--accent)]
          "
        >
          {icon}
        </ThemeIcon>

        <Stack gap={1}>
          <Text
            size="sm"
            fw={600}
            className="!text-[var(--text-h)]"
          >
            {title}
          </Text>

          <Text
            size="xs"
            c="dimmed"
          >
            {description}
          </Text>
        </Stack>
      </Group>
    </Button>
  );
}


/* =============================================================
   STATUS ROW
============================================================= */

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <Group
      justify="space-between"
      wrap="nowrap"
    >
      <Group
        gap="sm"
        wrap="nowrap"
      >
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            boxShadow: "0 0 0 4px var(--accent-bg)",
            flexShrink: 0,
          }}
        />

        <Text
          size="sm"
          className="!text-[var(--text)]"
        >
          {label}
        </Text>
      </Group>

      <Text
        size="xs"
        fw={600}
        className="!text-[var(--accent)]"
      >
        {status}
      </Text>
    </Group>
  );
}


/* =============================================================
   FCV PRINCIPLE
============================================================= */

function Principle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Group
      align="flex-start"
      gap="md"
      wrap="nowrap"
    >
      <Text
        size="xs"
        fw={800}
        className="!text-[var(--accent)]"
        style={{
          minWidth: 24,
        }}
      >
        {number}
      </Text>

      <Stack gap={2}>
        <Text
          size="sm"
          fw={700}
          className="!text-[var(--text-h)]"
        >
          {title}
        </Text>

        <Text
          size="xs"
          c="dimmed"
          lh={1.5}
        >
          {description}
        </Text>
      </Stack>
    </Group>
  );
}