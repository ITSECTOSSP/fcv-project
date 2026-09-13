import { useEffect, useRef, useState } from "react";

import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Group,
} from "@mantine/core";

import {
  ArrowRight as ArrowRightMotion,
  Eye as EyeMotion,
  Landmark as LandmarkMotion,
  ShieldCheck as ShieldCheckMotion,
  Target as TargetMotion,
  Users as UsersMotion,
} from "lucide-react-motion";
import dashboardScreenshot from "@/assets/screenshota.png";
import { Link } from "react-router-dom";

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

    return () => observer.disconnect();
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

const values = [
  {
    icon: TargetMotion,
    title: "Forward",
    description:
      "Embracing innovation and continuously improving how information, services, and digital resources are delivered to the public.",
  },
  {
    icon: ShieldCheckMotion,
    title: "Commitment",
    description:
      "Maintaining a strong commitment to transparency, accessibility, accountability, and service excellence.",
  },
  {
    icon: EyeMotion,
    title: "Vision",
    description:
      "Building a connected digital experience where information is accessible, understandable, and useful to everyone.",
  },
];

const features = [
  {
    icon: LandmarkMotion,
    title: "Accessible Information",
    description:
      "Making important public information easier to discover, understand, and access through a centralized digital platform.",
  },
  {
    icon: UsersMotion,
    title: "People-Centered Services",
    description:
      "Designing digital services around the needs of citizens, employees, and stakeholders.",
  },
  {
    icon: ShieldCheckMotion,
    title: "Transparency & Trust",
    description:
      "Supporting transparent access to information while promoting responsible and secure digital service delivery.",
  },
];

export default function About() {
  return (
    <Box
      className="
        overflow-hidden
        bg-[var(--bg)]
        text-[var(--text)]
      "
    >
      {/* =========================================================
          HERO
      ========================================================= */}
      <Box
        className="
          relative
          flex
          min-h-[520px]
          items-center
          overflow-hidden
          border-b
          border-[var(--border)]
        "
      >
        <Box
          className="
            pointer-events-none
            absolute
            -right-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-[var(--accent)]
            opacity-[0.06]
            blur-3xl
          "
        />

        <Box
          className="
            pointer-events-none
            absolute
            -bottom-48
            -left-40
            h-[450px]
            w-[450px]
            rounded-full
            bg-[var(--accent)]
            opacity-[0.04]
            blur-3xl
          "
        />

        <Container size="xl" py={90} className="relative z-10">
          <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing={{ base: 40, md: 55 }}
            verticalSpacing={50}
            className="items-center"
          >
            {/* HERO CONTENT */}
            <Reveal>
              <Stack gap="lg" maw={750}>
                <Text
                  size="sm"
                  fw={700}
                  className="
                    uppercase
                    tracking-[0.25em]
                    !text-[var(--accent)]
                  "
                >
                  About FCV
                </Text>

                <Title
                  order={1}
                  className="
                    !text-4xl
                    !font-extrabold
                    !leading-tight
                    !text-[var(--text-h)]
                    sm:!text-5xl
                    lg:!text-6xl
                  "
                >
                  Forward.
                  <br />
                  Commitment.
                  <br />
                  Vision.
                </Title>

                <Text size="lg" lh={1.8} maw={700} c="dimmed">
                  FCV is a digital platform built around a simple idea: make
                  information, services, and resources more accessible through a
                  connected and modern digital experience.
                </Text>

                {/* Parent-hover motion */}
                <Box
                  component={Link}
                  to="/"
                  data-motion-icon-group
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    !text-[var(--accent)]
                    no-underline
                  "
                >
                  <Text fw={600}>Explore FCV</Text>

                  <ArrowRightMotion size={18} trigger="parent-hover" />
                </Box>
              </Stack>
            </Reveal>

            {/* HERO LOGO */}
            <Reveal delay={150}>
              <Box
                className="
                  flex
                  items-center
                  justify-start
                  md:justify-start
                  md:pl-4
                  lg:pl-8
                "
              >
                <Box
                  component="img"
                  src="/icons.png"
                  alt="FCV — Forward • Commitment • Vision"
                  className="
                    h-52
                    w-auto
                    object-contain
                    drop-shadow-sm
                    transition-transform
                    duration-500
                    hover:scale-105
                    sm:h-60
                    md:h-72
                    lg:h-80
                  "
                />
              </Box>
            </Reveal>
          </SimpleGrid>
        </Container>
      </Box>

      {/* =========================================================
          PURPOSE
      ========================================================= */}
      <Container size="xl" py={{ base: 80, md: 120 }}>
        <Reveal>
          <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing={{ base: 50, md: 100 }}
            verticalSpacing={50}
          >
            <Stack gap="md">
              <Text
                size="sm"
                fw={700}
                className="
                  uppercase
                  tracking-[0.2em]
                  !text-[var(--accent)]
                "
              >
                Our Purpose
              </Text>

              <Title
                order={2}
                className="
                  !text-3xl
                  !font-bold
                  !text-[var(--text-h)]
                  md:!text-4xl
                "
              >
                Connecting people with information and services.
              </Title>
            </Stack>

            <Stack gap="md">
              <Text size="md" lh={1.8} c="dimmed">
                FCV provides a centralized digital environment where users can
                discover public information, explore available services, access
                resources, and stay informed about relevant announcements and
                activities.
              </Text>

              <Text size="md" lh={1.8} c="dimmed">
                The platform is designed to reduce barriers to information and
                create a simpler, more intuitive experience for the people it
                serves.
              </Text>
            </Stack>
          </SimpleGrid>
        </Reveal>
      </Container>

      {/* =========================================================
          VALUES
      ========================================================= */}
      <Box
        className="
          border-y
          border-[var(--border)]
          bg-[var(--surface)]
        "
      >
        <Container size="xl" py={{ base: 80, md: 110 }}>
          <Reveal>
            <Stack align="center" gap="sm" mb={55} ta="center">
              <Text
                size="sm"
                fw={700}
                className="
                  uppercase
                  tracking-[0.2em]
                  !text-[var(--accent)]
                "
              >
                What FCV Represents
              </Text>

              <Title
                order={2}
                className="
                  !text-3xl
                  !font-bold
                  !text-[var(--text-h)]
                  md:!text-4xl
                "
              >
                Three principles. One direction.
              </Title>

              <Text maw={650} c="dimmed" lh={1.7}>
                FCV is guided by three principles that shape its approach to
                digital service and public information.
              </Text>
            </Stack>
          </Reveal>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={30}>
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <Reveal key={value.title} delay={index * 120}>
                  {/* THE WHOLE CARD IS THE MOTION GROUP */}
                  <Box
                    data-motion-icon-group
                    className="
                      group
                      h-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--bg)]
                      p-7
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-[var(--accent)]
                      hover:shadow-lg
                    "
                  >
                    <Stack gap="lg">
                      <ThemeIcon
                        size={50}
                        radius="xl"
                        variant="light"
                        className="
                          !bg-[var(--accent-bg)]
                          !text-[var(--accent)]
                        "
                      >
                        <Icon size={23} trigger="parent-hover" />
                      </ThemeIcon>

                      <Title
                        order={3}
                        className="
                          !text-xl
                          !font-bold
                          !text-[var(--text-h)]
                        "
                      >
                        {value.title}
                      </Title>

                      <Text size="sm" lh={1.8} c="dimmed">
                        {value.description}
                      </Text>
                    </Stack>
                  </Box>
                </Reveal>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* =========================================================
          APPROACH / FEATURES
      ========================================================= */}
      <Container size="xl" py={{ base: 80, md: 120 }}>
        <Reveal>
          <Stack align="center" gap="sm" mb={55} ta="center">
            <Text
              size="sm"
              fw={700}
              className="
                uppercase
                tracking-[0.2em]
                !text-[var(--accent)]
              "
            >
              Our Approach
            </Text>

            <Title
              order={2}
              className="
                !text-3xl
                !font-bold
                !text-[var(--text-h)]
                md:!text-4xl
              "
            >
              Designed for a better digital experience.
            </Title>

            <Text maw={700} c="dimmed" lh={1.7}>
              FCV brings together information and services in a digital
              environment focused on accessibility, usability, and trust.
            </Text>
          </Stack>
        </Reveal>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30}>
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} delay={index * 120}>
                {/* WHOLE FEATURE IS THE MOTION GROUP */}
                <Stack
                  gap="md"
                  className="
                    group
                    h-full
                    rounded-xl
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-1
                  "
                  data-motion-icon-group
                >
                  <ThemeIcon
                    size={46}
                    radius="xl"
                    variant="light"
                    className="
                      !bg-[var(--accent-bg)]
                      !text-[var(--accent)]
                    "
                  >
                    <Icon size={21} trigger="parent-hover" />
                  </ThemeIcon>

                  <Title
                    order={3}
                    className="
                      !text-xl
                      !font-bold
                      !text-[var(--text-h)]
                    "
                  >
                    {feature.title}
                  </Title>

                  <Text size="sm" lh={1.8} c="dimmed">
                    {feature.description}
                  </Text>
                </Stack>
              </Reveal>
            );
          })}
        </SimpleGrid>
      </Container>

      {/* =========================================================
          VISION
      ========================================================= */}
      {/* =========================================================
    VISION
========================================================= */}

      <Box
        className="
    border-y
    border-[var(--border)]
    bg-[var(--surface)]
  "
      >
        <Container size="xl" py={{ base: 70, md: 110 }}>
          <Reveal>
            <Box
              className="
          relative
          min-h-[520px]
          overflow-hidden
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--bg)]
        "
            >
              {/* =====================================================
            BACKGROUND GOLD GLOW
        ===================================================== */}

              <Box
                className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-[500px]
            w-[500px]
            rounded-full
            bg-[var(--accent)]
            opacity-[0.10]
            blur-[100px]
          "
              />

              <Box
                className="
            pointer-events-none
            absolute
            -bottom-40
            right-20
            h-[400px]
            w-[400px]
            rounded-full
            bg-[var(--accent)]
            opacity-[0.06]
            blur-[100px]
          "
              />

              {/* =====================================================
            DASHBOARD SCREENSHOT
        ===================================================== */}

              <Box
                className="
            pointer-events-none
            absolute
            -right-24
            top-1/2
            hidden
            w-[68%]
            -translate-y-1/2
            md:block
            lg:w-[65%]
          "
              >
                {/* Gold halo */}
                <Box
                  className="
              absolute
              inset-8
              rounded-3xl
              bg-[var(--accent)]
              opacity-[0.10]
              blur-3xl
            "
                />

                {/* Screenshot */}
                <Box
                  className="
              relative
              rotate-[-3deg]
              overflow-hidden
              rounded-xl
              border
              border-[var(--accent)]
              border-opacity-20
              bg-[var(--surface)]
              shadow-[0_30px_100px_rgba(0,0,0,0.18)]
            "
                >
                  <img
                    src={dashboardScreenshot}
                    alt="FCV System Dashboard"
                    className="
                block
                h-auto
                w-full
                opacity-[0.92]
              "
                  />

                  {/* White fade toward the text */}
                  <Box
                    className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-r
                from-[var(--bg)]
                via-transparent
                to-transparent
                opacity-90
              "
                  />

                  {/* Bottom fade */}
                  <Box
                    className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-1/3
                bg-gradient-to-t
                from-[var(--bg)]
                to-transparent
              "
                  />
                </Box>

                {/* Decorative gold line */}
                <Box
                  className="
              absolute
              -bottom-5
              left-20
              h-px
              w-40
              bg-[var(--accent)]
              opacity-40
            "
                />
              </Box>

              {/* =====================================================
            MOBILE SCREENSHOT
        ===================================================== */}

              <Box
                className="
            relative
            mt-10
            px-6
            pb-8
            md:hidden
          "
              >
                <Box
                  className="
              overflow-hidden
              rounded-xl
              border
              border-[var(--accent)]
              border-opacity-20
              shadow-xl
            "
                >
                  <img
                    src={dashboardScreenshot}
                    alt="FCV System Dashboard"
                    className="
                block
                h-auto
                w-full
                opacity-90
              "
                  />
                </Box>
              </Box>

              {/* =====================================================
            CONTENT
        ===================================================== */}

              <Stack
                maw={650}
                gap="lg"
                className="
            relative
            z-10
            px-6
            py-12
            md:px-14
            md:py-20
          "
              >
                {/* Label */}

                <Text
                  size="sm"
                  fw={700}
                  className="
              uppercase
              tracking-[0.2em]
              !text-[var(--accent)]
            "
                >
                  Our Vision
                </Text>

                {/* Heading */}

                <Title
                  order={2}
                  className="
              !text-3xl
              !font-bold
              !leading-tight
              !text-[var(--text-h)]
              md:!text-4xl
              lg:!text-5xl
            "
                >
                  A connected digital experience where public information is
                  accessible to everyone.
                </Title>

                {/* Description */}

                <Text size="md" lh={1.8} c="dimmed" maw={580}>
                  FCV aims to continuously evolve as a reliable digital platform
                  that connects people with the information and services they
                  need while supporting transparency, efficiency, and meaningful
                  public engagement.
                </Text>

                {/* Small brand statement */}

                <Group gap="xs" mt="sm">
                  <Box
                    className="
                h-2
                w-2
                rounded-full
                bg-[var(--accent)]
                shadow-[0_0_12px_var(--accent)]
              "
                  />

                  <Text
                    size="xs"
                    fw={700}
                    className="
                uppercase
                tracking-[0.15em]
                !text-[var(--accent)]
              "
                  >
                    Forward • Commitment • Vision
                  </Text>
                </Group>
              </Stack>

              {/* =====================================================
            DECORATIVE GRID
        ===================================================== */}

              <Box
                className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            h-48
            w-48
            opacity-[0.06]
          "
                style={{
                  backgroundImage: `
              linear-gradient(var(--accent) 1px, transparent 1px),
              linear-gradient(90deg, var(--accent) 1px, transparent 1px)
            `,
                  backgroundSize: "24px 24px",
                  maskImage: "linear-gradient(to top left, black, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to top left, black, transparent)",
                }}
              />
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <Container size="xl" py={{ base: 80, md: 110 }}>
        <Reveal>
          <Stack align="center" ta="center" gap="md">
            <Text
              size="sm"
              fw={700}
              className="
                uppercase
                tracking-[0.2em]
                !text-[var(--accent)]
              "
            >
              Discover FCV
            </Text>

            <Title
              order={2}
              className="
                !text-3xl
                !font-bold
                !text-[var(--text-h)]
                md:!text-4xl
              "
            >
              Information. Services. Connection.
            </Title>

            <Text maw={650} c="dimmed" lh={1.7}>
              Explore the platform and discover the information and services
              available through FCV.
            </Text>

            {/* Parent-hover motion */}
            <Box
              component={Link}
              to="/"
              data-motion-icon-group
              className="
                mt-3
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-[var(--accent)]
                px-6
                py-3
                !text-white
                no-underline
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[var(--accent-hover)]
                hover:shadow-md
              "
            >
              <Text size="sm" fw={600}>
                Explore FCV
              </Text>

              <ArrowRightMotion size={17} trigger="parent-hover" />
            </Box>
          </Stack>
        </Reveal>
      </Container>
    </Box>
  );
}
