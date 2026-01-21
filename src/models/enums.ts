export const RequestStatus = {
  DRAFT: "DRAFT",
  UNDER_REVIEW_PL: "UNDER_REVIEW_PL",
  ESCALATED_TO_VP: "ESCALATED_TO_VP",
  APPROVED_BY_PL: "APPROVED_BY_PL",
  APPROVED_BY_VP: "APPROVED_BY_VP",
  REJECTED_BY_PL: "REJECTED_BY_PL",
  REJECTED_BY_VP: "REJECTED_BY_VP",
  BACK_TO_COMMERCIAL: "BACK_TO_COMMERCIAL",
  CLOSED: "CLOSED",
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];
