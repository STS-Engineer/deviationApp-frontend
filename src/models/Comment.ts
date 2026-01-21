export interface Comment {
  id: number;
  request_id: number;
  author_email: string;
  author_name: string;
  author_role: "COMMERCIAL" | "PL" | "VP";
  content: string;
  created_at: string;
  updated_at: string;
}
