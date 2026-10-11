import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  Archive,
  CheckCircle,
  Edit,
  Eye,
  FileText,
  MoreVertical,
  PackageOpen,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import type { ContentStatus } from "@/types/blog-fcv/content";
import { useContents } from "@/lib/hook/blog-fcv/contents";

type ContentItem = ReturnType<typeof useContents>["contents"][number];

type ContentsDataTableProps = {
  contents: ContentItem[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  contentTypesLoading: boolean;
  contentTypeOptions: { value: string; label: string }[];
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
  onDelete: (id: number, title: string) => void;
  onFiltersChange: (filters: {
    search: string;
    status: ContentStatus | "all";
    contentTypeId: string;
  }) => void;
};

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function statusColor(status: ContentStatus) {
  switch (status) {
    case "published":
      return "green";
    case "pending":
      return "yellow";
    case "archived":
      return "gray";
    default:
      return "blue";
  }
}

function formatDate(date: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td px="xl" py="lg">
            <Group gap="md" wrap="nowrap">
              <Skeleton height={48} width={48} radius="md" />
              <Stack gap={6} style={{ flex: 1 }}>
                <Skeleton height={14} width="55%" />
                <Skeleton height={11} width="70%" />
                <Skeleton height={10} width={90} />
              </Stack>
            </Group>
          </Table.Td>
          <Table.Td px="lg" py="lg">
            <Skeleton height={22} width={100} />
          </Table.Td>
          <Table.Td px="lg" py="lg">
            <Skeleton height={22} width={100} />
          </Table.Td>
          <Table.Td px="lg" py="lg">
            <Skeleton height={22} width={80} />
          </Table.Td>
          <Table.Td px="lg" py="lg">
            <Skeleton height={22} width={115} />
          </Table.Td>
          <Table.Td px="lg" py="lg">
            <Group justify="flex-end">
              <Skeleton height={32} width={32} radius="md" />
            </Group>
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}

export default function ContentsDataTable({
  contents,
  loading,
  actionLoading,
  error,
  contentTypesLoading,
  contentTypeOptions,
  pagination,
  onPageChange,
  onRefresh,
  onView,
  onEdit,
  onCreate,
  onPublish,
  onArchive,
  onRestore,
  onDelete,
  onFiltersChange,
}: ContentsDataTableProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [contentTypeId, setContentTypeId] = useState("all");

  const hasFilters =
    search.trim() !== "" || status !== "all" || contentTypeId !== "all";

  const applyFilters = (
    nextSearch = search,
    nextStatus: ContentStatus | "all" = status,
    nextContentTypeId = contentTypeId,
  ) => {
    onFiltersChange({
      search: nextSearch.trim(),
      status: nextStatus,
      contentTypeId: nextContentTypeId,
    });
    onPageChange(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setContentTypeId("all");
    applyFilters("", "all", "all");
  };

  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const [contentToDelete, setContentToDelete] = useState<{
    id: number;
    title: string;
    slug: string;
    status: ContentStatus;
    contentType: string;
  } | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenDeleteModal = (content: ContentItem) => {
    setDeleteError(null);

    setContentToDelete({
      id: content.id,
      title: content.title,
      slug: content.slug,
      status: content.status,
      contentType: content.content_type?.name ?? "Unknown type",
    });
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;

    setContentToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!contentToDelete || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await onDelete(contentToDelete.id, contentToDelete.title);
      setContentToDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting this content.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack gap="md">
      {/* FILTERS */}
      {!loading && (
        <Paper withBorder radius="md" p="md" shadow="xs">
          <Stack gap="sm">
            <Group align="flex-end" grow>
              <TextInput
                value={searchInput}
                onChange={(event) => {
                  const nextSearch = event.currentTarget.value;
                  setSearchInput(nextSearch);
                  setSearch(nextSearch);
                  applyFilters(nextSearch, status, contentTypeId);
                }}
                placeholder="Search by title or slug..."
                label="Search"
                leftSection={<Search size={17} strokeWidth={1.8} />}
                radius="md"
              />

              <Select
                label="Status"
                placeholder="Select status"
                data={statusOptions}
                value={status}
                onChange={(value) => {
                  const nextStatus = (value as ContentStatus | "all") ?? "all";
                  setStatus(nextStatus);
                  applyFilters(search, nextStatus, contentTypeId);
                }}
                allowDeselect={false}
                radius="md"
              />

              <Select
                label="Content Type"
                placeholder="Select content type"
                data={contentTypeOptions}
                value={contentTypeId}
                onChange={(value) => {
                  const nextContentTypeId = value ?? "all";
                  setContentTypeId(nextContentTypeId);
                  applyFilters(search, status, nextContentTypeId);
                }}
                allowDeselect={false}
                disabled={contentTypesLoading}
                radius="md"
              />
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Showing{" "}
                <Text span fw={600} c="gray.7">
                  {contents.length}
                </Text>{" "}
                of{" "}
                <Text span fw={600} c="gray.7">
                  {pagination.total}
                </Text>{" "}
                contents
              </Text>

              {hasFilters && (
                <Button variant="subtle" size="xs" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>
      )}

      {/* ERROR STATE */}
      {error && (
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon color="red" variant="light" radius="xl">
                <PackageOpen size={18} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text fw={600} size="sm">
                  Unable to load contents
                </Text>
                <Text size="sm" c="dimmed">
                  {error}
                </Text>
              </Stack>
            </Group>
            <Button variant="light" color="red" onClick={onRefresh}>
              Try again
            </Button>
          </Group>
        </Paper>
      )}

      {/* CONTENT TABLE */}
      <Paper withBorder radius="md" shadow="xs" style={{ overflow: "hidden" }}>
        <ScrollArea>
          <Table
            miw={1120}
            verticalSpacing={0}
            horizontalSpacing={0}
            highlightOnHover
            styles={{
              th: {
                backgroundColor: "var(--mantine-color-default)",
                borderBottom: "1px solid var(--mantine-color-default-border)",
                color: "var(--mantine-color-dimmed)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              },
              td: {
                borderBottom: "1px solid var(--mantine-color-default-border)",
              },
              tr: { transition: "background-color 120ms ease" },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th px="xl" py="sm" w={390}>
                  Content
                </Table.Th>
                <Table.Th px="lg" py="sm" w={150}>
                  Type
                </Table.Th>
                <Table.Th px="lg" py="sm" w={250}>
                  Categories
                </Table.Th>
                <Table.Th px="lg" py="sm" w={130}>
                  Status
                </Table.Th>
                <Table.Th px="lg" py="sm" w={180}>
                  Updated
                </Table.Th>
                <Table.Th px="lg" py="sm" ta="right" w={80}>
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                <SkeletonRows />
              ) : error ? (
                <Table.Tr>
                  <Table.Td colSpan={6} py={48}>
                    <Stack align="center" gap="xs">
                      <Text fw={600} size="sm">
                        Content could not be loaded
                      </Text>
                      <Text size="xs" c="dimmed">
                        Try refreshing the list.
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : contents.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} py={70}>
                    <Stack align="center" gap="sm">
                      <ThemeIcon
                        size={56}
                        radius="xl"
                        variant="light"
                        color="gray"
                      >
                        <PackageOpen size={27} strokeWidth={1.5} />
                      </ThemeIcon>
                      <Stack align="center" gap={3}>
                        <Text fw={600} size="sm">
                          No contents found
                        </Text>
                        <Text size="xs" c="dimmed" ta="center">
                          {hasFilters
                            ? "Try adjusting your filters."
                            : "No content records available yet."}
                        </Text>
                      </Stack>
                      {!hasFilters && (
                        <Button
                          color="yellow"
                          radius="md"
                          leftSection={<Plus size={16} />}
                          onClick={onCreate}
                          styles={{ root: { backgroundColor: "#C9A227" } }}
                        >
                          Create content
                        </Button>
                      )}
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                contents.map((content) => (
                  <Table.Tr
                    key={content.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => onEdit(content.id)}
                  >
                    <Table.Td px="xl" py="lg">
                      <Group align="flex-start" wrap="nowrap" gap="md">
                        <ThemeIcon
                          size={48}
                          radius="md"
                          variant="light"
                          color={content.is_featured ? "yellow" : "blue"}
                          style={{ flexShrink: 0 }}
                        >
                          {content.is_featured ? (
                            <Star size={23} />
                          ) : (
                            <FileText size={23} />
                          )}
                        </ThemeIcon>
                        <Stack gap={5} style={{ minWidth: 0 }}>
                          <Group gap={6} wrap="wrap">
                            <Text fw={700} size="sm" c="dark" lineClamp={1}>
                              {content.title}
                            </Text>
                            {content.is_featured && (
                              <Badge size="xs" color="yellow" variant="light">
                                Featured
                              </Badge>
                            )}
                          </Group>
                          <Text size="sm" c="dimmed" lineClamp={1} maw={420}>
                            /{content.slug}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Content ID: #{content.id}
                          </Text>
                        </Stack>
                      </Group>
                    </Table.Td>

                    <Table.Td px="lg" py="lg">
                      <Badge variant="light" color="gray" radius="xl">
                        {content.content_type?.name ?? "Unknown type"}
                      </Badge>
                    </Table.Td>

                    <Table.Td px="lg" py="lg">
                      <Group gap={6} wrap="wrap">
                        {content.categories?.length ? (
                          <>
                            {content.categories.slice(0, 2).map((category) => (
                              <Badge
                                key={category.id}
                                variant="outline"
                                color="gray"
                                size="sm"
                              >
                                {category.name}
                              </Badge>
                            ))}
                            {content.categories.length > 2 && (
                              <Badge size="sm" variant="light" color="gray">
                                +{content.categories.length - 2}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Text size="xs" c="dimmed">
                            No categories
                          </Text>
                        )}
                      </Group>
                    </Table.Td>

                    <Table.Td px="lg" py="lg">
                      <Badge
                        color={statusColor(content.status)}
                        variant="light"
                        radius="xl"
                      >
                        {content.status.charAt(0).toUpperCase() +
                          content.status.slice(1)}
                      </Badge>
                    </Table.Td>

                    <Table.Td px="lg" py="lg">
                      <Stack gap={4}>
                        <Text size="sm" fw={500} c="gray.8">
                          {formatDate(content.updated_at)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {content.published_at
                            ? `Published ${formatDate(content.published_at)}`
                            : "Not published"}
                        </Text>
                      </Stack>
                    </Table.Td>

                    <Table.Td
                      px="lg"
                      py="lg"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Group justify="flex-end">
                        <Menu
                          shadow="md"
                          width={180}
                          position="bottom-end"
                          withinPortal
                          zIndex={1000}
                        >
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="md"
                              radius="md"
                              disabled={actionLoading}
                              aria-label="Content actions"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <MoreVertical size={18} strokeWidth={1.8} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<Eye size={16} />}
                              onClick={() => onView(content.id)}
                            >
                              View
                            </Menu.Item>

                            <Menu.Item
                              leftSection={<Edit size={16} />}
                              onClick={() => onEdit(content.id)}
                            >
                              Edit
                            </Menu.Item>

                            <Menu.Divider />

                            {content.status !== "published" &&
                              content.status !== "archived" && (
                                <Menu.Item
                                  leftSection={<CheckCircle size={16} />}
                                  color="green"
                                  onClick={() => onPublish(content.id)}
                                >
                                  Publish
                                </Menu.Item>
                              )}

                            {content.status !== "archived" ? (
                              <Menu.Item
                                leftSection={<Archive size={16} />}
                                onClick={() => onArchive(content.id)}
                              >
                                Archive
                              </Menu.Item>
                            ) : (
                              <Menu.Item
                                leftSection={<RotateCcw size={16} />}
                                onClick={() => onRestore(content.id)}
                              >
                                Restore
                              </Menu.Item>
                            )}

                            <Menu.Divider />

                            <Menu.Item
                              color="red"
                              leftSection={<Trash2 size={16} />}
                              onClick={() => handleOpenDeleteModal(content)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {contents.length > 0 && !loading && (
          <>
            <Divider />
            <Group justify="space-between" px="xl" py="sm">
              <Text size="xs" c="dimmed">
                Page{" "}
                <Text span fw={700} c="gray.7">
                  {pagination.currentPage}
                </Text>{" "}
                of{" "}
                <Text span fw={700} c="gray.7">
                  {pagination.lastPage}
                </Text>
              </Text>

              <Group gap={6}>
                <Tooltip label="Previous page">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    aria-label="Previous page"
                    disabled={pagination.currentPage <= 1 || actionLoading}
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                  >
                    <ChevronsLeft size={18} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Next page">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    aria-label="Next page"
                    disabled={
                      pagination.currentPage >= pagination.lastPage ||
                      actionLoading
                    }
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                  >
                    <ChevronsRight size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </>
        )}
      </Paper>

      {/* -------------------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* -------------------------------------------------------------------------- */}

      <Modal
        opened={contentToDelete !== null}
        onClose={handleCloseDeleteModal}
        centered
        size="md"
        radius="lg"
        withCloseButton={!deleting}
        closeOnClickOutside={!deleting}
        closeOnEscape={!deleting}
        title={null}
        padding="lg"
      >
        {contentToDelete && (
          <Stack gap="lg">
            {/* HEADER */}

            <Group align="flex-start" gap="md" wrap="nowrap">
              <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
                <Trash2 size={22} />
              </Box>

              <Stack gap={3}>
                <Title order={3} className="!text-[var(--text-h)]">
                  Delete Content
                </Title>

                <Text size="sm" c="dimmed">
                  This action will permanently remove this content record.
                  Please review the content information before proceeding.
                </Text>
              </Stack>
            </Group>

            {/* CONTENT INFORMATION */}

            <Paper
              withBorder
              radius="md"
              p="md"
              className="bg-[var(--mantine-color-body)]"
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" className="min-w-0">
                  <ThemeIcon
                    size={42}
                    radius="xl"
                    variant="light"
                    color="gray"
                    style={{ flex: "0 0 auto" }}
                  >
                    <FileText size={21} />
                  </ThemeIcon>

                  <Stack gap={3} className="min-w-0">
                    <Text size="sm" fw={700} lineClamp={2}>
                      {contentToDelete.title}
                    </Text>

                    <Text size="xs" c="dimmed" lineClamp={1}>
                      /{contentToDelete.slug}
                    </Text>

                    <Text size="xs" c="dimmed">
                      Content ID: #{contentToDelete.id}
                    </Text>
                  </Stack>
                </Group>

                <Badge
                  size="md"
                  variant="light"
                  color={statusColor(contentToDelete.status)}
                  style={{
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {contentToDelete.status.charAt(0).toUpperCase() +
                    contentToDelete.status.slice(1)}
                </Badge>
              </Group>

              <Divider my="sm" />

              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Content Type
                </Text>

                <Text size="sm" fw={600}>
                  {contentToDelete.contentType}
                </Text>
              </Stack>
            </Paper>

            {/* DELETE WARNING */}

            <Alert
              variant="light"
              color="red"
              radius="md"
              icon={<Trash2 size={18} />}
            >
              <Text size="sm" fw={600} mb={2}>
                This content will be deleted
              </Text>

              <Text size="xs">
                You are about to delete this content record. Make sure this is
                the correct item before continuing. If the record is linked to
                other records, the server may prevent deletion.
              </Text>
            </Alert>

            {/* ERROR */}

            {deleteError && (
              <Alert
                color="red"
                variant="light"
                radius="md"
                title="Unable to delete content"
              >
                {deleteError}
              </Alert>
            )}

            {/* ACTIONS */}

            <Group justify="flex-end" gap="sm" mt="xs">
              <Button
                variant="default"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                color="red"
                variant="filled"
                leftSection={<Trash2 size={16} />}
                loading={deleting}
                onClick={handleConfirmDelete}
              >
                Delete Content
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
