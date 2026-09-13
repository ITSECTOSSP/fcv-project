import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import { ArrowRight, Plus } from "lucide-react";

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

      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2}>Blog Dashboard</Title>

          <Text c="dimmed" size="sm" mt={4}>
            Manage and monitor your FCV Blog content.
          </Text>
        </Box>

        <Button
          leftSection={<Plus size={16} />}
          color="yellow"
          onClick={() => navigate("/blog/create-content")}
        >
          Create Content
        </Button>
      </Group>

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
                RECENT CONTENTS + QUICK ACTIONS
                ================================================= */}

      <div
        className="
                    grid
                    grid-cols-1
                    gap-6
                    lg:grid-cols-2
                "
      >
        {/* =================================================
                    RECENT CONTENTS
                    ================================================= */}

        <Card withBorder radius="lg" padding="lg">
          <Group justify="space-between" mb="md">
            <Box>
              <Title order={4}>Recent Contents</Title>

              <Text size="sm" c="dimmed">
                Recently updated content records.
              </Text>
            </Box>

            <Button
              variant="subtle"
              color="dark"
              size="compact-sm"
              rightSection={<ArrowRight size={14} />}
              onClick={() => navigate("/blog/contents")}
            >
              View all
            </Button>
          </Group>

          {recentContents.length === 0 ? (
            <Text size="sm" c="dimmed">
              No content records found.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={420}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Title</Table.Th>

                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {recentContents.map((content) => (
                    <Table.Tr key={content.id}>
                      <Table.Td>
                        <Text size="sm" fw={500} lineClamp={1}>
                          {content.title}
                        </Text>

                        <Text size="xs" c="dimmed">
                          {new Date(content.updated_at).toLocaleDateString()}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge
                          color={
                            content.status === "published"
                              ? "green"
                              : content.status === "archived"
                                ? "gray"
                                : content.status === "pending"
                                  ? "orange"
                                  : "yellow"
                          }
                        >
                          {content.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Card>

        {/* =================================================
                    QUICK ACTIONS
                    ================================================= */}

        <Card withBorder radius="lg" padding="lg">
          <Title order={4}>Quick Actions</Title>

          <Text size="sm" c="dimmed" mb="md">
            Frequently used blog management tools.
          </Text>

          <Stack gap="sm">
            <Button
              fullWidth
              justify="space-between"
              variant="light"
              color="yellow"
              rightSection={<ArrowRight size={16} />}
              onClick={() => navigate("/blog/create-content")}
            >
              Create Content
            </Button>

            <Button
              fullWidth
              justify="space-between"
              variant="light"
              color="gray"
              rightSection={<ArrowRight size={16} />}
              onClick={() => navigate("/blog/categories")}
            >
              Manage Categories
            </Button>

            <Button
              fullWidth
              justify="space-between"
              variant="light"
              color="gray"
              rightSection={<ArrowRight size={16} />}
              onClick={() => navigate("/blog/content-types")}
            >
              Manage Content Types
            </Button>

            <Button
              fullWidth
              justify="space-between"
              variant="light"
              color="gray"
              rightSection={<ArrowRight size={16} />}
              onClick={() => navigate("/blog/media")}
            >
              Open Media Library
            </Button>
          </Stack>
        </Card>
      </div>
    </Stack>
  );
}
