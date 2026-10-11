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

import PageTitle from "@/pages/settings/page-title";

import type { Content, ContentPayload } from "@/types/blog-fcv/content";

export default function EditContentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  /* =====================================================
     STATE
  ====================================================== */

  const [content, setContent] = useState<Content | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { getContent, updateContent } = useContents();
  const { categories, loading: categoriesLoading } = useCategories();
  const { contentTypes, loading: contentTypesLoading } = useContentTypes();

  /* =====================================================
     PAGE TITLE
  ====================================================== */

  const pageTitle = content?.title?.trim()
    ? `Edit Content — ${content.title.trim()}`
    : "Edit Content";

  /* =====================================================
     LOAD CONTENT
  ====================================================== */

  useEffect(() => {
    if (!id) {
      notifications.show({
        title: "Content Not Found",
        message: "No content ID was provided.",
        color: "red",
      });

      navigate("/blog/contents");
      setLoadingContent(false);
      return;
    }

    let cancelled = false;

    const loadContent = async () => {
      try {
        setLoadingContent(true);

        const result = await getContent(Number(id));

        if (!cancelled) {
          setContent(result);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("GET CONTENT ERROR:", error);

        notifications.show({
          title: "Loading Failed",
          message: "Unable to load the content.",
          color: "red",
        });

        navigate("/blog/contents");
      } finally {
        if (!cancelled) {
          setLoadingContent(false);
        }
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [id, getContent, navigate]);

  /* =====================================================
     UPDATE CONTENT
  ====================================================== */

  const handleSubmit = async (values: ContentPayload) => {
    if (!id) {
      return;
    }

    try {
      setSubmitting(true);

      await updateContent(Number(id), values);

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

  /* =====================================================
     FORM INITIAL VALUES
  ====================================================== */

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

  /* =====================================================
     LOADING STATE
  ====================================================== */

  const loading = loadingContent || categoriesLoading || contentTypesLoading;

  /* =====================================================
     CANCEL
  ====================================================== */

  const handleCancel = () => {
    navigate("/blog/contents");
  };

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <Stack gap="lg">
      {/* SHARED APP LAYOUT PAGE TITLE */}
      <PageTitle title={pageTitle} />

      {/* HEADER */}
      <Box>

        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2}>Edit Content</Title>

            <Text size="sm" c="dimmed" mt={4}>
              Update the content and publication details for the FCV Blog.
            </Text>
          </Box>

          <Button
            variant="default"
            leftSection={<ArrowLeft size={17} />}
            disabled={submitting}
            onClick={handleCancel}
          >
            Back to Contents
          </Button>
        </Group>
      </Box>

      {/* CONTENT FORM */}
      {loading ? (
        <ContentFormSkeleton />
      ) : content ? (
        <ContentForm
          key={content.id}
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
