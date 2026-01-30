import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { PricingRequest } from "../../models/PricingRequest";
import StatusBadge from "../../components/StatusBadge";
import NotificationBar from "../../components/NotificationBar";
import { getDaysPending, getStatusColor, getStatusLabel } from "../../utils/dateUtils";

export default function CommercialDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PricingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const nav = useNavigate();

  const loadRequests = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const res = await api.get(`/pricing-requests/user/${user.email}`);
      setRequests(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  }, [user?.email]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [loadRequests]);

  // Initial load
  useEffect(() => {
    loadRequests().then(() => setLoading(false));
  }, [user?.email, loadRequests]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadRequests();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadRequests]);

  // Refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      loadRequests();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadRequests]);

  const filteredRequests = requests.filter((r) => {
    if (filter === "pending") return r.status === "UNDER_REVIEW_PL";
    if (filter === "approved") return r.status === "APPROVED_BY_VP" || r.status === "APPROVED_BY_PL";
    if (filter === "rejected") return r.status === "REJECTED_BY_VP" || r.status === "REJECTED_BY_PL";
    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "UNDER_REVIEW_PL").length,
    approved: requests.filter((r) => r.status === "APPROVED_BY_VP" || r.status === "APPROVED_BY_PL").length,
    rejected: requests.filter((r) => r.status === "REJECTED_BY_VP" || r.status === "REJECTED_BY_PL").length,
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading your requests...</div>;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Pending Requests Notification */}
      {stats.pending > 0 && (
        <NotificationBar
          type="warning"
          message={`You have ${stats.pending} ${stats.pending === 1 ? "request" : "requests"} pending review from Product Line Manager`}
          autoClose={false}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, color: "#ffffff" }}>
            📝 My Requests Dashboard
            {stats.pending > 0 && (
              <span style={{
                marginLeft: "12px",
                backgroundColor: "#ef4444",
                color: "white",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600
              }}>
                {stats.pending} Pending
              </span>
            )}
          </h1>
          <p style={{ margin: "8px 0 0 0", color: "#e0e0e0", fontSize: "14px" }}>Track all your pricing deviation requests</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: "8px 16px",
            background: "#0b5ed7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: refreshing ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "14px",
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      <div style={{ fontSize: "12px", color: "#999" }}>
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard label="Total Requests" value={stats.total} color="#3b82f6" />
        <StatCard label="Pending Review" value={stats.pending} color="#f59e0b" />
        <StatCard label="Approved" value={stats.approved} color="#10b981" />
        <StatCard label="Rejected" value={stats.rejected} color="#ef4444" />
      </div>

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "10px 16px",
              border: filter === f ? "2px solid #0b5ed7" : "1px solid #ddd",
              background: filter === f ? "#e7f1ff" : "white",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: filter === f ? 600 : 500,
              color: filter === f ? "#0b5ed7" : "#666",
              transition: "all 0.2s",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {filteredRequests.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            No requests found for this filter.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Costing #</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Project</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Initial Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Target Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Final Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Pending</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
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
                      <strong>{req.costing_number}</strong>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{req.project_name}</td>
                    <td style={{ padding: "12px 16px" }}>{req.customer}</td>
                    <td style={{ padding: "12px 16px" }}>€ {req.initial_price.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px" }}>€ {req.target_price.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                      {req.final_approved_price ? `€ ${req.final_approved_price.toFixed(2)}` : "-"}
                    </td>
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
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => nav(`/pricing-requests/${req.id}`)}
                        style={{
                          padding: "6px 12px",
                          background: "#0b5ed7",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
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
      <div style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: color }}>
        {value}
      </div>
    </div>
  );
}
