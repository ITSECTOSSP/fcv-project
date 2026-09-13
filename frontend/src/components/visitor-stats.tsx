import {
  Badge,
  Box,
  Divider,
  Flex,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import {
  Activity,
  Clock,
  Eye,
  Globe,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react-motion";

import {
  useVisitorStatistics,
  type Visitor,
} from "@/lib/hook/visitor-stats";

const GOLD = "#C9A227";

/* =========================================================
   DEVICE ICON
   ========================================================= */

function getDeviceIcon(device: string | null) {
  switch (device) {
    case "Mobile":
      return (
        <Smartphone
          size={18}
          trigger="parent-hover"
          mode="signature"
        />
      );

    case "Tablet":
      return (
        <Tablet
          size={18}
          trigger="parent-hover"
          mode="signature"
        />
      );

    default:
      return (
        <Monitor
          size={18}
          trigger="parent-hover"
          mode="signature"
        />
      );
  }
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  badge: string;
}) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      data-motion-icon-group
      style={{
        transition:
          "transform 150ms ease, box-shadow 150ms ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "translateY(-2px)";

        event.currentTarget.style.boxShadow =
          "0 8px 24px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0)";

        event.currentTarget.style.boxShadow = "";
      }}
    >
      <Group justify="space-between" align="flex-start">
        <ThemeIcon
          size={42}
          radius="md"
          variant="light"
          style={{
            backgroundColor: `${GOLD}18`,
            color: GOLD,
          }}
        >
          {icon}
        </ThemeIcon>

        <Badge
          size="xs"
          variant="light"
          color="gray"
          radius="sm"
        >
          {badge}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mt="md">
        {label}
      </Text>

      <Text
        fw={700}
        size="28px"
        mt={3}
        style={{
          letterSpacing: "-0.5px",
        }}
      >
        {value.toLocaleString()}
      </Text>
    </Paper>
  );
}

/* =========================================================
   VISITOR ROW
   ========================================================= */

function VisitorRow({
  visitor,
  isNew = false,
}: {
  visitor: Visitor;
  isNew?: boolean;
}) {
  return (
    <Box
      px="md"
      py="sm"
      data-motion-icon-group
      style={{
        transition:
          "background-color 150ms ease",
        borderRadius: 8,
        backgroundColor: isNew
          ? `${GOLD}10`
          : undefined,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor =
          `${GOLD}08`;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor =
          isNew ? `${GOLD}10` : "";
      }}
    >
      <Flex
        gap="sm"
        align="flex-start"
        justify="space-between"
        wrap="nowrap"
      >
        {/* =================================================
            LEFT — VISITOR
        ================================================= */}

        <Group
          gap="sm"
          wrap="nowrap"
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <ThemeIcon
            size={38}
            radius="xl"
            variant="light"
            style={{
              backgroundColor: `${GOLD}18`,
              color: GOLD,
              flexShrink: 0,
            }}
          >
            {getDeviceIcon(visitor.device_type)}
          </ThemeIcon>

          <Box
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* LOCATION */}

            <Group
              gap={7}
              wrap="nowrap"
              style={{
                minWidth: 0,
              }}
            >
              <Text
                fw={600}
                size="sm"
                truncate
                style={{
                  maxWidth: "100%",
                }}
              >
                {visitor.city ||
                  visitor.region ||
                  visitor.country ||
                  "Unknown Visitor"}
              </Text>

              {visitor.country_code && (
                <Badge
                  size="xs"
                  variant="light"
                  color="gray"
                  radius="sm"
                  style={{
                    flexShrink: 0,
                  }}
                >
                  {visitor.country_code}
                </Badge>
              )}

              {isNew && (
                <Badge
                  size="xs"
                  variant="light"
                  color="yellow"
                  radius="sm"
                  style={{
                    flexShrink: 0,
                  }}
                >
                  NEW
                </Badge>
              )}
            </Group>

            {/* DEVICE DETAILS */}

            <Group
              gap={6}
              mt={3}
              wrap="nowrap"
              style={{
                minWidth: 0,
              }}
            >
              {visitor.device_type && (
                <Text
                  size="xs"
                  c="dimmed"
                  truncate
                >
                  {visitor.device_type}
                </Text>
              )}

              {visitor.browser && (
                <>
                  <Text size="xs" c="gray.5">
                    •
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                    truncate
                  >
                    {visitor.browser}
                  </Text>
                </>
              )}

              {visitor.operating_system && (
                <>
                  <Text size="xs" c="gray.5">
                    •
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                    truncate
                  >
                    {visitor.operating_system}
                  </Text>
                </>
              )}
            </Group>

            {/* PAGE */}

            {visitor.page && (
              <Group
                gap={5}
                mt={5}
                wrap="nowrap"
                style={{
                  minWidth: 0,
                }}
              >
                <MapPin
                  size={12}
                  trigger="parent-hover"
                  mode="signature"
                  style={{
                    color: GOLD,
                    flexShrink: 0,
                  }}
                />

                <Text
                  size="xs"
                  c="dimmed"
                  truncate
                  style={{
                    maxWidth: 220,
                  }}
                >
                  {visitor.page}
                </Text>
              </Group>
            )}
          </Box>
        </Group>

        {/* =================================================
            RIGHT — TIME
        ================================================= */}

        <Group
          gap={5}
          wrap="nowrap"
          style={{
            flexShrink: 0,
          }}
        >
          <Clock
            size={12}
            trigger="parent-hover"
            mode="signature"
            style={{
              color: GOLD,
            }}
          />

          <Text
            size="xs"
            c="dimmed"
            style={{
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(visitor.visited_at)}
          </Text>
        </Group>
      </Flex>
    </Box>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function VisitorStats() {
  const {
    stats,
    visitors,
    loading,
    error,
  } = useVisitorStatistics();

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Stack
        gap="lg"
        align="stretch"
        style={{
          minHeight: 320,
        }}
      >
        <Paper
          withBorder
          radius="lg"
          p="xl"
          style={{
            flex: 1,
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <Stack
            align="center"
            justify="center"
            gap="sm"
            ta="center"
          >
            {/* SPINNER */}

            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border:
                  "3px solid var(--accent-bg)",
                borderTopColor:
                  "var(--accent)",
                animation:
                  "visitorStatsSpin 0.9s linear infinite",
              }}
            />

            <Stack
              gap={2}
              align="center"
            >
              <Text
                fw={600}
                c="var(--text)"
              >
                Loading Visitor Analytics
              </Text>

              <Text
                size="sm"
                c="dimmed"
              >
                Gathering the latest visitor data...
              </Text>
            </Stack>
          </Stack>
        </Paper>

        <style>
          {`
            @keyframes visitorStatsSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </Stack>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !stats) {
    return (
      <Paper
        withBorder
        radius="lg"
        p="xl"
      >
        <Group>
          <ThemeIcon
            color="red"
            variant="light"
            size={44}
            radius="md"
          >
            <Users
              size={20}
              trigger="hover"
              mode="signature"
            />
          </ThemeIcon>

          <Box>
            <Text fw={600}>
              Unable to load visitor analytics
            </Text>

            <Text
              size="sm"
              c="dimmed"
              mt={3}
            >
              {error ||
                "Please try again later."}
            </Text>
          </Box>
        </Group>
      </Paper>
    );
  }

  /* =======================================================
     CONTENT
  ======================================================= */

  return (
    <Box
      maw={1400}
      mx="auto"
      w="100%"
    >
      <Stack gap="lg">

        {/* =================================================
            HEADER
        ================================================= */}

        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="md"
        >
          <Badge
            size="lg"
            radius="xl"
            variant="light"
            color="green"
            leftSection={
              <Activity
                size={13}
                trigger="hover"
                mode="signature"
              />
            }
          >
            Live Tracking
          </Badge>
        </Flex>

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
            lg: 3,
          }}
          spacing="lg"
          style={{
            alignItems: "stretch",
          }}
        >

          {/* =================================================
              COLUMN 1 — ALL-TIME TOTALS
          ================================================= */}

          <Stack gap="md">

            <Group
              justify="space-between"
              data-motion-icon-group
            >
              <Box>
                <Text
                  fw={600}
                  size="sm"
                >
                  Overview
                </Text>

                <Text
                  size="xs"
                  c="dimmed"
                  mt={2}
                >
                  Website traffic
                </Text>
              </Box>

              <Globe
                size={18}
                color={GOLD}
                trigger="parent-hover"
                mode="signature"
              />
            </Group>

            <StatCard
              icon={
                <Users
                  size={19}
                  trigger="parent-hover"
                  mode="signature"
                />
              }
              label="Unique Visitors"
              value={stats.unique_visitors}
              badge="ALL TIME"
            />

            <StatCard
              icon={
                <Eye
                  size={19}
                  trigger="parent-hover"
                  mode="signature"
                />
              }
              label="Total Visits"
              value={stats.total_visits}
              badge="ALL TIME"
            />

          </Stack>

          {/* =================================================
              COLUMN 2 — TODAY
          ================================================= */}

          <Stack gap="md">

            <Group
              justify="space-between"
              data-motion-icon-group
            >
              <Box>
                <Text
                  fw={600}
                  size="sm"
                >
                  Today
                </Text>

                <Text
                  size="xs"
                  c="dimmed"
                  mt={2}
                >
                  Today's website activity
                </Text>
              </Box>

              <Activity
                size={18}
                color={GOLD}
                trigger="parent-hover"
                mode="signature"
              />
            </Group>

            <StatCard
              icon={
                <Users
                  size={19}
                  trigger="parent-hover"
                  mode="signature"
                />
              }
              label="Today's Visitors"
              value={stats.today_unique}
              badge="TODAY"
            />

            <StatCard
              icon={
                <Eye
                  size={19}
                  trigger="parent-hover"
                  mode="signature"
                />
              }
              label="Today's Visits"
              value={stats.today_visits}
              badge="TODAY"
            />

          </Stack>

          {/* =================================================
              COLUMN 3 — RECENT VISITORS
          ================================================= */}

          <Paper
            withBorder
            radius="lg"
            p={0}
            style={{
              height: 330,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >

            {/* HEADER */}

            <Flex
              px="lg"
              py="md"
              justify="space-between"
              align="center"
              gap="sm"
              data-motion-icon-group
              style={{
                flexShrink: 0,
              }}
            >
              <Group gap="sm">

                <ThemeIcon
                  size={38}
                  radius="md"
                  variant="light"
                  style={{
                    backgroundColor: `${GOLD}18`,
                    color: GOLD,
                  }}
                >
                  <Activity
                    size={18}
                    trigger="parent-hover"
                    mode="signature"
                  />
                </ThemeIcon>

                <Box>
                  <Text fw={600}>
                    Recent Visitors
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                    mt={2}
                  >
                    Latest visitor activity
                  </Text>
                </Box>

              </Group>

              <Badge
                variant="light"
                color="green"
                radius="xl"
              >
                {visitors.length} Recent
              </Badge>
            </Flex>

            <Divider />

            {/* =================================================
                SCROLLABLE VISITOR LIST
            ================================================= */}

            <ScrollArea
              style={{
                flex: 1,
                minHeight: 0,
              }}
              type="auto"
              offsetScrollbars
              scrollbarSize={6}
            >
              {visitors.length === 0 ? (
                <Stack
                  align="center"
                  justify="center"
                  py={40}
                  gap="xs"
                >
                  <ThemeIcon
                    size={52}
                    radius="xl"
                    variant="light"
                    color="gray"
                  >
                    <Users
                      size={23}
                      trigger="hover"
                      mode="signature"
                    />
                  </ThemeIcon>

                  <Text
                    fw={600}
                    mt="sm"
                  >
                    No visitors yet
                  </Text>

                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Visitor activity will appear here.
                  </Text>
                </Stack>
              ) : (
                <Stack
                  gap={3}
                  p="sm"
                >
                  {visitors.map(
                    (visitor) => (
                      <VisitorRow
                        key={visitor.id}
                        visitor={visitor}
                      />
                    )
                  )}
                </Stack>
              )}
            </ScrollArea>

            {/* =================================================
                FOOTER
            ================================================= */}

            {visitors.length > 0 && (
              <>
                <Divider />

                <Group
                  justify="space-between"
                  px="lg"
                  py="sm"
                  style={{
                    flexShrink: 0,
                  }}
                >
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Showing latest{" "}

                    <Text
                      component="span"
                      fw={600}
                      c="dark"
                    >
                      {visitors.length}
                    </Text>{" "}

                    visitors
                  </Text>

                  <Group gap={5}>
                    <Box
                      w={7}
                      h={7}
                      style={{
                        borderRadius: "50%",
                        backgroundColor:
                          "#40c057",
                      }}
                    />

                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      Realtime
                    </Text>
                  </Group>
                </Group>
              </>
            )}

          </Paper>

        </SimpleGrid>
      </Stack>
    </Box>
  );
}