import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentsDataTable from "@/components/service/blog-fcv/content-table";
import { useContents } from "@/lib/hook/blog-fcv/contents";
import { useContentTypes } from "@/lib/hook/blog-fcv/content-types";
import type { ContentStatus } from "@/types/blog-fcv/content";

const PER_PAGE = 15;

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

  // Keep API filters and pagination state in the page.
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [contentTypeId, setContentTypeId] = useState("all");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    void fetchContents({
      search: search || undefined,
      status: status === "all" ? undefined : status,
      content_type_id:
        contentTypeId === "all" ? undefined : Number(contentTypeId),
      page,
      per_page: PER_PAGE,
    });
  }, [search, status, contentTypeId, page, fetchContents]);

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

  // Receive the active filters from the combined table component.
  const handleFiltersChange = (filters: {
    search: string;
    status: ContentStatus | "all";
    contentTypeId: string;
  }) => {
    setSearch(filters.search);
    setStatus(filters.status);
    setContentTypeId(filters.contentTypeId);
    setPage(1);
  };

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
    } catch (err) {
      console.error("REFRESH CONTENTS ERROR:", err);

      notifications.show({
        title: "Refresh Failed",
        message: "Unable to refresh the content list.",
        color: "red",
      });
    }
  };

  const handleDelete = async (contentId: number, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await deleteContent(contentId);

      notifications.show({
        title: "Content Deleted",
        message: "The content has been successfully deleted.",
        color: "green",
      });

      if (contents.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (err) {
      console.error("DELETE CONTENT ERROR:", err);

      notifications.show({
        title: "Delete Failed",
        message: "Unable to delete the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (contentId: number) => {
    try {
      setActionLoading(true);
      await publishContent(contentId);

      notifications.show({
        title: "Content Published",
        message: "The content has been successfully published.",
        color: "green",
      });
    } catch (err) {
      console.error("PUBLISH CONTENT ERROR:", err);

      notifications.show({
        title: "Publish Failed",
        message: "Unable to publish the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (contentId: number) => {
    try {
      setActionLoading(true);
      await archiveContent(contentId);

      notifications.show({
        title: "Content Archived",
        message: "The content has been archived.",
        color: "green",
      });
    } catch (err) {
      console.error("ARCHIVE CONTENT ERROR:", err);

      notifications.show({
        title: "Archive Failed",
        message: "Unable to archive the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (contentId: number) => {
    try {
      setActionLoading(true);
      await restoreContent(contentId);

      notifications.show({
        title: "Content Restored",
        message: "The content has been restored.",
        color: "green",
      });
    } catch (err) {
      console.error("RESTORE CONTENT ERROR:", err);

      notifications.show({
        title: "Restore Failed",
        message: "Unable to restore the content.",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      {/* Page header */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2}>Contents</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Manage all content published on the FCV Blog.
            </Text>
          </Box>

          <Button
            leftSection={<Plus size={17} />}
            onClick={() => navigate("/blog/create-content")}
          >
            Create Content
          </Button>
        </Group>
      </Box>

      {/* Combined filters and table */}
      <ContentsDataTable
        contents={contents}
        loading={loading}
        error={error}
        actionLoading={actionLoading}
        contentTypesLoading={contentTypesLoading}
        contentTypeOptions={contentTypeOptions}
        pagination={pagination}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        onPageChange={setPage}
        onView={(contentId) => navigate(`/blog/contents/${contentId}`)}
        onEdit={(contentId) => navigate(`/blog/edit-content/${contentId}`)}
        onCreate={() => navigate("/blog/create-content")}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />
    </Stack>
  );
}
