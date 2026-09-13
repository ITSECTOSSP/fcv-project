import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Menu,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Archive,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useContents } from "@/lib/hook/blog-fcv/contents";
import { useContentTypes } from "@/lib/hook/blog-fcv/content-types";

import type { ContentStatus } from "@/lib/api/blog-fcv/contents";

const PER_PAGE = 15;

const statusOptions = [
  {
    value: "all",
    label: "All Statuses",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "published",
    label: "Published",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

function getStatusColor(status: ContentStatus) {
  switch (status) {
    case "published":
      return "green";

    case "pending":
      return "yellow";

    case "archived":
      return "gray";

    case "draft":
    default:
      return "blue";
  }
}

function formatStatus(status: ContentStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export default function ContentsPage() {
  const navigate = useNavigate();

  const {
    contents,
    loading,
    error,
    pagination,
    fetchContents,
    deleteContent,
    publishContent,
    archiveContent,
    restoreContent,
  } = useContents();

  const { contentTypes, loading: contentTypesLoading } = useContentTypes();

  /*
   * =========================================================
   * FILTER STATE
   * =========================================================
   */

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<ContentStatus | "all">("all");

  const [contentTypeId, setContentTypeId] = useState<string>("all");

  const [page, setPage] = useState(1);

  const [actionLoading, setActionLoading] = useState(false);

  /*
   * =========================================================
   * FETCH CONTENTS
   * =========================================================
   *
   * Uses the existing API through useContents().
   *
   * API receives:
   * search
   * status
   * content_type_id
   * page
   * per_page
   *
   * =========================================================
   */

  useEffect(() => {
    fetchContents({
      search: search || undefined,

      status: status === "all" ? undefined : status,

      content_type_id:
        contentTypeId === "all" ? undefined : Number(contentTypeId),

      page,
      per_page: PER_PAGE,
    });
  }, [search, status, contentTypeId, page, fetchContents]);

  /*
   * =========================================================
   * CONTENT TYPE OPTIONS
   * =========================================================
   */

  const contentTypeOptions = [
    {
      value: "all",
      label: "All Content Types",
    },
    ...contentTypes.map((type) => ({
      value: String(type.id),
      label: type.name,
    })),
  ];

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /*
   * =========================================================
   * CLEAR FILTERS
   * =========================================================
   */

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setContentTypeId("all");
    setPage(1);
  };

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  const handleRefresh = async () => {
    try {
      await fetchContents({
        search: search || undefined,

        status: status === "all" ? undefined : status,

        content_type_id:
          contentTypeId === "all" ? undefined : Number(contentTypeId),

        page,
        per_page: PER_PAGE,
      });

      notifications.show({
        title: "Contents Refreshed",
        message: "The content list has been successfully refreshed.",
        color: "green",
      });
    } catch (error) {
      console.error("REFRESH CONTENTS ERROR:", error);

      notifications.show({
        title: "Refresh Failed",
        message: "Unable to refresh the content list.",
        color: "red",
      });
    }
  };

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  const handleDelete = async (contentId: number, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await deleteContent(contentId);

      notifications.show({
        title: "Content Deleted",
        message: "The content has been successfully deleted.",
        color: "green",
      });

      /*
       * If the current page becomes empty after deletion,
       * move back one page.
       */
      if (contents.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      console.error("DELETE CONTENT ERROR:", error);

      notifications.show({
        title: "Delete Failed",
        message: "Unable to delete the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * PUBLISH
   * =========================================================
   */

  const handlePublish = async (contentId: number) => {
    try {
      setActionLoading(true);

      await publishContent(contentId);

      notifications.show({
        title: "Content Published",
        message: "The content has been successfully published.",
        color: "green",
      });
    } catch (error) {
      console.error("PUBLISH CONTENT ERROR:", error);

      notifications.show({
        title: "Publish Failed",
        message: "Unable to publish the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * ARCHIVE
   * =========================================================
   */

  const handleArchive = async (contentId: number) => {
    try {
      setActionLoading(true);

      await archiveContent(contentId);

      notifications.show({
        title: "Content Archived",
        message: "The content has been archived.",
        color: "green",
      });
    } catch (error) {
      console.error("ARCHIVE CONTENT ERROR:", error);

      notifications.show({
        title: "Archive Failed",
        message: "Unable to archive the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * RESTORE
   * =========================================================
   */

  const handleRestore = async (contentId: number) => {
    try {
      setActionLoading(true);

      await restoreContent(contentId);

      notifications.show({
        title: "Content Restored",
        message: "The content has been restored.",
        color: "green",
      });
    } catch (error) {
      console.error("RESTORE CONTENT ERROR:", error);

      notifications.show({
        title: "Restore Failed",
        message: "Unable to restore the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <Stack gap="xl">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <Box>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2}>Contents</Title>

            <Text size="sm" c="dimmed" mt={4}>
              Manage all content published on the FCV Blog.
            </Text>
          </Box>

          <Group>
            <Tooltip label="Refresh contents">
              <ActionIcon
                variant="default"
                size="lg"
                onClick={handleRefresh}
                loading={loading}
                disabled={actionLoading}
              >
                <RefreshCw size={17} />
              </ActionIcon>
            </Tooltip>

            <Button
              color="yellow"
              leftSection={<Plus size={17} />}
              onClick={() => navigate("/blog/create-content")}
            >
              Create Content
            </Button>
          </Group>
        </Group>
      </Box>

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <Card withBorder radius="md" padding="md">
        <Group align="flex-end" wrap="wrap">
          <TextInput
            flex={1}
            miw={280}
            label="Search"
            placeholder="Search title or slug..."
            leftSection={<Search size={16} />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.currentTarget.value)}
            onKeyDown={handleSearchKeyDown}
          />

          <Button
            variant="light"
            leftSection={<Search size={16} />}
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>

          <Select
            w={{
              base: "100%",
              sm: 190,
            }}
            label="Status"
            data={statusOptions}
            value={status}
            onChange={(value) => {
              setStatus((value as ContentStatus | "all") ?? "all");
              setPage(1);
            }}
            allowDeselect={false}
          />

          <Select
            w={{
              base: "100%",
              sm: 220,
            }}
            label="Content Type"
            data={contentTypeOptions}
            value={contentTypeId}
            onChange={(value) => {
              setContentTypeId(value ?? "all");
              setPage(1);
            }}
            allowDeselect={false}
            disabled={contentTypesLoading}
          />
        </Group>

        {(search || status !== "all" || contentTypeId !== "all") && (
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" size="xs" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Group>
        )}
      </Card>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <Card withBorder radius="md" padding="md">
          <Group justify="space-between">
            <Box>
              <Text fw={600} c="red">
                Unable to load contents
              </Text>

              <Text size="sm" c="dimmed">
                {error}
              </Text>
            </Box>

            <Button variant="light" color="red" onClick={handleRefresh}>
              Try Again
            </Button>
          </Group>
        </Card>
      )}

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      {!loading && !error && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Showing{" "}
            <Text span fw={600} c="dark">
              {contents.length}
            </Text>{" "}
            of{" "}
            <Text span fw={600} c="dark">
              {pagination.total}
            </Text>{" "}
            content
            {pagination.total !== 1 ? "s" : ""}
          </Text>

          <Text size="xs" c="dimmed">
            Page {pagination.currentPage} of {pagination.lastPage}
          </Text>
        </Group>
      )}

      {/* =====================================================
          CONTENT TABLE
          ===================================================== */}

      <Card
        withBorder
        radius="md"
        padding={0}
        style={{
          overflow: "hidden",
        }}
      >
        <Table.ScrollContainer minWidth={1100}>
          <Table highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Content</Table.Th>

                <Table.Th>Type</Table.Th>

                <Table.Th>Categories</Table.Th>

                <Table.Th>Status</Table.Th>

                <Table.Th>Published</Table.Th>

                <Table.Th>Updated</Table.Th>

                <Table.Th ta="right" w={70}>
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Box py={60}>
                      <Stack align="center" gap="xs">
                        <RefreshCw size={28} className="animate-spin" />

                        <Text size="sm" c="dimmed">
                          Loading contents...
                        </Text>
                      </Stack>
                    </Box>
                  </Table.Td>
                </Table.Tr>
              ) : contents.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Box py={60}>
                      <Stack align="center" gap="xs">
                        <Search size={34} opacity={0.4} />

                        <Text fw={600}>No contents found</Text>

                        <Text size="sm" c="dimmed" ta="center">
                          {search || status !== "all" || contentTypeId !== "all"
                            ? "Try changing your filters."
                            : "Create your first content to get started."}
                        </Text>

                        {!search &&
                          status === "all" &&
                          contentTypeId === "all" && (
                            <Button
                              mt="sm"
                              color="yellow"
                              leftSection={<Plus size={16} />}
                              onClick={() => navigate("/blog/contents/create")}
                            >
                              Create Content
                            </Button>
                          )}
                      </Stack>
                    </Box>
                  </Table.Td>
                </Table.Tr>
              ) : (
                contents.map((content) => (
                  <Table.Tr key={content.id}>
                    {/* CONTENT */}
                    <Table.Td>
                      <Stack gap={3}>
                        <Group gap="xs" wrap="nowrap">
                          {content.is_featured && (
                            <Tooltip label="Featured content">
                              <Star size={15} fill="currentColor" />
                            </Tooltip>
                          )}

                          <Text fw={600} lineClamp={1} maw={350}>
                            {content.title}
                          </Text>
                        </Group>

                        <Text size="xs" c="dimmed" lineClamp={1} maw={350}>
                          /{content.slug}
                        </Text>
                      </Stack>
                    </Table.Td>

                    {/* CONTENT TYPE */}
                    <Table.Td>
                      <Text size="sm">{content.content_type?.name ?? "—"}</Text>
                    </Table.Td>

                    {/* CATEGORIES */}
                    <Table.Td>
                      <Group gap={4} wrap="wrap" maw={280}>
                        {content.categories?.slice(0, 3).map((category) => (
                          <Badge key={category.id} variant="light" size="sm">
                            {category.name}
                          </Badge>
                        ))}

                        {(content.categories?.length ?? 0) > 3 && (
                          <Badge size="sm" variant="outline">
                            +{(content.categories?.length ?? 0) - 3}
                          </Badge>
                        )}

                        {!content.categories?.length && (
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                        )}
                      </Group>
                    </Table.Td>

                    {/* STATUS */}
                    <Table.Td>
                      <Badge
                        color={getStatusColor(content.status)}
                        variant="light"
                      >
                        {formatStatus(content.status)}
                      </Badge>
                    </Table.Td>

                    {/* PUBLISHED */}
                    <Table.Td>
                      <Text size="sm">{formatDate(content.published_at)}</Text>
                    </Table.Td>

                    {/* UPDATED */}
                    <Table.Td>
                      <Text size="sm">{formatDate(content.updated_at)}</Text>
                    </Table.Td>

                    {/* ACTIONS */}
                    <Table.Td>
                      <Menu shadow="md" width={190} position="bottom-end">
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={actionLoading}
                          >
                            <MoreVertical size={18} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {/* VIEW */}
                          <Menu.Item
                            leftSection={<Eye size={15} />}
                            onClick={() =>
                              navigate(`/blog/contents/${content.id}`)
                            }
                          >
                            View
                          </Menu.Item>

                          {/* EDIT */}
                          <Menu.Item
                            leftSection={<Edit size={15} />}
                            onClick={() =>
                              navigate(`/blog/contents/${content.id}/edit`)
                            }
                          >
                            Edit
                          </Menu.Item>

                          <Menu.Divider />

                          {/* PUBLISH */}
                          {content.status !== "published" &&
                            content.status !== "archived" && (
                              <Menu.Item
                                color="green"
                                leftSection={<Eye size={15} />}
                                onClick={() => handlePublish(content.id)}
                              >
                                Publish
                              </Menu.Item>
                            )}

                          {/* ARCHIVE */}
                          {content.status !== "archived" && (
                            <Menu.Item
                              color="orange"
                              leftSection={<Archive size={15} />}
                              onClick={() => handleArchive(content.id)}
                            >
                              Archive
                            </Menu.Item>
                          )}

                          {/* RESTORE */}
                          {content.status === "archived" && (
                            <Menu.Item
                              color="blue"
                              leftSection={<RotateCcw size={15} />}
                              onClick={() => handleRestore(content.id)}
                            >
                              Restore
                            </Menu.Item>
                          )}

                          <Menu.Divider />

                          {/* DELETE */}
                          <Menu.Item
                            color="red"
                            leftSection={<Trash2 size={15} />}
                            onClick={() =>
                              handleDelete(content.id, content.title)
                            }
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* ===================================================
            PAGINATION
            =================================================== */}

        {!loading && pagination.lastPage > 1 && (
          <Group
            justify="center"
            py="md"
            style={{
              borderTop: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            <Pagination
              value={pagination.currentPage}
              onChange={setPage}
              total={pagination.lastPage}
              disabled={actionLoading}
            />
          </Group>
        )}
      </Card>
    </Stack>
  );
}
