import {
  Anchor,
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
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Clock3, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";

export default function Contact() {
  return (
    <Box
      component="main"
      className="min-h-screen bg-[var(--bg)] text-[var(--text)]"
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <Box
        className="
          border-b
          border-[var(--border)]
          bg-[var(--surface)]
        "
      >
        <Container size="xl" py={80}>
          <Stack align="center" gap="md" ta="center">
            <Badge
              size="lg"
              variant="light"
              leftSection={<MessageSquare size={14} />}
              className="
                !border
                !border-[var(--border)]
                !bg-[var(--accent-bg)]
                !text-[var(--accent)]
              "
            >
              Get in Touch
            </Badge>

            <Title
              order={1}
              className="
                max-w-3xl
                !text-4xl
                !font-bold
                sm:!text-5xl
              "
            >
              Contact Us
            </Title>

            <Text size="lg" c="dimmed" className="max-w-2xl">
              Have a question, request, or need assistance? We are here to help.
              Get in touch with the FCV team through any of the channels below.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* =====================================================
          CONTACT INFORMATION
      ===================================================== */}

      <Container size="xl" py={64}>
        <Stack gap={48}>
          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
              lg: 4,
            }}
            spacing="lg"
            style={{
              justifyItems: "center",
            }}
          >
            {/* ADDRESS */}
            <Paper
              w="100%"
              maw={280}
              withBorder
              radius="lg"
              p="xl"
              className="
      border-[var(--border)]
      bg-[var(--surface)]
      transition-all
      duration-200
      hover:-translate-y-1
      hover:shadow-lg
      hover:shadow-[rgba(201,162,39,0.12)]
    "
            >
              <Stack gap="md">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="light"
                  className="
          !bg-[var(--accent-bg)]
          !text-[var(--accent)]
        "
                >
                  <MapPin size={22} />
                </ThemeIcon>

                <Stack gap={4}>
                  <Text fw={700}>Visit Our Office</Text>

                  <Text size="sm" c="dimmed">
                    Quezon City, Philippines
                  </Text>
                </Stack>
              </Stack>
            </Paper>

            {/* PHONE */}
            <Paper
              w="100%"
              maw={280}
              withBorder
              radius="lg"
              p="xl"
              className="
      border-[var(--border)]
      bg-[var(--surface)]
      transition-all
      duration-200
      hover:-translate-y-1
      hover:shadow-lg
      hover:shadow-[rgba(201,162,39,0.12)]
    "
            >
              <Stack gap="md">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="light"
                  className="
          !bg-[var(--accent-bg)]
          !text-[var(--accent)]
        "
                >
                  <Phone size={22} />
                </ThemeIcon>

                <Stack gap={4}>
                  <Text fw={700}>Phone</Text>

                  <Text size="sm" c="dimmed">
                    0969-064-3426
                  </Text>
                </Stack>
              </Stack>
            </Paper>

            {/* EMAIL */}
            <Paper
              w="100%"
              maw={360}
              withBorder
              radius="lg"
              p="xl"
              className="
    border-[var(--border)]
    bg-[var(--surface)]
    transition-all
    duration-200
    hover:-translate-y-1
    hover:shadow-lg
    hover:shadow-[rgba(201,162,39,0.12)]
  "
            >
              <Stack gap="md">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="light"
                  className="
        !bg-[var(--accent-bg)]
        !text-[var(--accent)]
      "
                >
                  <Mail size={22} />
                </ThemeIcon>

                <Stack gap={4}>
                  <Text fw={700}>Email</Text>

                  <Anchor
                    href="mailto:forward.commitment.vision@gmail.com"
                    size="sm"
                    className="
          !text-[var(--accent)]
          break-words
        "
                  >
                    forward.commitment.vision@gmail.com
                  </Anchor>
                </Stack>
              </Stack>
            </Paper>

            {/* WORKING HOURS */}
            <Paper
              w="100%"
              maw={280}
              withBorder
              radius="lg"
              p="xl"
              className="
      border-[var(--border)]
      bg-[var(--surface)]
      transition-all
      duration-200
      hover:-translate-y-1
      hover:shadow-lg
      hover:shadow-[rgba(201,162,39,0.12)]
    "
            >
              <Stack gap="md">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="light"
                  className="
          !bg-[var(--accent-bg)]
          !text-[var(--accent)]
        "
                >
                  <Clock3 size={22} />
                </ThemeIcon>

                <Stack gap={4}>
                  <Text fw={700}>Working Hours</Text>

                  <Text size="sm" c="dimmed">
                    Saturday – Sunday
                  </Text>

                  <Text size="sm" c="dimmed">
                    8:00 AM – 5:00 PM
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* =====================================================
              CONTACT FORM + OFFICE INFORMATION
          ===================================================== */}

          <Grid>
            {/* CONTACT FORM */}

            <Grid.Col
              span={{
                base: 12,
                md: 7,
              }}
            >
              <Paper
                withBorder
                radius="xl"
                p={{
                  base: "lg",
                  sm: "xl",
                }}
                className="
                  border-[var(--border)]
                  bg-[var(--surface)]
                "
              >
                <Stack gap="xl">
                  <Stack gap={4}>
                    <Title order={2}>Send Us a Message</Title>

                    <Text size="sm" c="dimmed">
                      Fill out the form below and we'll get back to you as soon
                      as possible.
                    </Text>
                  </Stack>

                  <Divider className="!border-[var(--border)]" />

                  <SimpleGrid
                    cols={{
                      base: 1,
                      sm: 2,
                    }}
                  >
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                      radius="md"
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="you@example.com"
                      type="email"
                      required
                      radius="md"
                    />
                  </SimpleGrid>

                  <TextInput
                    label="Subject"
                    placeholder="What can we help you with?"
                    required
                    radius="md"
                  />

                  <Textarea
                    label="Message"
                    placeholder="Write your message here..."
                    minRows={7}
                    autosize
                    required
                    radius="md"
                  />

                  <Group justify="flex-end">
                    <Button
                      size="md"
                      radius="md"
                      leftSection={<Send size={17} />}
                      className="
                        !bg-[var(--accent)]
                        !text-white
                        transition-all
                        duration-200
                        hover:!opacity-90
                        hover:-translate-y-0.5
                      "
                    >
                      Send Message
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>

            {/* OFFICE INFORMATION */}

            <Grid.Col
              span={{
                base: 12,
                md: 5,
              }}
            >
              <Stack gap="lg">
                <Paper
                  withBorder
                  radius="xl"
                  p="xl"
                  className="
                    border-[var(--border)]
                    bg-[var(--surface)]
                  "
                >
                  <Stack gap="xl">
                    <Stack gap={4}>
                      <Title order={2}>Office Information</Title>

                      <Text size="sm" c="dimmed">
                        Connect with the FCV office for inquiries, assistance,
                        and official concerns.
                      </Text>
                    </Stack>

                    <Divider className="!border-[var(--border)]" />

                    <Stack gap="lg">
                      <Group align="flex-start" wrap="nowrap">
                        <ThemeIcon
                          size={40}
                          radius="md"
                          variant="light"
                          className="
                            !bg-[var(--accent-bg)]
                            !text-[var(--accent)]
                          "
                        >
                          <MapPin size={18} />
                        </ThemeIcon>

                        <Stack gap={2}>
                          <Text fw={600}>Office Address</Text>

                          <Text size="sm" c="dimmed">
                            Quezon City, Metro Manila, Philippines
                          </Text>
                        </Stack>
                      </Group>

                      <Group align="flex-start" wrap="nowrap">
                        <ThemeIcon
                          size={40}
                          radius="md"
                          variant="light"
                          className="
                            !bg-[var(--accent-bg)]
                            !text-[var(--accent)]
                          "
                        >
                          <Mail size={18} />
                        </ThemeIcon>

                        <Stack gap={2}>
                          <Text fw={600}>Email Address</Text>

                          <Anchor
                            href="mailto:forward.commitment.vision@gmail.com"
                            size="sm"
                            className="!text-[var(--accent)]"
                          >
                            forward.commitment.vision@gmail.com
                          </Anchor>
                        </Stack>
                      </Group>

                      <Group align="flex-start" wrap="nowrap">
                        <ThemeIcon
                          size={40}
                          radius="md"
                          variant="light"
                          className="
                            !bg-[var(--accent-bg)]
                            !text-[var(--accent)]
                          "
                        >
                          <Clock3 size={18} />
                        </ThemeIcon>

                        <Stack gap={2}>
                          <Text fw={600}>Business Hours</Text>

                          <Text size="sm" c="dimmed">
                            Monday – Friday
                          </Text>

                          <Text size="sm" c="dimmed">
                            8:00 AM – 5:00 PM
                          </Text>
                        </Stack>
                      </Group>
                    </Stack>
                  </Stack>
                </Paper>

                {/* SOCIAL / CONNECT */}

                <Paper
                  withBorder
                  radius="xl"
                  p="xl"
                  className="
                    border-[var(--border)]
                    bg-[var(--surface)]
                  "
                >
                  <Stack gap="md">
                    <Group gap="sm">
                      <ThemeIcon
                        size={38}
                        radius="md"
                        variant="light"
                        className="
                          !bg-[var(--accent-bg)]
                          !text-[var(--accent)]
                        "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.006 10.125 11.854v-8.385H7.078v-3.469h3.047V9.428c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.982h-1.515c-1.491 0-1.956.93-1.956 1.885v2.26h3.328l-.532 3.469h-2.796v8.385C19.612 23.079 24 18.092 24 12.073Z" />
                        </svg>
                      </ThemeIcon>

                      <Stack gap={0}>
                        <Text fw={700}>Stay Connected</Text>

                        <Text size="xs" c="dimmed">
                          Follow our official updates.
                        </Text>
                      </Stack>
                    </Group>

                    <Button
                      variant="light"
                      radius="md"
                      fullWidth
                      className="
                        !bg-[var(--accent-bg)]
                        !text-[var(--accent)]
                        hover:!bg-[var(--accent)]
                        hover:!text-white
                      "
                    >
                      Visit Our Facebook Page
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
