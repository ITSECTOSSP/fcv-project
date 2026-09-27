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
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import ContentForm from "@/components/service/blog-fcv/content-form";

import { useContents } from "@/lib/hook/blog-fcv/contents";
import { useCategories } from "@/lib/hook/blog-fcv/categories";
import { useContentTypes } from "@/lib/hook/blog-fcv/content-types";

export default function CreateContentPage() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const { createContent } = useContents();

  const { categories, loading: categoriesLoading } = useCategories();

  const { contentTypes, loading: contentTypesLoading } = useContentTypes();

  const handleSubmit = async (values: Parameters<typeof createContent>[0]) => {
    try {
      setSubmitting(true);

      const result = await createContent(values);

      console.log("CREATE CONTENT RESULT:", result);

      notifications.show({
        title: "Content Created",
        message: "The content has been successfully created.",
        color: "green",
      });

      navigate("/blog-dashboard");
    } catch (error) {
      console.error("CREATE CONTENT ERROR:", error);

      notifications.show({
        title: "Creation Failed",
        message:
          "Unable to create the content. Please check the form and try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loading = categoriesLoading || contentTypesLoading;

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

          <Text size="sm">Create</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2}>Create New Content</Title>

            <Text size="sm" c="dimmed" mt={4}>
              Create and publish a new piece of content for the FCV Blog.
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

      <ContentForm
        contentTypes={contentTypes}
        categories={categories}
        loading={loading || submitting}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
