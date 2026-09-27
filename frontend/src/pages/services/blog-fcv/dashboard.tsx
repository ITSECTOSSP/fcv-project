import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";

import { ArrowRight, FileText, Folder, Images, Plus } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useContents } from "@/lib/hook/blog-fcv/contents";
import { useCategories } from "@/lib/hook/blog-fcv/categories";
import { useContentTypes } from "@/lib/hook/blog-fcv/content-types";

import BlogAnalytics from "@/components/service/blog-fcv/data-component";

export default function BlogDashboardPage() {
  const navigate = useNavigate();

  const {
    contents,
    loading: contentsLoading,
    error: contentsError,
  } = useContents();

  const { categories, loading: categoriesLoading } = useCategories();

  const { contentTypes, loading: contentTypesLoading } = useContentTypes();

  const isLoading = contentsLoading || categoriesLoading || contentTypesLoading;

  /*
   * =========================================================
   * RECENT CONTENTS
   * =========================================================
   */

  const recentContents = [...contents]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 5);

  return (
    <Stack gap="xl">
      {/* =================================================
                HEADER
                ================================================= */}

      <Card withBorder radius="lg" padding="lg">
        <Stack gap="md">
          <Box>
            <Title order={4}>Quick Actions</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Quickly access your blog management tools.
            </Text>
          </Box>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Create Content */}
            <Card
              withBorder
              radius="md"
              padding="md"
              onClick={() => navigate("/blog/create-content")}
              style={{
                cursor: "pointer",
                minHeight: 140,
                backgroundColor: "#C9A227",
                borderColor: "#C9A227",
                color: "white",
              }}
            >
              <Stack justify="space-between" h="100%">
                <Group justify="space-between" align="flex-start">
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Plus size={21} />
                  </Box>

                  <ArrowRight size={18} />
                </Group>

                <Box>
                  <Text fw={600} size="sm">
                    Create Content
                  </Text>
                  <Text size="xs" mt={4} opacity={0.8}>
                    Add a new blog publication
                  </Text>
                </Box>
              </Stack>
            </Card>

            {/* Categories */}
            <Card
              withBorder
              radius="md"
              padding="md"
              onClick={() => navigate("/blog/categories")}
              style={{
                cursor: "pointer",
                minHeight: 140,
              }}
            >
              <Stack justify="space-between" h="100%">
                <Group justify="space-between" align="flex-start">
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundColor: "var(--mantine-color-gray-1)",
                    }}
                  >
                    <Folder size={21} />
                  </Box>

                  <ArrowRight size={18} color="var(--mantine-color-gray-6)" />
                </Group>

                <Box>
                  <Text fw={600} size="sm">
                    Categories
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Organize your blog content
                  </Text>
                </Box>
              </Stack>
            </Card>

            {/* Content Types */}
            <Card
              withBorder
              radius="md"
              padding="md"
              onClick={() => navigate("/blog/content-types")}
              style={{
                cursor: "pointer",
                minHeight: 140,
              }}
            >
              <Stack justify="space-between" h="100%">
                <Group justify="space-between" align="flex-start">
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundColor: "var(--mantine-color-gray-1)",
                    }}
                  >
                    <FileText size={21} />
                  </Box>

                  <ArrowRight size={18} color="var(--mantine-color-gray-6)" />
                </Group>

                <Box>
                  <Text fw={600} size="sm">
                    Content Types
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Manage publication types
                  </Text>
                </Box>
              </Stack>
            </Card>

            {/* Media Library */}
            <Card
              withBorder
              radius="md"
              padding="md"
              onClick={() => navigate("/blog/media")}
              style={{
                cursor: "pointer",
                minHeight: 140,
              }}
            >
              <Stack justify="space-between" h="100%">
                <Group justify="space-between" align="flex-start">
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundColor: "var(--mantine-color-gray-1)",
                    }}
                  >
                    <Images size={21} />
                  </Box>

                  <ArrowRight size={18} color="var(--mantine-color-gray-6)" />
                </Group>

                <Box>
                  <Text fw={600} size="sm">
                    Media Library
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Manage images and files
                  </Text>
                </Box>
              </Stack>
            </Card>
          </div>
        </Stack>
      </Card>

      {/* =================================================
                ANALYTICS
                ================================================= */}

      <BlogAnalytics
        contents={contents}
        categoriesCount={categories.length}
        contentTypesCount={contentTypes.length}
        loading={isLoading}
      />

      {/* =================================================
                ERROR
                ================================================= */}

      {contentsError && (
        <Card withBorder>
          <Text c="red" size="sm">
            Unable to load content statistics.
          </Text>
        </Card>
      )}

        {/* =================================================
    RECENT CONTENTS
    ================================================= */}
        <Card withBorder radius="lg" padding="lg">
          <Stack gap="md">
            {/* Header */}
            <Group justify="space-between" align="flex-start">
              <Box>
                <Title order={4}>Recent Contents</Title>
                <Text size="sm" c="dimmed" mt={4}>
                  Recently created and updated blog content.
                </Text>
              </Box>

              <Button
                variant="light"
                color="dark"
                size="sm"
                rightSection={<ArrowRight size={14} />}
                onClick={() => navigate("/blog/contents")}
                disabled={contentsLoading}
              >
                View all
              </Button>
            </Group>

            {/* Content */}
            {contentsLoading ? (
              <Stack gap="sm">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index} withBorder radius="md" padding="md">
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={8} style={{ flex: 1 }}>
                        <Skeleton height={18} width="55%" />
                        <Skeleton height={12} width="25%" />
                        <Skeleton height={12} width="80%" />
                        <Group gap="xs">
                          <Skeleton height={20} width={70} radius="xl" />
                          <Skeleton height={20} width={90} radius="xl" />
                        </Group>
                      </Stack>

                      <Skeleton height={26} width={85} radius="xl" />
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : recentContents.length === 0 ? (
              <Card
                withBorder
                radius="md"
                padding="xl"
                style={{
                  textAlign: "center",
                }}
              >
                <Text size="sm" fw={500}>
                  No content records found.
                </Text>

                <Text size="xs" c="dimmed" mt={4}>
                  Create your first content to get started.
                </Text>

                <Button
                  mt="md"
                  size="sm"
                  color="yellow"
                  leftSection={<Plus size={15} />}
                  onClick={() => navigate("/blog/create-content")}
                >
                  Create Content
                </Button>
              </Card>
            ) : (
              <Stack gap="sm">
                {recentContents.map((content) => {
                  const contentType = content.content_type?.name ?? "Content";
                  const categories = content.categories ?? [];

                  return (
                    <Card
                      key={content.id}
                      withBorder
                      radius="md"
                      padding="md"
                      style={{
                        cursor: "pointer",
                        transition: "all 150ms ease",
                      }}
                      onClick={() =>
                        navigate(`/blog/contents/${content.id}/edit`)
                      }
                    >
                      <Group
                        justify="space-between"
                        align="flex-start"
                        wrap="nowrap"
                      >
                        {/* Main Content */}
                        <Stack gap={8} style={{ minWidth: 0, flex: 1 }}>
                          {/* Content Type + Featured */}
                          <Group gap="xs">
                            <Badge
                              variant="light"
                              color="gray"
                              size="sm"
                              radius="sm"
                            >
                              {contentType}
                            </Badge>

                            {content.is_featured && (
                              <Badge
                                variant="light"
                                color="yellow"
                                size="sm"
                                radius="sm"
                              >
                                Featured
                              </Badge>
                            )}
                          </Group>

                          {/* Title */}
                          <Text fw={600} size="sm" lineClamp={1}>
                            {content.title}
                          </Text>

                          {/* Excerpt */}
                          {content.excerpt && (
                            <Text size="xs" c="dimmed" lineClamp={2} maw={900}>
                              {content.excerpt}
                            </Text>
                          )}

                          {/* Categories */}
                          {categories.length > 0 && (
                            <Group gap={6}>
                              {categories.slice(0, 3).map((category) => (
                                <Badge
                                  key={category.id}
                                  variant="dot"
                                  color="gray"
                                  size="xs"
                                >
                                  {category.name}
                                </Badge>
                              ))}

                              {categories.length > 3 && (
                                <Text size="xs" c="dimmed">
                                  +{categories.length - 3} more
                                </Text>
                              )}
                            </Group>
                          )}

                          {/* Metadata */}
                          <Group gap="lg">
                            <Text size="xs" c="dimmed">
                              Updated{" "}
                              {new Date(content.updated_at).toLocaleDateString(
                                "en-PH",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </Text>

                            {content.published_at && (
                              <Text size="xs" c="dimmed">
                                Published{" "}
                                {new Date(
                                  content.published_at,
                                ).toLocaleDateString("en-PH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Text>
                            )}
                          </Group>
                        </Stack>

                        {/* Right Side */}
                        <Stack align="flex-end" gap="sm">
                          <Badge
                            variant="light"
                            color={
                              content.status === "published"
                                ? "green"
                                : content.status === "archived"
                                  ? "gray"
                                  : content.status === "pending"
                                    ? "orange"
                                    : "yellow"
                            }
                            radius="sm"
                            tt="capitalize"
                          >
                            {content.status}
                          </Badge>

                          <ArrowRight
                            size={16}
                            color="var(--mantine-color-gray-5)"
                          />
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Card>
    </Stack>
  );
}
