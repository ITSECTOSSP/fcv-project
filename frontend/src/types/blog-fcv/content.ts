export type ContentStatus = "draft" | "pending" | "published" | "archived";

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

  media?: ContentMedia[];

  content_type?: {
    id: number;
    name: string;
    slug: string;
  };

  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];

  created_at: string;
  updated_at: string;
}

export interface ContentMedia {
  id: number;
  name: string;
  file_name: string;
  path: string;
  disk: string;
  mime_type: string | null;
  url: string;
  alt_text: string | null;
  caption: string | null;
  pivot?: {
    content_id: number;
    media_id: number;
    type: "featured" | "banner" | "attachment" | "gallery" | "inline";
  };
}

export interface ContentsResponse {
  data: Content[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface ContentResponse {
  data: Content;
  message?: string;
}

export interface ContentPayload {
  content_type_id: number;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  status?: ContentStatus;
  is_featured?: boolean;
  published_at?: string | null;
  category_ids?: number[];

  featured_media?: File | null;
  banner_media?: File | null;
  attachments?: File[];

  remove_featured_media?: boolean;
  remove_banner_media?: boolean;
}

export interface ContentFilters {
  search?: string;
  content_type_id?: number;
  status?: ContentStatus;
  is_featured?: boolean;
  page?: number;
  per_page?: number;
}
