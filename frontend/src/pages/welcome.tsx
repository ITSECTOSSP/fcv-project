import { useEffect, useRef, useState } from "react";

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
import loginScreenshot from "@/assets/screenshotb.png";
import { ArrowRight, FileText, ShieldCheck, Users } from "lucide-react-motion";

import VisitorStats from "@/components/visitor-stats";

import { Link } from "react-router-dom";

const GOLD = "#C9A227";

/* =============================================================
   REVEAL
============================================================= */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`
        transition-all
        duration-700
        ease-out
        ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        ${className}
      `}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* =============================================================
   WELCOME
============================================================= */

export default function Welcome() {
  return (
    <Box className="overflow-x-hidden bg-[var(--bg)]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <Box
        className="
          relative
          overflow-hidden
          bg-[var(--bg)]
          transition-colors
          duration-300
        "
      >
        {/* Decorative glow */}

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

        <Box
          px={{
            base: "md",
            sm: "xl",
            lg: 80,
          }}
          py={{
            base: 70,
            sm: 90,
            lg: 120,
          }}
          pos="relative"
        >
          <SimpleGrid
            cols={{
              base: 1,
              lg: 2,
            }}
            spacing={{
              base: 70,
              lg: 100,
            }}
            verticalSpacing={{
              base: 70,
              lg: 90,
            }}
          >
            {/* =================================================
    HERO CONTENT
================================================= */}
            <Stack
              justify="center"
              gap="xl"
              py={{
                base: 10,
                lg: 30,
              }}
              className="relative"
            >
              {/* LOGIN SCREENSHOT BACKGROUND */}
              <Reveal>
                <Box
                  pos="absolute"
                  top="50%"
                  left={{
                    base: "50%",
                    lg: "65%",
                  }}
                  style={{
                    transform: "translate(10%, -30%)",
                  }}
                  className="
     relative
              rotate-[-3deg]
              overflow-hidden
              rounded-[38px]
              border
              border-[var(--accent)]
              border-opacity-10
              bg-[var(--surface)]
              shadow-[0_30px_100px_rgba(0,0,0,0.18)]
    "
                >
                  {/* Screenshot */}
                  <Box
                    component="img"
                    src={loginScreenshot}
                    alt=""
                    aria-hidden="true"
                    className="
        block
        h-auto
        w-50
        rounded-[38px]
        object-cover
        opacity-[0.90]
      "
                  />

                  {/* Fade / readability overlay */}
                  <Box
                    pos="absolute"
                    inset={0}
                    className="
        rounded-[28px]
        bg-gradient-to-r
        from-[var(--bg)]
        via-[var(--bg)]/5
        to-transparent
      "
                  />

                  {/* Bottom fade */}
                  <Box
                    pos="absolute"
                    inset={0}
                    className="
        rounded-[28px]
        bg-gradient-to-t
        from-[var(--bg)]
        via-transparent
        to-transparent
      "
                  />
                </Box>
              </Reveal>

              {/* HERO TEXT */}
              <Box className="relative z-10">
                <Reveal>
                  <Badge
                    variant="light"
                    size="lg"
                    radius="xl"
                    w="fit-content"
                    className="
          !border
          !border-[var(--accent-border)]
          !bg-[var(--accent-bg)]
          !text-[var(--accent)]
        "
                  >
                    Forward • Commitment • Vision
                  </Badge>
                </Reveal>

                <Reveal>
                  <Stack gap="lg" mt="xl">
                    <Title
                      order={1}
                      fw={800}
                      lh={1.05}
                      className="
            !text-[var(--text-h)]
            tracking-tight
          "
                      style={{
                        fontSize: "clamp(2.5rem, 5vw, 5rem)",
                      }}
                    >
                      Moving{" "}
                      <Text
                        component="span"
                        inherit
                        className="!text-[var(--accent)]"
                      >
                        public service
                      </Text>{" "}
                      forward.
                    </Title>

                    <Text size="lg" c="dimmed" lh={1.75} maw={680}>
                      FCV brings together digital systems, streamlined
                      workflows, and secure information management to move
                      public service forward.
                    </Text>
                  </Stack>
                </Reveal>
              </Box>

              {/* ACTIONS */}
              <Reveal>
                <Stack gap="md" className="relative z-10">
                  <Group gap="sm" wrap="wrap">
                    <Button
                      component={Link}
                      to="/login"
                      size="lg"
                      data-motion-icon-group
                      rightSection={
                        <ArrowRight size={18} trigger="parent-hover" />
                      }
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
                      Access the System
                    </Button>

                    <Button
                      component={Link}
                      to="/register"
                      size="lg"
                      variant="default"
                      className="
            !border-[var(--border)]
            !bg-[var(--surface)]
            !text-[var(--text-h)]
            transition
            hover:!border-[var(--accent-border)]
            hover:!bg-[var(--accent-bg)]
          "
                    >
                      Create an Account
                    </Button>
                  </Group>

                  <Group gap="xs" data-motion-icon-group w="fit-content">
                    <ShieldCheck
                      size={15}
                      trigger="parent-hover"
                      className="text-[var(--accent)]"
                    />

                    <Text size="xs" c="dimmed">
                      Secure access for authorized personnel.
                    </Text>
                  </Group>
                </Stack>
              </Reveal>
            </Stack>
            {/* =================================================
                HERO BRAND
            ================================================= */}

            <Box
              className="
                relative
                flex
                min-h-[460px]
                items-center
                justify-center
              "
            >
              {/* Glow */}

              <Box
                pos="absolute"
                top={-70}
                right={-50}
                w={300}
                h={300}
                className="
                  pointer-events-none
                  rounded-full
                  bg-[var(--accent-glow)]
                  blur-3xl
                "
              />

              <Box
                pos="absolute"
                bottom={-50}
                left={-40}
                w={250}
                h={250}
                className="
                  pointer-events-none
                  rounded-full
                  bg-[var(--accent-glow-soft)]
                  blur-3xl
                "
              />

              {/* BRAND CARD */}

              <Card
                withBorder
                radius="xl"
                padding="xl"
                shadow="xl"
                className="
                  relative
                  z-10
                  w-full
                  max-w-[620px]
                  !border-[var(--border)]
                  !bg-[var(--surface)]
                  p-6
                  sm:p-8
                  lg:p-10
                  backdrop-blur-xl
                  transition-colors
                  duration-300
                "
              >
                <Reveal>
                  <Stack align="center" gap="xl">
                    {/* Brand */}

                    <Box
                      component="img"
                      src="/brand.svg"
                      alt="FCV — Forward Commitment Vision"
                      className="
                        h-auto
                        max-h-[240px]
                        w-full
                        max-w-[460px]
                        object-contain
                      "
                    />

                    <Divider
                      className="
                        w-full
                        !border-[var(--border)]
                      "
                    />

                    {/* Brand message */}

                    <Text size="sm" ta="center" c="dimmed" maw={450} lh={1.7}>
                      Moving forward through innovation, strengthening
                      commitment to service, and pursuing a clear vision for a
                      more connected and efficient office.
                    </Text>

                    {/* FCV pillars */}

                    <SimpleGrid cols={3} spacing="md" w="100%">
                      <BrandPillar title="FORWARD" description="Innovation" />

                      <BrandPillar title="COMMITMENT" description="Service" />

                      <BrandPillar title="VISION" description="Progress" />
                    </SimpleGrid>
                  </Stack>
                </Reveal>
              </Card>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>

      {/* =====================================================
          VISITOR ANALYTICS
      ===================================================== */}

      <Box
        className="
          border-t
          border-[var(--border)]
          bg-[var(--surface)]
          transition-colors
          duration-300
        "
        px={{
          base: "md",
          sm: "xl",
          lg: 80,
        }}
        py={{
          base: 60,
          sm: 75,
          lg: 90,
        }}
      >
        <Stack gap="xl" maw={1500} mx="auto">
          {/* =================================================
              GROUP IS THE MOTION PARENT
          ================================================= */}

          <Group
            gap="sm"
            data-motion-icon-group
            w="fit-content"
            className="cursor-default"
          >
            <ThemeIcon
              size={42}
              radius="md"
              variant="light"
              style={{
                backgroundColor: `${GOLD}18`,
                color: GOLD,
              }}
            >
              <Users size={20} color={GOLD} trigger="parent-hover" />
            </ThemeIcon>

            <Box>
              <Title order={3}>Visitor Analytics</Title>

              <Text size="sm" c="dimmed" mt={2}>
                Monitor visitors accessing the FCV website.
              </Text>
            </Box>
          </Group>

          <VisitorStats />
        </Stack>
      </Box>

      {/* =====================================================
          DIGITAL TRANSFORMATION
      ===================================================== */}

      <Box
        className="
          border-t
          border-[var(--border)]
          bg-[var(--bg)]
          transition-colors
          duration-300
        "
        px={{
          base: "md",
          sm: "xl",
          lg: 80,
        }}
        py={{
          base: 70,
          sm: 90,
          md: 110,
        }}
      >
        <Stack align="center" gap="md" maw={850} mx="auto">
          <Reveal>
            <Badge
              variant="light"
              size="md"
              className="
                !border
                !border-[var(--accent-border)]
                !bg-[var(--accent-bg)]
                !text-[var(--accent)]
              "
            >
              MOVING FORWARD
            </Badge>
          </Reveal>

          <Reveal>
            <Title
              order={2}
              ta="center"
              fw={800}
              lh={1.15}
              className="!text-[var(--text-h)]"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              }}
            >
              A digital environment built to move the office forward
            </Title>

            <Text ta="center" c="dimmed" lh={1.75} maw={760}>
              FCV supports the continuous improvement of office operations
              through digital transformation, secure systems, and connected
              workflows.
            </Text>
          </Reveal>
        </Stack>

        {/* =================================================
            FEATURE CARDS
        ================================================= */}

        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
            lg: 3,
          }}
          spacing="xl"
          mt={{
            base: 45,
            md: 65,
          }}
          maw={1250}
          mx="auto"
        >
          <Reveal>
            <FeatureCard
              icon={<FileText size={25} trigger="parent-hover" />}
              title="Forward"
              description="Embrace digital transformation through modern tools, streamlined records, and continuously improving office processes."
            />
          </Reveal>

          <Reveal>
            <FeatureCard
              icon={<Users size={25} trigger="parent-hover" />}
              title="Commitment"
              description="Strengthen service delivery through dependable workflows, collaboration, accountability, and efficient operations."
            />
          </Reveal>

          <Reveal>
            <FeatureCard
              icon={<ShieldCheck size={25} trigger="parent-hover" />}
              title="Vision"
              description="Pursue a connected and secure digital environment that prepares the office for the needs of tomorrow."
            />
          </Reveal>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

/* =============================================================
   FCV BRAND PILLAR
============================================================= */

function BrandPillar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Paper
      p="sm"
      radius="md"
      className="
        border
        !border-[var(--border)]
        !bg-[var(--surface-soft)]
        text-center
        transition
        duration-200
        hover:!border-[var(--accent-border)]
        hover:shadow-sm
      "
    >
      <Stack align="center" gap={3}>
        <Text size="xs" fw={800} className="!text-[var(--accent)]">
          {title}
        </Text>

        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}

/* =============================================================
   FEATURE CARD
============================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card
      withBorder
      radius="lg"
      padding="xl"
      shadow="sm"
      data-motion-icon-group
      className="
        group
        h-full
        !border-[var(--border)]
        !bg-[var(--surface)]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:!border-[var(--accent-border)]
        hover:!shadow-lg
      "
    >
      <Stack gap="md" h="100%">
        <ThemeIcon
          size={52}
          radius="md"
          variant="light"
          className="
            !border
            !border-[var(--accent-border)]
            !bg-[var(--accent-bg)]
            !text-[var(--accent)]
            transition-all
            duration-200
          "
        >
          {icon}
        </ThemeIcon>

        <Text fw={700} size="lg" className="!text-[var(--text-h)]">
          {title}
        </Text>

        <Text size="sm" c="dimmed" lh={1.7}>
          {description}
        </Text>
      </Stack>
    </Card>
  );
}
