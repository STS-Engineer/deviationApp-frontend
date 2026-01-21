import StatusBadge from "./StatusBadge";
import type { PricingRequest } from "../models/PricingRequest";

export default function RequestCard({
  request,
  onOpen,
}: {
  request: PricingRequest;
  onOpen: () => void;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{request.project_name}</strong>
        <StatusBadge status={request.status} />
      </div>

      <div style={{ color: "#4b5563", fontSize: 14 }}>
        Customer: {request.customer}
      </div>

      <div style={{ fontSize: 14 }}>
        Initial: <strong>{request.initial_price}</strong> — Target:{" "}
        <strong>{request.target_price}</strong>
      </div>

      <button
        onClick={onOpen}
        style={{
          marginTop: 8,
          border: "none",
          borderRadius: 8,
          padding: "8px 12px",
          background: "#2563eb",
          color: "white",
          fontWeight: 700,
          width: "fit-content",
        }}
      >
        Review
      </button>
    </div>
  );
}
