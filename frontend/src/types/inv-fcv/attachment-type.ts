export type AttachmentType = {
  id: string;
  name: string;
  description: string | null;
  attachments_count?: number;
  created_at: string;
  updated_at: string;
};

export type AttachmentTypesResponse = {
  current_page: number;
  data: AttachmentType[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  per_page: number;
  to: number | null;
  total: number;
};

export type AttachmentTypeResponse = {
  message?: string;
  data: AttachmentType;
};

export type CreateAttachmentTypePayload = {
  name: string;
  description?: string | null;
};

export type UpdateAttachmentTypePayload =
  CreateAttachmentTypePayload;