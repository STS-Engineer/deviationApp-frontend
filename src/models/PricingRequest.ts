import { RequestStatus } from "./enums";

export interface PricingRequest {
  id: number;
  costing_number: string;
  project_name: string;
  customer: string;
  product_line: string;
  plant: string;

  yearly_sales: number;
  initial_price: number;
  target_price: number;

  problem_to_solve: string;
  attachment_path?: string;

  requester_email: string;
  requester_name?: string;
  product_line_responsible_email: string;
  product_line_responsible_name?: string;
  vp_email?: string;
  vp_name?: string;

  suggested_price?: number;
  comments?: string;

  pl_suggested_price?: number;
  pl_comments?: string;
  pl_decision_date?: string;

  vp_suggested_price?: number;
  vp_comments?: string;
  vp_decision_date?: string;

  final_approved_price?: number;

  status: RequestStatus;
  created_at: string;
  updated_at: string;
}
