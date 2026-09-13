import { useEffect, useRef, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  ArrowRight,
  BarChart3,
  Clock3,
  FileSearch,
  Globe2,
  Layers3,
  LockKeyhole,
  Rocket,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

/* =========================================================
   REVEAL ANIMATION
   ========================================================= */

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
        ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }
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

/* =========================================================
   SOLUTIONS
   ========================================================= */

const solutions = [
  {
    icon: FileSearch,
    title: "Document Tracking",
    description:
      "A streamlined digital solution for monitoring documents, requests, actions, and workflow progress from submission to completion.",
  },
  {
    icon: Globe2,
    title: "Public Information",
    description:
      "Digital tools that make important information, services, announcements, and resources easier for the public to discover and access.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Data-driven dashboards and reporting tools designed to help organizations understand activity, performance, and operational trends.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Verification",
    description:
      "Modern verification and security features designed to strengthen document authenticity, traceability, and information integrity.",
  },
  {
    icon: Settings2,
    title: "Digital Solutions",
    description:
      "Custom digital solutions built around organizational requirements, workflows, processes, and opportunities for innovation.",
  },
];

/* =========================================================
   FCV APPROACH
   ========================================================= */

const highlights = [
  {
    icon: Rocket,
    title: "Built for Progress",
    description:
      "Solutions designed to help organizations move from traditional processes toward smarter digital workflows.",
  },
  {
    icon: LockKeyhole,
    title: "Secure by Design",
    description:
      "Security and responsible information management are considered throughout the development of our solutions.",
  },
  {
    icon: Layers3,
    title: "Connected Systems",
    description:
      "Our approach focuses on creating solutions that work together instead of isolated digital tools.",
  },
  {
    icon: Sparkles,
    title: "Continuous Innovation",
    description:
      "We continuously explore new technologies and ideas that can improve services and operational efficiency.",
  },
];

/* =========================================================
   SOLUTIONS PAGE
   ========================================================= */

export default function Solutions() {
  return (
    <Box
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      {/* =====================================================
          HERO
          ===================================================== */}

      <Box
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--accent-bg) 0%, var(--bg) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Decorative elements */}

        <Box
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-96
            w-96
            rounded-full
            opacity-20
          "
          style={{
            border: "1px solid var(--accent)",
          }}
        />

        <Box
          className="
            pointer-events-none
            absolute
            -bottom-48
            -left-32
            h-96
            w-96
            rounded-full
            opacity-10
          "
          style={{
            border: "1px solid var(--accent)",
          }}
        />

        <Container
          size="lg"
          py={{ base: 70, sm: 100, md: 125 }}
          className="relative z-10"
        >
          <Stack align="center" gap="xl" ta="center">

            {/* Hero badge */}

            <Reveal>
              <Badge
                size="lg"
                variant="light"
                leftSection={
                  <Clock3
                    size={15}
                    className="
                      transition-transform
                      duration-300
                      group-hover:rotate-12
                    "
                  />
                }
                style={{
                  backgroundColor: "var(--accent-bg)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
              >
                Coming Soon
              </Badge>
            </Reveal>

            {/* Hero heading */}

            <Reveal delay={100}>
              <Stack gap="md" maw={820}>
                <Title
                  order={1}
                  className="
                    text-4xl
                    font-bold
                    tracking-tight
                    sm:text-5xl
                    md:text-6xl
                  "
                  style={{
                    color: "var(--text)",
                  }}
                >
                  Our Solutions Are{" "}
                  <span style={{ color: "var(--accent)" }}>
                    Coming Soon
                  </span>
                </Title>

                <Text
                  size="lg"
                  maw={720}
                  mx="auto"
                  lh={1.8}
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  We are preparing a growing collection of digital
                  solutions designed to simplify processes, strengthen
                  operations, improve accessibility, and support
                  meaningful innovation.
                </Text>
              </Stack>
            </Reveal>

            {/* Hero buttons */}

            <Reveal delay={200}>
              <Group justify="center">

                <Button
                  component={Link}
                  to="/contact"
                  size="md"
                  className="group"
                  rightSection={
                    <ArrowRight
                      size={17}
                      className="
                        transition-all
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  }
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#ffffff",
                  }}
                >
                  Get in Touch
                </Button>

                <Button
                  component={Link}
                  to="/about"
                  size="md"
                  variant="outline"
                  style={{
                    color: "var(--accent)",
                    borderColor: "var(--accent)",
                  }}
                >
                  Learn More
                </Button>

              </Group>
            </Reveal>
          </Stack>
        </Container>
      </Box>

      {/* =====================================================
          INTRODUCTION
          ===================================================== */}

      <Container size="lg" py={{ base: 60, md: 90 }}>
        <Reveal>
          <Group justify="space-between" align="end">

            <Stack gap="xs" maw={700}>
              <Badge
                variant="light"
                size="md"
                style={{
                  width: "fit-content",
                  backgroundColor: "var(--accent-bg)",
                  color: "var(--accent)",
                }}
              >
                What We're Building
              </Badge>

              <Title
                order={2}
                className="
                  text-3xl
                  font-bold
                  sm:text-4xl
                "
                style={{
                  color: "var(--text)",
                }}
              >
                Digital solutions with a{" "}
                <span style={{ color: "var(--accent)" }}>
                  purpose.
                </span>
              </Title>

              <Text
                size="md"
                lh={1.8}
                style={{
                  color: "var(--text-muted)",
                }}
              >
                FCV is developing a range of solutions that bring
                together technology, efficiency, security, and
                accessibility. Each solution is designed to address
                real operational needs and create a more connected
                digital experience.
              </Text>
            </Stack>

            <ThemeIcon
              size={70}
              radius="xl"
              variant="light"
              className="
                group
                hidden
                md:flex
              "
              style={{
                backgroundColor: "var(--accent-bg)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
              }}
            >
              <Rocket
                size={34}
                strokeWidth={1.5}
                className="
                  transition-all
                  duration-500
                  group-hover:-translate-y-1
                  group-hover:rotate-12
                  group-hover:scale-110
                "
              />
            </ThemeIcon>

          </Group>
        </Reveal>
      </Container>

      {/* =====================================================
          SOLUTIONS GRID
          ===================================================== */}

      <Box
        py={{ base: 60, md: 85 }}
        style={{
          backgroundColor: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Container size="lg">
          <Stack gap={45}>

            {/* Section heading */}

            <Reveal>
              <Stack gap="sm" maw={720}>
                <Group gap="sm">
                  <Badge
                    variant="light"
                    style={{
                      backgroundColor: "var(--accent-bg)",
                      color: "var(--accent)",
                    }}
                  >
                    Solutions & Services
                  </Badge>

                  <Badge
                    variant="outline"
                    style={{
                      color: "var(--accent)",
                      borderColor: "var(--border)",
                    }}
                  >
                    In Development
                  </Badge>
                </Group>

                <Title
                  order={2}
                  className="
                    text-3xl
                    font-bold
                    sm:text-4xl
                  "
                  style={{
                    color: "var(--text)",
                  }}
                >
                  What's coming to FCV
                </Title>

                <Text
                  lh={1.8}
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Explore some of the solutions currently being
                  developed as part of the FCV digital ecosystem.
                </Text>
              </Stack>
            </Reveal>

            {/* Solution cards */}

            <SimpleGrid
              cols={{
                base: 1,
                sm: 2,
                lg: 3,
              }}
              spacing="lg"
            >
              {solutions.map((solution, index) => {
                const Icon = solution.icon;

                return (
                  <Reveal
                    key={solution.title}
                    delay={index * 120}
                  >
                    <Paper
                      p="xl"
                      radius="lg"
                      withBorder
                      className="
                        group
                        h-full
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-lg
                      "
                      style={{
                        backgroundColor: "var(--bg)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <Stack gap="lg">

                        <Group
                          justify="space-between"
                          align="flex-start"
                        >
                          <ThemeIcon
                            size={52}
                            radius="md"
                            variant="light"
                            style={{
                              backgroundColor: "var(--accent-bg)",
                              color: "var(--accent)",
                            }}
                          >
                            <Icon
                              size={25}
                              strokeWidth={1.8}
                              className="
                                transition-all
                                duration-500
                                group-hover:rotate-6
                                group-hover:scale-110
                              "
                            />
                          </ThemeIcon>

                          <Badge
                            size="sm"
                            variant="light"
                            leftSection={
                              <Clock3
                                size={12}
                                className="
                                  transition-transform
                                  duration-300
                                  group-hover:rotate-12
                                "
                              />
                            }
                            style={{
                              backgroundColor: "var(--accent-bg)",
                              color: "var(--accent)",
                            }}
                          >
                            Coming Soon
                          </Badge>
                        </Group>

                        <Stack gap="xs">
                          <Title
                            order={3}
                            size="h3"
                            style={{
                              color: "var(--text)",
                            }}
                          >
                            {solution.title}
                          </Title>

                          <Text
                            size="sm"
                            lh={1.7}
                            style={{
                              color: "var(--text-muted)",
                            }}
                          >
                            {solution.description}
                          </Text>
                        </Stack>

                        <Divider
                          style={{
                            borderColor: "var(--border)",
                          }}
                        />

                        <Group gap={6}>
                          <Clock3
                            size={14}
                            className="
                              transition-transform
                              duration-300
                              group-hover:rotate-12
                            "
                            style={{
                              color: "var(--accent)",
                            }}
                          />

                          <Text
                            size="xs"
                            fw={600}
                            style={{
                              color: "var(--accent)",
                            }}
                          >
                            Currently in development
                          </Text>
                        </Group>

                      </Stack>
                    </Paper>
                  </Reveal>
                );
              })}
            </SimpleGrid>

          </Stack>
        </Container>
      </Box>

      {/* =====================================================
          FCV APPROACH
          ===================================================== */}

      <Container size="lg" py={{ base: 65, md: 95 }}>
        <Grid
          align="center"
          className="gap-y-10 md:gap-x-14"
        >

          {/* Left content */}

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Reveal>
              <Stack gap="md">

                <Badge
                  variant="light"
                  style={{
                    width: "fit-content",
                    backgroundColor: "var(--accent-bg)",
                    color: "var(--accent)",
                  }}
                >
                  Our Approach
                </Badge>

                <Title
                  order={2}
                  className="
                    text-3xl
                    font-bold
                    sm:text-4xl
                  "
                  style={{
                    color: "var(--text)",
                  }}
                >
                  Forward.{" "}
                  <span style={{ color: "var(--accent)" }}>
                    Commitment. Vision.
                  </span>
                </Title>

                <Text
                  lh={1.8}
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Our solutions are guided by the principles behind
                  FCV: moving forward through innovation, remaining
                  committed to quality and service, and maintaining
                  a clear vision for a better digital future.
                </Text>

                <Group mt="sm">
                  <Button
                    component={Link}
                    to="/contact"
                    variant="outline"
                    className="group"
                    rightSection={
                      <ArrowRight
                        size={16}
                        className="
                          transition-all
                          duration-300
                          group-hover:translate-x-1
                        "
                      />
                    }
                    style={{
                      color: "var(--accent)",
                      borderColor: "var(--accent)",
                    }}
                  >
                    Talk to Us
                  </Button>
                </Group>

              </Stack>
            </Reveal>
          </Grid.Col>

          {/* Right cards */}

          <Grid.Col span={{ base: 12, md: 7 }}>
            <SimpleGrid
              cols={{ base: 1, sm: 2 }}
              spacing="md"
            >
              {highlights.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Reveal
                    key={item.title}
                    delay={index * 120}
                  >
                    <Paper
                      p="lg"
                      radius="md"
                      withBorder
                      className="
                        group
                        h-full
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-md
                      "
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <Group
                        align="flex-start"
                        wrap="nowrap"
                      >
                        <ThemeIcon
                          size={44}
                          radius="md"
                          variant="light"
                          style={{
                            flexShrink: 0,
                            backgroundColor: "var(--accent-bg)",
                            color: "var(--accent)",
                          }}
                        >
                          <Icon
                            size={21}
                            className="
                              transition-all
                              duration-500
                              group-hover:rotate-6
                              group-hover:scale-110
                            "
                          />
                        </ThemeIcon>

                        <Stack gap={4}>
                          <Text
                            fw={700}
                            style={{
                              color: "var(--text)",
                            }}
                          >
                            {item.title}
                          </Text>

                          <Text
                            size="sm"
                            lh={1.6}
                            style={{
                              color: "var(--text-muted)",
                            }}
                          >
                            {item.description}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  </Reveal>
                );
              })}
            </SimpleGrid>
          </Grid.Col>

        </Grid>
      </Container>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <Container
        size="lg"
        pb={{ base: 70, md: 100 }}
      >
        <Reveal>
          <Paper
            p={{ base: 30, md: 55 }}
            radius="xl"
            withBorder
            className="relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-bg), var(--surface))",
              borderColor: "var(--border)",
            }}
          >
            {/* Decorative elements */}

            <Box
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-52
                w-52
                rounded-full
                opacity-20
              "
              style={{
                border: "1px solid var(--accent)",
              }}
            />

            <Box
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-20
                h-52
                w-52
                rounded-full
                opacity-10
              "
              style={{
                border: "1px solid var(--accent)",
              }}
            />

            <Group
              justify="space-between"
              align="center"
              gap="xl"
              className="relative z-10"
            >
              <Stack gap="xs" maw={700}>

                <Group
                  gap="xs"
                  className="group w-fit"
                >
                  <Sparkles
                    size={18}
                    className="
                      transition-all
                      duration-500
                      group-hover:rotate-12
                      group-hover:scale-110
                    "
                    style={{
                      color: "var(--accent)",
                    }}
                  />

                  <Text
                    size="sm"
                    fw={700}
                    style={{
                      color: "var(--accent)",
                    }}
                  >
                    Something better is on the way
                  </Text>
                </Group>

                <Title
                  order={2}
                  className="
                    text-2xl
                    font-bold
                    sm:text-3xl
                  "
                  style={{
                    color: "var(--text)",
                  }}
                >
                  Stay tuned for the next chapter of FCV.
                </Title>

                <Text
                  lh={1.7}
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Our solutions are currently being developed. More
                  features, services, and digital experiences will be
                  introduced soon.
                </Text>
              </Stack>

              <Button
                component={Link}
                to="/contact"
                size="md"
                className="group"
                rightSection={
                  <ArrowRight
                    size={17}
                    className="
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                }
                style={{
                  flexShrink: 0,
                  backgroundColor: "var(--accent)",
                  color: "#ffffff",
                }}
              >
                Contact Us
              </Button>
            </Group>
          </Paper>
        </Reveal>
      </Container>
    </Box>
  );
}