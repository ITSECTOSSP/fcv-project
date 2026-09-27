import {
  Box,
  Breadcrumbs,
  Button,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ContentFormSkeleton from "@/components/service/blog-fcv/content-form-skeleton";
import ContentForm from "@/components/service/blog-fcv/content-form";

import { useContents } from "@/lib/hook/blog-fcv/contents";
import { useCategories } from "@/lib/hook/blog-fcv/categories";
import { useContentTypes } from "@/lib/hook/blog-fcv/content-types";

import type { Content, ContentPayload } from "@/types/blog-fcv/content";

export default function EditContentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [content, setContent] = useState<Content | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { getContent, updateContent } = useContents();

  const { categories, loading: categoriesLoading } = useCategories();

  const { contentTypes, loading: contentTypesLoading } = useContentTypes();

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadContent = async () => {
      try {
        setLoadingContent(true);

        const result = await getContent(Number(id));

        console.log("EDIT CONTENT RESULT:", result);

        setContent(result);
      } catch (error) {
        console.error("GET CONTENT ERROR:", error);

        notifications.show({
          title: "Loading Failed",
          message: "Unable to load the content.",
          color: "red",
        });

        navigate("/blog/contents");
      } finally {
        setLoadingContent(false);
      }
    };

    loadContent();
  }, [id]);

  const handleSubmit = async (values: ContentPayload) => {
    if (!id) {
      return;
    }

    try {
      setSubmitting(true);

      const result = await updateContent(Number(id), values);

      console.log("UPDATE CONTENT RESULT:", result);

      notifications.show({
        title: "Content Updated",
        message: "The content has been successfully updated.",
        color: "green",
      });

      navigate("/blog/contents");
    } catch (error) {
      console.error("UPDATE CONTENT ERROR:", error);

      notifications.show({
        title: "Update Failed",
        message:
          "Unable to update the content. Please check the form and try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = content
    ? {
        content_type_id: String(content.content_type_id),

        title: content.title,

        slug: content.slug ?? "",

        excerpt: content.excerpt ?? "",

        content: content.content ?? "",

        status: content.status,

        is_featured: content.is_featured,

        published_at: content.published_at
          ? new Date(content.published_at).toISOString().slice(0, 16)
          : "",

        category_ids:
          content.categories?.map((category) => String(category.id)) ?? [],

        featured_media: null,

        banner_media: null,

        attachments: [],

        // Existing media
        existing_featured_media:
          content.media?.find((media) => media.pivot?.type === "featured") ??
          null,

        existing_banner_media:
          content.media?.find((media) => media.pivot?.type === "banner") ??
          null,

        existing_attachments:
          content.media?.filter(
            (media) => media.pivot?.type === "attachment",
          ) ?? [],
        // Media removal flags
        remove_featured_media: false,
        remove_banner_media: false,
      }
    : undefined;

  const loading = loadingContent || categoriesLoading || contentTypesLoading;

  return (
    <Stack gap="xl">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <Box>
        <Breadcrumbs mb="sm">
          <Link
            to="/blog-dashboard"
            style={{
              color: "var(--mantine-color-dimmed)",
              textDecoration: "none",
            }}
          >
            Blog
          </Link>

          <Link
            to="/blog/contents"
            style={{
              color: "var(--mantine-color-dimmed)",
              textDecoration: "none",
            }}
          >
            Contents
          </Link>

          <Text size="sm">Edit</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2}>Edit Content</Title>

            <Text size="sm" c="dimmed" mt={4}>
              Update the content and publication details for the FCV Blog.
            </Text>
          </Box>

          <Button
            variant="subtle"
            color="gray"
            leftSection={<ArrowLeft size={16} />}
            disabled={submitting}
            onClick={() => navigate("/blog/contents")}
          >
            Back to Contents
          </Button>
        </Group>
      </Box>

      {/* =========================================================
          CONTENT FORM
      ========================================================= */}

      {loading ? (
        <ContentFormSkeleton />
      ) : content ? (
        <ContentForm
          contentTypes={contentTypes}
          categories={categories}
          initialValues={initialValues}
          loading={submitting}
          onSubmit={handleSubmit}
        />
      ) : null}
    </Stack>
  );
}
