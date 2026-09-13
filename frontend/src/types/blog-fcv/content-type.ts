export interface ContentType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}