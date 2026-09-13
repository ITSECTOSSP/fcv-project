import { useEffect, useState } from "react";
import { Box, Group, Stack, Text } from "@mantine/core";
import { MapPin } from "lucide-react";

interface ClockButtonProps {
  compact?: boolean;
}

export default function ClockButton({
  compact = false,
}: ClockButtonProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // =====================================================
  // ANALOG CLOCK ANGLES
  // =====================================================

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;

  // =====================================================
  // DIGITAL TIME
  // =====================================================

  const time = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  // =====================================================
  // DATE
  // =====================================================

  const date = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  return (
    <Box
      px={compact ? 0 : "sm"}
      py={compact ? 4 : "md"}
      style={{
        width: compact ? "auto" : 250,
        maxWidth: "100%",
        boxSizing: "border-box",
        transition: "all 300ms ease",
      }}
    >
      {/* =====================================================
          FULL CLOCK
      ===================================================== */}

      <Box
        style={{
          display: compact ? "none" : "block",
        }}
      >
        <Group
          gap="md"
          align="center"
          justify="center"
          wrap="nowrap"
        >
          {/* =================================================
              ANALOG CLOCK
          ================================================= */}

          <Box
            style={{
              position: "relative",
              width: 68,
              height: 68,
              minWidth: 68,
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              backgroundColor: "var(--surface)",
              boxShadow: "0 0 0 4px var(--accent-bg)",
              flexShrink: 0,
            }}
          >
            {/* Clock markers */}

            {[...Array(12)].map((_, index) => {
              const angle = index * 30;
              const isMajor = index % 3 === 0;

              return (
                <Box
                  key={index}
                  style={{
                    position: "absolute",
                    width: isMajor ? 3 : 2,
                    height: isMajor ? 6 : 4,
                    backgroundColor: "var(--accent)",
                    borderRadius: 2,
                    left: "50%",
                    top: 4,
                    transformOrigin: "50% 30px",
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                  }}
                />
              );
            })}

            {/* Hour hand */}

            <Box
              style={{
                position: "absolute",
                width: 3,
                height: 20,
                left: "50%",
                top: "50%",
                borderRadius: 3,
                backgroundColor: "var(--text)",
                transformOrigin: "50% 100%",
                transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
              }}
            />

            {/* Minute hand */}

            <Box
              style={{
                position: "absolute",
                width: 2,
                height: 26,
                left: "50%",
                top: "50%",
                borderRadius: 3,
                backgroundColor: "var(--text)",
                transformOrigin: "50% 100%",
                transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
              }}
            />

            {/* Second hand */}

            <Box
              style={{
                position: "absolute",
                width: 1,
                height: 29,
                left: "50%",
                top: "50%",
                borderRadius: 3,
                backgroundColor: "var(--accent)",
                transformOrigin: "50% 100%",
                transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
                transition: "transform 150ms linear",
              }}
            />

            {/* Center */}

            <Box
              style={{
                position: "absolute",
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 5,
              }}
            />
          </Box>

          {/* =================================================
              DIGITAL CLOCK
          ================================================= */}

          <Stack
            gap={3}
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Text
              size="xs"
              fw={600}
              c="dimmed"
            >
              Current Time
            </Text>

            <Text
              fw={700}
              style={{
                fontSize: "1.35rem",
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                color: "var(--text)",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {time}
            </Text>

            <Text
              size="xs"
              c="dimmed"
              mt={2}
              style={{
                lineHeight: 1.25,
                whiteSpace: "normal",
                overflowWrap: "break-word",
              }}
            >
              {date}
            </Text>
          </Stack>
        </Group>

        {/* =================================================
            LOCATION
        ================================================= */}

        <Group
          justify="center"
          gap={4}
          mt="sm"
          wrap="nowrap"
        >
          <MapPin
            size={11}
            style={{
              color: "var(--accent)",
              flexShrink: 0,
            }}
          />

          <Text
            size="xs"
            c="dimmed"
            style={{
              whiteSpace: "nowrap",
            }}
          >
            Quezon City, Philippines
          </Text>
        </Group>
      </Box>

      {/* =====================================================
          COMPACT CLOCK
      ===================================================== */}

      <Box
        style={{
          display: compact ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 10px",
          minWidth: 105,
          borderRadius: 999,
          backgroundColor: "var(--accent-bg)",
          border: "1px solid var(--border)",
        }}
      >
        <Text
          size="sm"
          fw={700}
          style={{
            color: "var(--accent)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            letterSpacing: "-0.02em",
          }}
        >
          {time}
        </Text>
      </Box>
    </Box>
  );
}