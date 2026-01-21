import { api } from "./client";

export type PricingRequestCreate = {
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
  requester_name: string;
  product_line_responsible_email: string;
  product_line_responsible_name?: string;
  vp_email?: string | null;
  vp_name?: string;
};

export type PricingRequest = {
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
  requester_name: string;
  product_line_responsible_email: string;
  product_line_responsible_name?: string;
  vp_email?: string;
  vp_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  pl_suggested_price?: number;
  pl_comments?: string;
  pl_decision_date?: string;
  vp_suggested_price?: number;
  vp_comments?: string;
  vp_decision_date?: string;
  final_approved_price?: number;
};

export async function submitPricingRequest(payload: PricingRequestCreate) {
  const { data } = await api.post("/pricing-requests", payload);
  return data as { message: string; request_id: number; status: string; costing_number: string };
}

export async function getPricingRequests(filters?: {
  status?: string;
  product_line?: string;
  requester_email?: string;
}) {
  const { data } = await api.get("/pricing-requests", { params: filters });
  return data as PricingRequest[];
}

export async function getPricingRequest(requestId: number) {
  const { data } = await api.get(`/pricing-requests/${requestId}`);
  return data as PricingRequest;
}

export async function getUserPricingRequests(requesterEmail: string) {
  const { data } = await api.get(`/pricing-requests/user/${requesterEmail}`);
  return data as PricingRequest[];
}
