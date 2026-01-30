import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import type { PricingRequest } from "../../models/PricingRequest";
import { RequestStatus } from "../../models/enums";
import NotificationBar from "../../components/NotificationBar";
import { getDaysPending, getStatusColor, getStatusLabel } from "../../utils/dateUtils";

export default function PLInbox() {
  const [allRequests, setAllRequests] = useState<PricingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/pricing-requests").then((res) => {
      setAllRequests(res.data);
      setLoading(false);
    });
  }, [showArchived]);

  const pendingRequests = allRequests.filter(
    (r) => r.status === RequestStatus.UNDER_REVIEW_PL
  );

  const archivedRequests = allRequests.filter(
    (r) => r.status === RequestStatus.APPROVED_BY_PL || r.status === RequestStatus.REJECTED_BY_PL
  );

  const displayedRequests = showArchived ? archivedRequests : pendingRequests;

  if (loading) return <div style={{ padding: "20px" }}>Loading requests...</div>;

  const totalDeviation = displayedRequests.reduce((sum, r) => sum + (r.initial_price - r.target_price), 0);
  const avgDeviation = displayedRequests.length > 0 ? totalDeviation / displayedRequests.length : 0;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Pending Requests Notification */}
      {!showArchived && pendingRequests.length > 0 && (
        <NotificationBar
          type="warning"
          message={`You have ${pendingRequests.length} ${pendingRequests.length === 1 ? "request" : "requests"} awaiting your review`}
          autoClose={false}
        />
      )}

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, color: "#ffffff" }}>
          🔍 Product Line Inbox
          {!showArchived && pendingRequests.length > 0 && (
            <span style={{
              marginLeft: "12px",
              backgroundColor: "#f59e0b",
              color: "white",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: 600
            }}>
              {pendingRequests.length} Pending
            </span>
          )}
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#e0e0e0", fontSize: "14px" }}>
          {showArchived ? "View archived requests and continue discussions" : "Review and approve pricing deviation requests"}
        </p>
      </div>

      {/* Toggle Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => setShowArchived(false)}
          style={{
            padding: "10px 20px",
            background: !showArchived ? "#f59e0b" : "#f3f4f6",
            color: !showArchived ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          📋 Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          style={{
            padding: "10px 20px",
            background: showArchived ? "#10b981" : "#f3f4f6",
            color: showArchived ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          📁 Archived ({archivedRequests.length})
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard label={showArchived ? "Completed Requests" : "Pending Review"} value={displayedRequests.length} color={showArchived ? "#10b981" : "#f59e0b"} icon={showArchived ? "✓" : "⏳"} />
        <StatCard label="Total Deviation" value={`€${totalDeviation.toFixed(2)}`} color={showArchived ? "#10b981" : "#f59e0b"} icon="📊" />
        <StatCard label="Avg Deviation" value={`€${avgDeviation.toFixed(2)}`} color="#8b5cf6" icon="📈" />
      </div>

      {/* Requests Table */}
      <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {displayedRequests.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#999" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
              {showArchived ? "📁" : "📭"}
            </div>
            <h3 style={{ margin: 0, color: "#666" }}>
              {showArchived ? "No archived requests" : "No pending requests"}
            </h3>
            <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
              {showArchived ? "All completed requests will appear here" : "All requests have been reviewed"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Project</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Initial Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Target Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Deviation</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Requester</th>
                  {!showArchived && <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Pending</th>}
                  {showArchived && <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Status</th>}
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {displayedRequests.map((req) => {
                  const deviation = req.initial_price - req.target_price;
                  const deviationPct = ((deviation / req.initial_price) * 100).toFixed(1);
                  return (
                    <tr
                      key={req.id}
                      style={{
                        borderBottom: "1px solid #e0e0e0",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <strong>{req.project_name}</strong>
                        <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>#{req.costing_number}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{req.customer}</td>
                      <td style={{ padding: "12px 16px" }}>€ {req.initial_price.toFixed(2)}</td>
                      <td style={{ padding: "12px 16px" }}>€ {req.target_price.toFixed(2)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ color: "#dc3545", fontWeight: 600 }}>-€{deviation.toFixed(2)}</div>
                        <div style={{ fontSize: "12px", color: "#999" }}>{deviationPct}%</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div>{req.requester_name || req.requester_email}</div>
                        <div style={{ fontSize: "12px", color: "#999" }}>{req.yearly_sales > 0 ? `${req.product_line}` : "-"}</div>
                      </td>
                      {!showArchived && (
                        <td style={{ padding: "12px 16px" }}>
                          {(() => {
                            const daysPending = getDaysPending(req.created_at);
                            const color = getStatusColor(daysPending);
                            return (
                              <div style={{
                                padding: "6px 10px",
                                backgroundColor: color + "20",
                                border: `1px solid ${color}`,
                                borderRadius: "4px",
                                color: color,
                                fontWeight: 600,
                                textAlign: "center",
                                fontSize: "13px"
                              }}>
                                {getStatusLabel(daysPending)}
                              </div>
                            );
                          })()}
                        </td>
                      )}
                      {showArchived && (
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{
                            padding: "6px 10px",
                            backgroundColor: req.status === RequestStatus.APPROVED_BY_PL ? "#d1fae5" : "#fee2e2",
                            border: `1px solid ${req.status === RequestStatus.APPROVED_BY_PL ? "#6ee7b7" : "#fca5a5"}`,
                            borderRadius: "4px",
                            color: req.status === RequestStatus.APPROVED_BY_PL ? "#065f46" : "#991b1b",
                            fontWeight: 600,
                            textAlign: "center",
                            fontSize: "13px"
                          }}>
                            {req.status === RequestStatus.APPROVED_BY_PL ? "✓ Approved" : "✗ Rejected"}
                          </div>
                        </td>
                      )}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => nav(`/pl/${req.id}`)}
                          style={{
                            padding: "6px 12px",
                            background: showArchived ? "#10b981" : "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = showArchived ? "#059669" : "#d97706"}
                          onMouseOut={(e) => e.currentTarget.style.background = showArchived ? "#10b981" : "#f59e0b"}
                        >
                          {showArchived ? "💬 View" : "🔍 Review"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon?: string }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>{label}</div>
          <div style={{ fontSize: typeof value === "number" ? "28px" : "24px", fontWeight: 700, color }}>
            {value}
          </div>
        </div>
        {icon && <div style={{ fontSize: "24px" }}>{icon}</div>}
      </div>
    </div>
  );
}
