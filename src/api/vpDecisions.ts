import { api } from "./client";

export type VPDecisionPayload = {
  action: "APPROVE" | "REJECT";
  suggested_price?: number;
  comments: string;
};

export type VPInboxItem = {
  id: number;
  costing_number: string;
  project_name: string;
  customer: string;
  product_line: string;
  plant: string;
  yearly_sales: number;
  initial_price: number;
  target_price: number;
  pl_suggested_price?: number;
  pl_comments?: string;
  requester_email: string;
  requester_name: string;
  product_line_responsible_name?: string;
  status: string;
  created_at: string;
};

export async function getVPInbox(vpEmail: string, archived: boolean = false) {
  const { data } = await api.get("/vp-decisions/inbox", {
    params: { 
      vp_email: vpEmail,
      archived: archived
    }
  });
  return data as VPInboxItem[];
}

export async function getVPRequestDetail(requestId: number) {
  const { data } = await api.get(`/vp-decisions/${requestId}`);
  return data;
}

export async function vpDecide(requestId: number, payload: VPDecisionPayload) {
  const { data } = await api.post(`/vp-decisions/${requestId}`, payload);
  return data;
}
