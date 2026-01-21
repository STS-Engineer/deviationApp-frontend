export default function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UNDER_REVIEW_PL: "#f59e0b",
    ESCALATED_TO_VP: "#6366f1",
    APPROVED_BY_PL: "#10b981",
    BACK_TO_COMMERCIAL: "#ef4444",
    CLOSED: "#6b7280",
  };

  return (
    <span
      style={{
        background: colors[status] || "#e5e7eb",
        color: "white",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
