import {
  Anchor,
  Box,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const navigation = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Solutions", to: "/solutions" },
      // { label: "News", to: "/news" },
      // { label: "Events", to: "/events" },
      { label: "Contact", to: "/contact" },
      { label: "About FCV", to: "/about" },
    ],
  },
  // {
  //   title: "Solutions",
  //   links: [
  //     { label: "Coming Soon", to: "/" },
  //     // { label: "Document Requests", to: "/requests" },
  //     // { label: "Certified Copies", to: "/certified-copies" },
  //     // { label: "Track Request", to: "/track-request" },
  //   ],
  // },
];

export default function PublicFooter() {
  return (
    <Box
      component="footer"
      className="
        mt-auto
        border-t
        !border-[var(--border)]
        !bg-[var(--surface)]
        !text-[var(--text)]
      "
    >
      <Container size="xl" py={50}>
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 5 }}
          spacing={{ base: 35, md: 50 }}
        >
          {/* =====================================================
              BRAND / ABOUT
              ===================================================== */}

          <Box className="md:col-span-2">
            <Stack gap="md">
              <Group gap="sm" wrap="nowrap">
                <Box
                  component="img"
                  src="/icons.png"
                  alt="FCV"
                  className="
                    h-12
                    w-auto
                    shrink-0
                    object-contain
                  "
                />

                <Stack gap={1}>
                  <Text
                    fw={800}
                    size="lg"
                    className="
                      !text-[var(--text-h)]
                      tracking-wide
                    "
                  >
                    FCV
                  </Text>

                  <Text size="xs" c="dimmed" fw={500}>
                    Forward • Commitment • Vision
                  </Text>
                </Stack>
              </Group>

              <Text size="sm" lh={1.7} maw={450} c="dimmed">
                A digital platform designed to provide accessible information,
                services, and resources to the public through a connected and
                modern digital experience.
              </Text>

              {/* CONTACT */}
              <Stack gap="xs">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon
                    size={28}
                    radius="xl"
                    variant="light"
                    className="
                      !bg-[var(--accent-bg)]
                      !text-[var(--accent)]
                    "
                  >
                    <MapPin size={15} />
                  </ThemeIcon>

                  <Text size="sm" c="dimmed">
                    Quezon City, Philippines
                  </Text>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon
                    size={28}
                    radius="xl"
                    variant="light"
                    className="
                      !bg-[var(--accent-bg)]
                      !text-[var(--accent)]
                    "
                  >
                    <Mail size={15} />
                  </ThemeIcon>

                  <Anchor
                    href="mailto:info@example.gov.ph"
                    size="sm"
                    className="
                      !text-[var(--text)]
                      transition-colors
                      duration-200
                      hover:!text-[var(--accent)]
                    "
                  >
                    forward.commitment.vision@gmail.com
                  </Anchor>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon
                    size={28}
                    radius="xl"
                    variant="light"
                    className="
                      !bg-[var(--accent-bg)]
                      !text-[var(--accent)]
                    "
                  >
                    <Phone size={15} />
                  </ThemeIcon>

                  <Text size="sm" c="dimmed">
                    (+639) 69-064-3426 
                  </Text>
                </Group>
              </Stack>
            </Stack>
          </Box>

          {/* =====================================================
              NAVIGATION COLUMNS
              ===================================================== */}

          {navigation.map((section) => (
            <Stack key={section.title} gap="sm">
              <Text
                size="sm"
                fw={700}
                className="
                  !text-[var(--text-h)]
                  uppercase
                  tracking-wider
                "
              >
                {section.title}
              </Text>

              <Stack gap={7}>
                {section.links.map((link) => (
                  <Anchor
                    key={link.to}
                    component={Link}
                    to={link.to}
                    size="sm"
                    className="
    group
    relative
    w-fit
    !text-[var(--text)]
    !no-underline
  "
                  >
                    <span
                      className="
      !no-underline
      transition-colors
      duration-200
      group-hover:!text-[var(--accent)]
    "
                    >
                      {link.label}
                    </span>

                    {/* Animated underline */}
                    <span
                      className="
      pointer-events-none
      absolute
      -bottom-0.5
      left-0
      h-px
      w-full
      origin-left
      scale-x-0
      bg-[var(--accent)]
      transition-transform
      duration-300
      ease-out
      group-hover:scale-x-100
    "
                    />
                  </Anchor>
                ))}
              </Stack>
            </Stack>
          ))}
        </SimpleGrid>

        {/* =====================================================
            DIVIDER
            ===================================================== */}

        <Divider color="var(--border)" my={35} />

        {/* =====================================================
            BOTTOM FOOTER
            ===================================================== */}

        <Group
          justify="space-between"
          align="center"
          gap="md"
          className="pb-16"
        >
          {/* COPYRIGHT */}
          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} FCV. All rights reserved.
          </Text>

          {/* LEGAL LINKS */}
          <Group gap="lg">
            <Anchor
              component={Link}
              to="/privacy"
              size="xs"
              className="
        group
        relative
        !text-[var(--text)]
        !no-underline
      "
            >
              <span className="transition-colors duration-200 group-hover:!text-[var(--accent)]">
                Privacy Policy
              </span>

              <span
                className="
          absolute
          -bottom-0.5
          left-0
          h-px
          w-full
          origin-left
          scale-x-0
          !bg-[var(--accent)]
          transition-transform
          duration-300
          group-hover:scale-x-100
        "
              />
            </Anchor>

            <Anchor
              component={Link}
              to="/terms"
              size="xs"
              className="
        group
        relative
        !text-[var(--text)]
        !no-underline
      "
            >
              <span className="transition-colors duration-200 group-hover:!text-[var(--accent)]">
                Terms of Use
              </span>

              <span
                className="
          absolute
          -bottom-0.5
          left-0
          h-px
          w-full
          origin-left
          scale-x-0
          !bg-[var(--accent)]
          transition-transform
          duration-300
          group-hover:scale-x-100
        "
              />
            </Anchor>

            <Anchor
              component={Link}
              to="/accessibility"
              size="xs"
              className="
        group
        relative
        !text-[var(--text)]
        !no-underline
      "
            >
              <span className="transition-colors duration-200 group-hover:!text-[var(--accent)]">
                Accessibility
              </span>

              <span
                className="
          absolute
          -bottom-0.5
          left-0
          h-px
          w-full
          origin-left
          scale-x-0
          !bg-[var(--accent)]
          transition-transform
          duration-300
          group-hover:scale-x-100
        "
              />
            </Anchor>
          </Group>

          {/* =====================================================
    SOCIAL / EXTERNAL
    ===================================================== */}

          <Group gap="xs">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/francischristian.virgen.18"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="
      flex
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-full
      !p-0
      !m-0
      !no-underline
      !text-[var(--text)]
      transition-all
      duration-200
      hover:-translate-y-0.5
      hover:!bg-[var(--accent-bg)]
      hover:!text-[var(--accent)]
    "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                className="!m-0 !block"
                style={{
                  display: "block",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <path d="M13.5 21v-8h2.75l.4-3h-3.15V8.08c0-.87.24-1.46 1.5-1.46h1.75V3.94c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.22 1.53-4.22 4.34V10H7.25v3h2.75v8h3.5Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/francis-christian-virgen-603791263/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="
      flex
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-full
      !p-0
      !m-0
      !no-underline
      !text-[var(--text)]
      transition-all
      duration-200
      hover:-translate-y-0.5
      hover:!bg-[var(--accent-bg)]
      hover:!text-[var(--accent)]
    "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                className="!m-0 !block"
                style={{
                  display: "block",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <path d="M6.5 8.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM4.5 10h4v10h-4V10Zm6 0h3.85v1.37h.05c.54-.96 1.86-1.97 3.83-1.97 4.09 0 4.85 2.69 4.85 6.19V20h-4v-3.91c0-.93-.02-2.13-1.3-2.13-1.3 0-1.5 1.02-1.5 2.06V20h-4V10h.12Z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/ITSECTOSSP"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-full
        !p-0
        !m-0
        !no-underline
        !text-[var(--text)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:!bg-[var(--accent-bg)]
        hover:!text-[var(--accent)]
    "
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
                className="!m-0 !block"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.58A12.01 12.01 0 0 0 24 12C24 5.37 18.63 0 12 0Z" />
              </svg>
            </a>

            {/* External Link
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="External website"
              className="
      flex
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-full
      !p-0
      !m-0
      !no-underline
      !text-[var(--text)]
      transition-all
      duration-200
      hover:-translate-y-0.5
      hover:!bg-[var(--accent-bg)]
      hover:!text-[var(--accent)]
    "
            >
              <ArrowUpRight
                size={18}
                strokeWidth={1.8}
                className="!m-0 !block"
              />
            </a> */}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
