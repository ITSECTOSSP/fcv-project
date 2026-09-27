import {
  Button,
  Card,
  Checkbox,
  Divider,
  FileInput,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
  Select,
} from "@mantine/core";
import { useEffect } from "react";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useForm } from "@mantine/form";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extensions";
import { FileText, Image, Paperclip, RotateCcw, Save } from "lucide-react";
import { mediaApi } from "@/lib/api/blog-fcv/media";

import ContentMediaField from "@/components/service/blog-fcv/content-form-media";

import type { ContentType } from "@/types/blog-fcv/content-type";
import type { Category } from "@/types/blog-fcv/category";

import type {
  ContentMedia,
  ContentPayload,
  ContentStatus,
} from "@/types/blog-fcv/content";
import { notifications } from "@mantine/notifications";

interface ContentFormValues {
  content_type_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ContentStatus;
  is_featured: boolean;
  published_at: string;
  category_ids: string[];
  featured_media: File | null;
  banner_media: File | null;
  attachments: File[];

  // Existing files
  existing_featured_media: ContentMedia | null;
  existing_banner_media: ContentMedia | null;
  existing_attachments: ContentMedia[];

  remove_featured_media: boolean;
  remove_banner_media: boolean;
}

interface ContentFormProps {
  contentTypes: ContentType[];
  categories: Category[];
  initialValues?: ContentFormValues;
  loading?: boolean;
  onSubmit: (values: ContentPayload) => Promise<void> | void;
}

const MAX_CONTENT_CHARACTERS = 10000;

const MAX_FEATURED_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_BANNER_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20 MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ContentForm({
  contentTypes,
  categories,
  initialValues,
  loading = false,
  onSubmit,
}: ContentFormProps) {
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const defaultValues: ContentFormValues = {
    content_type_id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft",
    is_featured: false,
    published_at: "",
    category_ids: [],
    featured_media: null,
    banner_media: null,
    attachments: [],

    // Existing media
    existing_featured_media: null,
    existing_banner_media: null,
    existing_attachments: [],

    remove_featured_media: false,
    remove_banner_media: false,
  };

  const isEditMode = Boolean(initialValues);

  const form = useForm<ContentFormValues>({
    initialValues: initialValues ?? defaultValues,

    validate: {
      content_type_id: (value) => (value ? null : "Content type is required"),

      title: (value) => {
        const title = value.trim();

        if (!title) {
          return "Title is required";
        }

        if (title.length > 255) {
          return "Title must not exceed 255 characters";
        }

        return null;
      },

      slug: (value) => {
        const slug = value.trim();

        if (!slug) {
          return "Slug is required";
        }

        if (slug.length > 255) {
          return "Slug must not exceed 255 characters";
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
          return "Slug may only contain lowercase letters, numbers, and hyphens";
        }

        return null;
      },

      excerpt: (value) => {
        if (value.trim().length > 1000) {
          return "Excerpt must not exceed 1,000 characters";
        }

        return null;
      },

      content: (value) => {
        const plainText = value
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim();

        if (plainText.length > MAX_CONTENT_CHARACTERS) {
          return `Content must not exceed ${MAX_CONTENT_CHARACTERS.toLocaleString()} characters`;
        }

        return null;
      },

      published_at: (value, values) => {
        if (!value) {
          return null;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "Invalid publication date";
        }

        if (values.status === "published" && date.getTime() > Date.now()) {
          return "Published date cannot be in the future";
        }

        return null;
      },

      featured_media: (file, values) => {
        if (!file && !values.existing_featured_media) {
          return "Featured image is required";
        }

        if (!file) {
          return null;
        }

        if (!IMAGE_TYPES.includes(file.type)) {
          return "Featured image must be JPG, PNG, or WebP";
        }

        if (file.size > MAX_FEATURED_IMAGE_SIZE) {
          return "Featured image must not exceed 5 MB";
        }

        return null;
      },

      banner_media: (file, values) => {
        if (!file && !values.existing_banner_media) {
          return "Banner image is required";
        }

        if (!file) {
          return null;
        }

        if (!IMAGE_TYPES.includes(file.type)) {
          return "Banner image must be JPG, PNG, or WebP";
        }

        if (file.size > MAX_BANNER_IMAGE_SIZE) {
          return "Banner image must not exceed 10 MB";
        }

        return null;
      },

      attachments: (files) => {
        if (!files || files.length === 0) {
          return null;
        }

        const invalidFile = files.find((file) => !(file instanceof File));

        if (invalidFile) {
          return "Invalid attachment";
        }

        const oversized = files.find((file) => file.size > MAX_ATTACHMENT_SIZE);

        if (oversized) {
          return `"${oversized.name}" exceeds the 20 MB limit`;
        }

        return null;
      },
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      CharacterCount.configure({
        limit: MAX_CONTENT_CHARACTERS,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      form.setFieldValue("content", editor.getHTML());
    },
  });

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    form.setValues(initialValues);
    form.resetDirty(initialValues);

    editor?.commands.setContent(initialValues.content || "");
  }, [initialValues, editor]);

  const handleSubmit = async (values: ContentFormValues) => {
    const payload: ContentPayload = {
      content_type_id: Number(values.content_type_id),
      title: values.title.trim(),
      slug: values.slug.trim() || null,
      excerpt: values.excerpt.trim() || null,
      content: values.content.trim() || null,
      status: values.status,
      is_featured: values.is_featured,
      published_at: values.published_at || null,
      category_ids: values.category_ids.map(Number),

      featured_media: values.featured_media,
      banner_media: values.banner_media,
      attachments: values.attachments,

      remove_featured_media: values.remove_featured_media,
      remove_banner_media: values.remove_banner_media,
    };

    await onSubmit(payload);
  };

  const contentTypeOptions = contentTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  const characterCount = editor?.storage.characterCount.characters() ?? 0;

  const wordCount = editor?.storage.characterCount.words() ?? 0;

  const characterLimitReached = characterCount >= MAX_CONTENT_CHARACTERS;

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit, (errors) => {
        const errorMessages = Object.entries(errors)
          .filter(([, error]) => error)
          .map(([field, error]) => {
            const label = field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase());

            return {
              field: label,
              message: String(error),
            };
          });

        notifications.show({
          title: "Please correct the following errors",
          message: (
            <Stack gap={4}>
              {errorMessages.map(({ field, message }) => (
                <Text key={field} size="sm">
                  • <strong>{field}:</strong> {message}
                </Text>
              ))}
            </Stack>
          ),
          color: "red",
          autoClose: 8000,
        });
      })}
    >
      <Stack gap="lg">
        {/* =========================================================
            BASIC INFORMATION
        ========================================================= */}

        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <Group gap="sm">
              <FileText size={20} />

              <div>
                <Text fw={600}>Basic Information</Text>

                <Text size="sm" c="dimmed">
                  Provide the basic details of your content.
                </Text>
              </div>
            </Group>

            <Divider />

            <Grid>
              <Grid.Col
                span={{
                  base: 12,
                  md: 6,
                }}
              >
                <Select
                  label="Content Type"
                  placeholder="Select content type"
                  data={contentTypeOptions}
                  searchable
                  clearable
                  withAsterisk
                  disabled={loading}
                  {...form.getInputProps("content_type_id")}
                />
              </Grid.Col>

              <Grid.Col
                span={{
                  base: 12,
                  md: 6,
                }}
              >
                <Select
                  label="Status"
                  placeholder="Select status"
                  data={[
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
                  ]}
                  disabled={loading}
                  {...form.getInputProps("status")}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Title"
                  placeholder="Enter content title"
                  withAsterisk
                  maxLength={255}
                  disabled={loading}
                  {...form.getInputProps("title")}
                  onBlur={(event) => {
                    form.getInputProps("title").onBlur(event);

                    if (!form.values.slug.trim()) {
                      form.setFieldValue(
                        "slug",
                        generateSlug(event.currentTarget.value),
                      );
                    }
                  }}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Slug"
                  placeholder="content-title"
                  description="Used in the URL. Use lowercase letters, numbers, and hyphens."
                  withAsterisk
                  maxLength={255}
                  disabled={loading}
                  {...form.getInputProps("slug")}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Textarea
                  label="Excerpt"
                  placeholder="Short description or summary"
                  description="Optional short summary of the content."
                  autosize
                  minRows={3}
                  maxRows={6}
                  maxLength={1000}
                  disabled={loading}
                  {...form.getInputProps("excerpt")}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* =========================================================
            CONTENT
        ========================================================= */}

        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <Group gap="sm">
              <FileText size={20} />

              <div>
                <Text fw={600}>Content</Text>

                <Text size="sm" c="dimmed">
                  Write the main content of the publication.
                </Text>
              </div>
            </Group>

            <Divider />

            <RichTextEditor
              editor={editor}
              styles={{
                content: {
                  minHeight: 420,
                },
              }}
            >
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>

            {form.errors.content && (
              <Text size="sm" c="red">
                {form.errors.content}
              </Text>
            )}

            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                {wordCount.toLocaleString()} words
              </Text>

              <Text size="xs" c={characterLimitReached ? "red" : "dimmed"}>
                {characterCount.toLocaleString()}
                {" / "}
                {MAX_CONTENT_CHARACTERS.toLocaleString()}
                {" characters"}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* =========================================================
            CATEGORIES
        ========================================================= */}

        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <div>
              <Text fw={600}>Categories</Text>

              <Text size="sm" c="dimmed">
                Select one or more categories for this content.
              </Text>
            </div>

            <Divider />

            <Checkbox.Group
              value={form.values.category_ids}
              onChange={(values) => {
                form.setFieldValue("category_ids", values);
              }}
            >
              <Grid>
                {categories.map((category) => (
                  <Grid.Col
                    key={category.id}
                    span={{
                      base: 12,
                      sm: 6,
                      md: 4,
                    }}
                  >
                    <Checkbox
                      value={String(category.id)}
                      label={category.name}
                      disabled={loading}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            </Checkbox.Group>
          </Stack>
        </Card>

        {/* =========================================================
    MEDIA
========================================================= */}
        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <Group gap="sm">
              <Image size={20} />
              <div>
                <Text fw={600}>Media</Text>
                <Text size="sm" c="dimmed">
                  Add featured and banner images for the content.
                </Text>
              </div>
            </Group>

            <Divider />

            <Card withBorder radius="md" padding="lg">
              <Stack gap="md">
                <Group gap="sm">
                  <Image size={20} />

                  <div>
                    <Text fw={600}>Media</Text>

                    <Text size="sm" c="dimmed">
                      Add featured and banner images for the content.
                    </Text>
                  </div>
                </Group>

                <Divider />

                <Grid>
                  {/* Featured Image */}
                  <Grid.Col
                    span={{
                      base: 12,
                      md: 6,
                    }}
                  >
                    <ContentMediaField
                      label="Featured Image"
                      existingMedia={form.values.existing_featured_media}
                      value={form.values.featured_media}
                      error={form.errors.featured_media}
                      loading={loading}
                      maxSize={MAX_FEATURED_IMAGE_SIZE}
                      maxSizeDescription="Maximum size: 5 MB."
                      onChange={(file) => {
                        form.setFieldValue("featured_media", file);
                        form.setFieldValue("remove_featured_media", false);
                        form.validateField("featured_media");
                      }}
                      onRemoveExisting={() => {
                        form.setFieldValue("existing_featured_media", null);
                        form.setFieldValue("remove_featured_media", true);
                      }}
                    />
                  </Grid.Col>

                  {/* Banner Image */}
                  <Grid.Col
                    span={{
                      base: 12,
                      md: 6,
                    }}
                  >
                    <ContentMediaField
                      label="Banner Image"
                      existingMedia={form.values.existing_banner_media}
                      value={form.values.banner_media}
                      error={form.errors.banner_media}
                      loading={loading}
                      maxSize={MAX_BANNER_IMAGE_SIZE}
                      maxSizeDescription="Maximum size: 10 MB."
                      onChange={(file) => {
                        form.setFieldValue("banner_media", file);
                        form.setFieldValue("remove_banner_media", false);
                        form.validateField("banner_media");
                      }}
                      onRemoveExisting={() => {
                        form.setFieldValue("existing_banner_media", null);
                        form.setFieldValue("remove_banner_media", true);
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Card>

        {/* =========================================================
    ATTACHMENTS
========================================================= */}
        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <Group gap="sm">
              <Paperclip size={20} />
              <div>
                <Text fw={600}>Attachments</Text>
                <Text size="sm" c="dimmed">
                  Attach supporting documents or files.
                </Text>
              </div>
            </Group>

            <Divider />

            {/* EXISTING ATTACHMENTS */}
            {initialValues?.existing_attachments &&
              initialValues.existing_attachments.length > 0 && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Existing Attachments
                  </Text>

                  {initialValues.existing_attachments.map((file) => (
                    <Card key={file.id} withBorder padding="sm" radius="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap">
                          <Paperclip size={18} />

                          <div>
                            <Text size="sm" fw={500}>
                              {file.file_name}
                            </Text>

                            <Text size="xs" c="dimmed">
                              {file.mime_type ?? "Unknown file type"}
                            </Text>
                          </div>
                        </Group>

                        <a
                          href={mediaApi.getUrl(file)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.file_name}
                        </a>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}

            <FileInput
              label="Add Attachments"
              placeholder="Choose files"
              description="Maximum size: 20 MB per file."
              leftSection={<Paperclip size={16} />}
              multiple
              clearable
              disabled={loading}
              value={form.values.attachments}
              error={form.errors.attachments}
              onChange={(files) => {
                form.setFieldValue("attachments", files || []);
                form.validateField("attachments");
              }}
            />
          </Stack>
        </Card>

        {/* =========================================================
            PUBLICATION
        ========================================================= */}

        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <div>
              <Text fw={600}>Publication Settings</Text>

              <Text size="sm" c="dimmed">
                Configure publication and visibility settings.
              </Text>
            </div>

            <Divider />

            <Grid>
              <Grid.Col
                span={{
                  base: 12,
                  md: 6,
                }}
              >
                <TextInput
                  type="datetime-local"
                  label="Published At"
                  description="Optional publication date and time."
                  disabled={loading}
                  {...form.getInputProps("published_at")}
                />
              </Grid.Col>

              <Grid.Col
                span={{
                  base: 12,
                  md: 6,
                }}
              >
                <Checkbox
                  label="Featured Content"
                  description="Display this content as featured."
                  mt={30}
                  disabled={loading}
                  {...form.getInputProps("is_featured", {
                    type: "checkbox",
                  })}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* =========================================================
            ACTIONS
        ========================================================= */}

        <Group justify="flex-end">
          <Button
            type="button"
            variant="default"
            leftSection={<RotateCcw size={16} />}
            disabled={loading}
            onClick={() => {
              form.reset();
              editor?.commands.clearContent();
            }}
          >
            Reset
          </Button>

          <Button
            type="submit"
            color="yellow"
            leftSection={<Save size={16} />}
            loading={loading}
          >
            {isEditMode ? "Update Content" : "Create Content"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
