import type { ContentType } from "@/types/blog-fcv/content-type";
import type { Category } from "@/types/blog-fcv/category";

export type ContentStatus =
  | "draft"
  | "pending"
  | "published"
  | "archived";

export interface ContentMedia {
  id: number;
  content_id: number;
  type: string;
  path: string;
  filename: string;
  mime_type: string | null;
  size: number | null;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;

  content_type_id: number;
  author_id: number | null;

  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;

  status: ContentStatus;
  is_featured: boolean;
  published_at: string | null;

  created_at: string;
  updated_at: string;

  content_type?: ContentType;
  categories?: Category[];
  media?: ContentMedia[];
}

export interface ContentPayload {
  content_type_id: number;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  status: ContentStatus;
  is_featured: boolean;
  published_at?: string | null;

  category_ids?: number[];

  featured_media?: File | null;
  banner_media?: File | null;
  attachments?: File[];
}

export interface ContentResponse extends Content {}