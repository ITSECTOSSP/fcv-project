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
  Skeleton,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Archive,
  ArrowRight,
  CheckCircle,
  Edit,
  Eye,
  FileText,
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

import type { ContentStatus } from "@/types/blog-fcv/content";

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

function ContentTableSkeletonRow() {
  return (
    <Table.Tr>
      {/* Content */}
      <Table.Td>
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <Skeleton width={40} height={40} radius="sm" />

          <Stack gap={5} style={{ flex: 1 }}>
            <Group gap="xs">
              <Skeleton height={14} width="55%" radius="sm" />

              <Skeleton height={18} width={58} radius="sm" />
            </Group>

            <Skeleton height={11} width="65%" radius="sm" />

            <Skeleton height={10} width={80} radius="sm" />
          </Stack>
        </Group>
      </Table.Td>

      {/* Content Type */}
      <Table.Td>
        <Skeleton height={24} width={90} radius="sm" />
      </Table.Td>

      {/* Categories */}
      <Table.Td>
        <Group gap={5}>
          <Skeleton height={21} width={70} radius="sm" />

          <Skeleton height={21} width={85} radius="sm" />
        </Group>
      </Table.Td>

      {/* Status */}
      <Table.Td>
        <Skeleton height={24} width={70} radius="sm" />
      </Table.Td>

      {/* Updated */}
      <Table.Td>
        <Stack gap={5}>
          <Skeleton height={13} width={100} radius="sm" />

          <Skeleton height={10} width={125} radius="sm" />
        </Stack>
      </Table.Td>

      {/* Actions */}
      <Table.Td>
        <Group justify="flex-end">
          <Skeleton height={28} width={28} radius="sm" />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
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
        radius="lg"
        padding={0}
        style={{
          overflow: "hidden",
        }}
      >
        <Table.ScrollContainer minWidth={1050}>
          <Table
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="lg"
            striped={false}
          >
            <Table.Thead>
              <Table.Tr
                style={{
                  backgroundColor: "var(--mantine-color-gray-0)",
                }}
              >
                <Table.Th w={390}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Content
                  </Text>
                </Table.Th>

                <Table.Th w={150}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Type
                  </Text>
                </Table.Th>

                <Table.Th w={250}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Categories
                  </Text>
                </Table.Th>

                <Table.Th w={130}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Status
                  </Text>
                </Table.Th>

                <Table.Th w={150}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Updated
                  </Text>
                </Table.Th>

                <Table.Th ta="right" w={60}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Actions
                  </Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                <>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <ContentTableSkeletonRow
                      key={`content-skeleton-${index}`}
                    />
                  ))}
                </>
              ) : contents.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Box py={70}>
                      <Stack align="center" gap="xs">
                        <Box
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            backgroundColor: "var(--mantine-color-gray-1)",
                          }}
                        >
                          <Search
                            size={26}
                            color="var(--mantine-color-gray-6)"
                          />
                        </Box>

                        <Text fw={600} mt={4}>
                          No contents found
                        </Text>

                        <Text size="sm" c="dimmed" ta="center" maw={400}>
                          {search || status !== "all" || contentTypeId !== "all"
                            ? "No content matches your current filters. Try adjusting your search or filters."
                            : "There are no content records yet. Create your first publication to get started."}
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
                  <Table.Tr
                    key={content.id}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/blog/edit-content/${content.id}`)}
                  >
                    {/* =================================================
                  CONTENT
                  ================================================= */}
                    <Table.Td>
                      <Group gap="sm" align="flex-start" wrap="nowrap">
                        {/* Content Icon */}
                        <Box
                          style={{
                            flexShrink: 0,
                            width: 40,
                            height: 40,
                            borderRadius: 9,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: content.is_featured
                              ? "var(--mantine-color-yellow-1)"
                              : "var(--mantine-color-gray-1)",
                          }}
                        >
                          {content.is_featured ? (
                            <Star
                              size={17}
                              fill="currentColor"
                              color="var(--mantine-color-yellow-7)"
                            />
                          ) : (
                            <FileText
                              size={17}
                              color="var(--mantine-color-gray-6)"
                            />
                          )}
                        </Box>

                        <Stack gap={3} style={{ minWidth: 0 }}>
                          <Group gap={6} wrap="nowrap">
                            <Text fw={600} size="sm" lineClamp={1} maw={310}>
                              {content.title}
                            </Text>

                            {content.is_featured && (
                              <Badge
                                size="xs"
                                variant="light"
                                color="yellow"
                                radius="sm"
                              >
                                Featured
                              </Badge>
                            )}
                          </Group>

                          <Text size="xs" c="dimmed" lineClamp={1} maw={330}>
                            /{content.slug}
                          </Text>

                          <Text size="xs" c="dimmed">
                            ID #{content.id}
                          </Text>
                        </Stack>
                      </Group>
                    </Table.Td>

                    {/* =================================================
                  CONTENT TYPE
                  ================================================= */}
                    <Table.Td>
                      <Badge variant="light" color="gray" radius="sm" size="sm">
                        {content.content_type?.name ?? "—"}
                      </Badge>
                    </Table.Td>

                    {/* =================================================
                  CATEGORIES
                  ================================================= */}
                    <Table.Td>
                      {content.categories && content.categories.length > 0 ? (
                        <Group gap={5} wrap="wrap" maw={250}>
                          {content.categories.slice(0, 2).map((category) => (
                            <Badge
                              key={category.id}
                              variant="outline"
                              color="gray"
                              size="xs"
                              radius="sm"
                            >
                              {category.name}
                            </Badge>
                          ))}

                          {content.categories.length > 2 && (
                            <Tooltip
                              label={content.categories
                                .slice(2)
                                .map((category) => category.name)
                                .join(", ")}
                              withArrow
                            >
                              <Badge
                                variant="light"
                                color="gray"
                                size="xs"
                                radius="sm"
                              >
                                +{content.categories.length - 2}
                              </Badge>
                            </Tooltip>
                          )}
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">
                          No categories
                        </Text>
                      )}
                    </Table.Td>

                    {/* =================================================
                  STATUS
                  ================================================= */}
                    <Table.Td>
                      <Badge
                        color={getStatusColor(content.status)}
                        variant="light"
                        radius="sm"
                        size="sm"
                      >
                        {formatStatus(content.status)}
                      </Badge>
                    </Table.Td>

                    {/* =================================================
                  UPDATED
                  ================================================= */}
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>
                          {formatDate(content.updated_at)}
                        </Text>

                        {content.published_at ? (
                          <Group gap={4}>
                            <CheckCircle
                              size={12}
                              color="var(--mantine-color-green-6)"
                            />

                            <Text size="xs" c="dimmed">
                              Published {formatDate(content.published_at)}
                            </Text>
                          </Group>
                        ) : (
                          <Text size="xs" c="dimmed">
                            Not published
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>

                    {/* =================================================
                  ACTIONS
                  ================================================= */}
                    <Table.Td onClick={(event) => event.stopPropagation()}>
                      <Menu
                        shadow="md"
                        width={190}
                        position="bottom-end"
                        withArrow
                      >
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="md"
                            disabled={actionLoading}
                            onClick={(event) => event.stopPropagation()}
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
                            View Content
                          </Menu.Item>

                          {/* EDIT */}
                          <Menu.Item
                            leftSection={<Edit size={15} />}
                            onClick={() =>
                              navigate(`/blog/edit-content/${content.id}`)
                            }
                          >
                            Edit Content
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

        {/* =====================================================
      PAGINATION
      ===================================================== */}
        {!loading && pagination.lastPage > 1 && (
          <Group
            justify="space-between"
            px="lg"
            py="md"
            style={{
              borderTop: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            <Text size="xs" c="dimmed">
              Page {pagination.currentPage} of {pagination.lastPage}
            </Text>

            <Pagination
              value={pagination.currentPage}
              onChange={setPage}
              total={pagination.lastPage}
              disabled={actionLoading}
              size="sm"
            />
          </Group>
        )}
      </Card>
    </Stack>
  );
}
