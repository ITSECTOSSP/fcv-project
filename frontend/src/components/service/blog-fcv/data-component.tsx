import {
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  Archive,
  CheckCircle,
  Clock,
  FileText,
  Folder,
  Layers,
} from "lucide-react";

import type { Content } from "@/types/blog-fcv/content";

const GOLD = "#C9A227";

interface BlogAnalyticsProps {
  contents?: Content[] | null;
  categoriesCount?: number | null;
  contentTypesCount?: number | null;
  loading?: boolean;
}

export default function BlogAnalytics({
  contents,
  categoriesCount,
  contentTypesCount,
  loading = false,
}: BlogAnalyticsProps) {
  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   *
   * Explicit loading OR data has not arrived yet.
   */

  const isLoading =
    loading ||
    contents === undefined ||
    contents === null ||
    categoriesCount === undefined ||
    categoriesCount === null ||
    contentTypesCount === undefined ||
    contentTypesCount === null;

  /*
   * =========================================================
   * CONTENT COUNTS
   * =========================================================
   */

  const publishedCount =
    contents?.filter((content) => content.status === "published").length ?? 0;

  const draftCount =
    contents?.filter((content) => content.status === "draft").length ?? 0;

  const pendingCount =
    contents?.filter((content) => content.status === "pending").length ?? 0;

  const archivedCount =
    contents?.filter((content) => content.status === "archived").length ?? 0;

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const statistics = [
    {
      label: "Total Contents",
      value: contents?.length ?? 0,
      icon: FileText,
      description: "All content records",
    },
    {
      label: "Published",
      value: publishedCount,
      icon: CheckCircle,
      description: "Publicly available",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: Clock,
      description: "Content in preparation",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      description: "Waiting for review",
    },
    {
      label: "Archived",
      value: archivedCount,
      icon: Archive,
      description: "Archived content",
    },
    {
      label: "Categories",
      value: categoriesCount ?? 0,
      icon: Folder,
      description: "Available categories",
    },
    {
      label: "Content Types",
      value: contentTypesCount ?? 0,
      icon: Layers,
      description: "Configured content types",
    },
  ];

  return (
    <SimpleGrid
      cols={{
        base: 1,
        xs: 2,
        sm: 3,
        lg: 4,
      }}
      spacing="md"
    >
      {statistics.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            withBorder
            radius="lg"
            padding="lg"
            className="
                            !border-[var(--border)]
                            !bg-[var(--surface)]
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-md
                        "
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {stat.label}
                </Text>

                {isLoading ? (
                  <Skeleton height={30} width={55} mt={8} radius="sm" />
                ) : (
                  <Title order={2} mt={8}>
                    {stat.value}
                  </Title>
                )}

                {isLoading ? (
                  <Skeleton height={12} width="80%" mt={8} radius="sm" />
                ) : (
                  <Text size="xs" c="dimmed" mt={4}>
                    {stat.description}
                  </Text>
                )}
              </div>

              <ThemeIcon variant="light" color="yellow" size="xl" radius="md">
                {isLoading ? (
                  <Skeleton height={20} width={20} radius="sm" />
                ) : (
                  <Icon size={20} color={GOLD} />
                )}
              </ThemeIcon>
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
