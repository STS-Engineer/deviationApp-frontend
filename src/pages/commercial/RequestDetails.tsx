import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { PricingRequest } from "../../models/PricingRequest";
import { api } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import CommentsThread from "../../components/CommentsThread";
import { useAuth } from "../../context/AuthContext";

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<PricingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    api
      .get(`/pricing-requests/${id}`)
      .then((res) => {
        setRequest(res.data);
      })
      .catch((err) => {
        console.error("Failed to load request:", err);
        setError("Failed to load request details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;
  if (error) return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
  if (!request) return <div style={{ padding: "20px" }}>Request not found</div>;

  const isPending = request.status === "UNDER_REVIEW_PL";
  const priceDiff = request.initial_price - request.target_price;
  const priceDiffPct = ((priceDiff / request.initial_price) * 100).toFixed(2);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, color: "#0f2a44" }}>{request.project_name}</h1>
          <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
            Request #{request.id} • {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => navigate("/my-requests")}
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
          Back to Dashboard
        </button>
      </div>

      {/* Status & Pricing Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>Status</div>
          <StatusBadge status={request.status} />
          <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            {isPending ? "Awaiting Product Line review" : "Decision completed"}
          </div>
        </div>

        <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>Price Deviation</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#dc3545" }}>
            -€{priceDiff.toFixed(2)} ({priceDiffPct}%)
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            From €{request.initial_price.toFixed(2)} to €{request.target_price.toFixed(2)}
          </div>
        </div>

        {request.final_approved_price && (
          <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>Final Approved Price</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#10b981" }}>
              €{request.final_approved_price.toFixed(2)}
            </div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
              Approved by VP
            </div>
          </div>
        )}
      </div>

      {/* Request Details */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "grid", gap: "20px" }}>
        <h3 style={{ margin: 0, color: "#0f2a44" }}>Request Details</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <FieldDisplay label="Costing Number" value={request.costing_number} />
          <FieldDisplay label="Product Line" value={request.product_line} />
          <FieldDisplay label="Plant" value={request.plant} />
          <FieldDisplay label="Customer" value={request.customer} />
          <FieldDisplay label="Yearly Sales" value={`€${request.yearly_sales.toFixed(2)}`} />
          <FieldDisplay label="Initial Price" value={`€${request.initial_price.toFixed(2)}`} />
          <FieldDisplay label="Target Price" value={`€${request.target_price.toFixed(2)}`} highlight />
        </div>

        <div>
          <label style={{ fontWeight: 600, color: "#666", display: "block", marginBottom: "8px" }}>
            Problem to Solve
          </label>
          <div
            style={{
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px",
              lineHeight: "1.5",
              color: "#333",
            }}
          >
            {request.problem_to_solve}
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "grid", gap: "20px" }}>
        <h3 style={{ margin: 0, color: "#0f2a44" }}>Contacts</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <FieldDisplay label="Requester" value={request.requester_name || request.requester_email} />
          <FieldDisplay label="Requester Email" value={request.requester_email} />
          <FieldDisplay label="PL Responsible" value={request.product_line_responsible_name || "-"} />
          <FieldDisplay label="PL Email" value={request.product_line_responsible_email} />
          {request.vp_name && <FieldDisplay label="VP" value={request.vp_name} />}
          {request.vp_email && <FieldDisplay label="VP Email" value={request.vp_email} />}
        </div>
      </div>

      {/* PL Decision Section */}
      {request.pl_decision_date && (
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "12px", border: "1px solid #e0e0e0", display: "grid", gap: "16px" }}>
          <h3 style={{ margin: 0, color: "#0f2a44" }}>Product Line Decision</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>
                Suggested Price
              </label>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b5ed7" }}>
                {request.pl_suggested_price ? `€${request.pl_suggested_price.toFixed(2)}` : "-"}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>
                Decision Date
              </label>
              <div style={{ fontSize: "14px", color: "#333" }}>
                {new Date(request.pl_decision_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {request.pl_comments && (
            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                PL Comments
              </label>
              <div style={{ padding: "12px", background: "white", borderRadius: "6px", lineHeight: "1.5", color: "#333" }}>
                {request.pl_comments}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VP Decision Section */}
      {request.vp_decision_date && (
        <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "12px", border: "1px solid #d1fae5", display: "grid", gap: "16px" }}>
          <h3 style={{ margin: 0, color: "#065f46" }}>VP Final Decision</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>
                Final Approved Price
              </label>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#10b981" }}>
                {request.final_approved_price ? `€${request.final_approved_price.toFixed(2)}` : "-"}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>
                Decision Date
              </label>
              <div style={{ fontSize: "14px", color: "#333" }}>
                {new Date(request.vp_decision_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {request.vp_comments && (
            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                VP Comments
              </label>
              <div style={{ padding: "12px", background: "white", borderRadius: "6px", lineHeight: "1.5", color: "#333" }}>
                {request.vp_comments}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rejection Notice */}
      {(request.status === "REJECTED_BY_VP" || request.status === "REJECTED_BY_PL") && (
        <div style={{ background: "#fef2f2", padding: "20px", borderRadius: "12px", border: "1px solid #fee2e2", display: "grid", gap: "12px" }}>
          <h3 style={{ margin: 0, color: "#991b1b" }}>❌ Request Rejected</h3>
          <p style={{ margin: 0, color: "#7f1d1d" }}>
            This request was rejected during the review process. Please contact your Product Line manager for details.
          </p>
        </div>
      )}

      {/* Comments Thread */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {request.id && user?.email && (
          <CommentsThread requestId={request.id} currentUserEmail={user.email} />
        )}
      </div>
    </div>
  );
}

function FieldDisplay({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px", fontWeight: 600 }}>
        {label}
      </label>
      <div
        style={{
          fontSize: "14px",
          color: highlight ? "#dc3545" : "#333",
          fontWeight: highlight ? 600 : 400,
          padding: "8px",
          background: highlight ? "#fff5f5" : "transparent",
          borderRadius: "4px",
        }}
      >
        {value}
      </div>
    </div>
  );
}
