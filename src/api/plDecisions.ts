import { api } from "./client";

export type PLDecisionPayload = {
  action: "APPROVE" | "REJECT" | "ESCALATE";
  suggested_price?: number;
  comments?: string;
};

export type PLInboxItem = {
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
  requester_email: string;
  requester_name: string;
  status: string;
  created_at: string;
};

export async function getPLInbox(plEmail: string) {
  const { data } = await api.get("/pl-decisions/inbox", {
    params: { pl_email: plEmail }
  });
  return data as PLInboxItem[];
}

export async function getPLRequestDetail(requestId: number) {
  const { data } = await api.get(`/pl-decisions/${requestId}`);
  return data;
}

export async function plDecide(requestId: number, payload: PLDecisionPayload) {
  const { data } = await api.post(`/pl-decisions/${requestId}`, payload);
  return data;
}
