import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import type { PricingRequest } from "../../models/PricingRequest";
import { plDecide } from "../../api/plDecisions";

export default function PLDecision() {
  const { id } = useParams();
  const nav = useNavigate();
  const [request, setRequest] = useState<PricingRequest | null>(null);
  const [action, setAction] = useState<"APPROVE" | "REJECT" | "ESCALATE">("APPROVE");
  const [comments, setComments] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/pricing-requests/${id}`).then((res) => {
      setRequest(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div style={{ padding: "20px" }}>Loading request...</div>;
  if (!request) return <div style={{ padding: "20px" }}>Request not found</div>;

  const deviation = request.initial_price - request.target_price;
  const deviationPct = ((deviation / request.initial_price) * 100).toFixed(2);

  async function submit() {
    if ((action === "REJECT" || action === "ESCALATE") && !comments) {
      alert("Comments are mandatory for rejection or escalation");
      return;
    }

    if (action === "APPROVE" && !suggestedPrice) {
      alert("Please enter a suggested price for approval");
      return;
    }

    setSubmitting(true);
    try {
      await plDecide(request!.id, {
        action,
        comments,
        suggested_price: suggestedPrice,
      });
      nav("/pl");
    } catch (err) {
      alert("Failed to submit decision");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, color: "#0f2a44" }}>PL Decision – {request.project_name}</h1>
          <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
            Request #{request.id} • {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => nav("/pl")}
          style={{
            padding: "8px 16px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Inbox
        </button>
      </div>

      {/* Request Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        <InfoCard label="Customer" value={request.customer} />
        <InfoCard label="Product Line" value={request.product_line} />
        <InfoCard label="Plant" value={request.plant} />
        <InfoCard label="Yearly Sales" value={`€${request.yearly_sales.toFixed(2)}`} />
        <InfoCard label="Initial Price" value={`€${request.initial_price.toFixed(2)}`} />
        <InfoCard label="Target Price" value={`€${request.target_price.toFixed(2)}`} highlight />
      </div>

      {/* Deviation Summary */}
      <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "12px", border: "1px solid #fee2e2" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>Price Deviation</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#dc3545" }}>
              -€{deviation.toFixed(2)} ({deviationPct}%)
            </div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>Requester</div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {request.requester_name || request.requester_email}
            </div>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#0f2a44" }}>Problem to Solve</h3>
        <div style={{ padding: "12px", background: "#f8f9fa", borderRadius: "6px", lineHeight: "1.6", color: "#333" }}>
          {request.problem_to_solve}
        </div>
      </div>

      {/* Decision Form */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "grid", gap: "20px" }}>
        <h3 style={{ margin: 0, color: "#0f2a44" }}>Your Decision</h3>

        {/* Action Selection */}
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "12px", color: "#333" }}>
            Select Action
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            {(["APPROVE", "REJECT", "ESCALATE"] as const).map((act) => (
              <button
                key={act}
                onClick={() => setAction(act)}
                style={{
                  padding: "12px",
                  border: action === act ? "2px solid #0b5ed7" : "1px solid #ddd",
                  background: action === act ? "#e7f1ff" : "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: action === act ? 600 : 500,
                  color: action === act ? "#0b5ed7" : "#333",
                  transition: "all 0.2s",
                }}
              >
                {act === "APPROVE" && "✓ Approve"}
                {act === "REJECT" && "✗ Reject"}
                {act === "ESCALATE" && "⬆ Escalate"}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Price (for APPROVE) */}
        {action === "APPROVE" && (
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#333" }}>
              Suggested Price (€) <span style={{ color: "#dc3545" }}>*</span>
            </label>
            <input
              type="number"
              value={suggestedPrice ?? ""}
              onChange={(e) => setSuggestedPrice(Number(e.target.value) || undefined)}
              placeholder={`Between €${request.target_price.toFixed(2)} and €${request.initial_price.toFixed(2)}`}
              step="0.01"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
              Range: €{request.target_price.toFixed(2)} - €{request.initial_price.toFixed(2)}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", color: "#333" }}>
            Comments {(action === "REJECT" || action === "ESCALATE") && <span style={{ color: "#dc3545" }}>*</span>}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              action === "APPROVE"
                ? "Optional: Explain your approval..."
                : action === "REJECT"
                ? "Required: Explain why you're rejecting..."
                : "Required: Explain why you're escalating to VP..."
            }
            rows={5}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={() => nav("/pl")}
            style={{
              padding: "10px 20px",
              background: "#f3f4f6",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            style={{
              padding: "10px 24px",
              background: action === "REJECT" ? "#dc3545" : action === "ESCALATE" ? "#f59e0b" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Submitting..." : `Submit ${action === "APPROVE" ? "Approval" : action === "REJECT" ? "Rejection" : "Escalation"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px", fontWeight: 600 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: highlight ? "#dc3545" : "#0f2a44",
          background: highlight ? "#fff5f5" : "transparent",
          padding: highlight ? "8px" : 0,
          borderRadius: highlight ? "4px" : 0,
        }}
      >
        {value}
      </div>
    </div>
  );
}
