import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUnreadCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "../api/notifications";

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const visibleNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

  const loadNotifications = async () => {
    if (!user?.email) return;

    try {
      const [items, unread] = await Promise.all([
        getUserNotifications(user.email),
        getUnreadCount(user.email),
      ]);
      setNotifications(items);
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    if (!user?.email) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleNotificationClick = async (item: AppNotification) => {
    try {
      if (!item.is_read) {
        await markNotificationAsRead(item.id);
      }
      await loadNotifications();
    } finally {
      setShowNotifications(false);
      navigate(item.action_url || `/pricing-requests/${item.request_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.email) return;
    await markAllNotificationsAsRead(user.email);
    await loadNotifications();
  };

  const getNavLinks = () => {
    if (!user) return [];

    const baseLinks = [{ path: "/", label: "Dashboard" }];

    if (user.role === "COMMERCIAL") {
      return [
        ...baseLinks,
        { path: "/create", label: "Create Request" },
        { path: "/my-requests", label: "My Requests" },
      ];
    }

    if (user.role === "PL") {
      return [
        ...baseLinks,
        { path: "/pl", label: "PL Inbox" },
      ];
    }

    if (user.role === "VP") {
      return [
        ...baseLinks,
        { path: "/vp", label: "VP Inbox" },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header
      style={{
        background: "#0f2a44",
        color: "white",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
            Avocarbon Pricing
          </h2>

          <nav style={{ display: "flex", gap: 20 }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  color: loc.pathname === link.path ? "#ffc107" : "white",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: loc.pathname === link.path ? 600 : 500,
                  borderBottom:
                    loc.pathname === link.path ? "2px solid #ffc107" : "none",
                  paddingBottom: "4px",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: "14px", position: "relative" }}>
          {user && (
            <>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                style={{
                  position: "relative",
                  padding: "6px 10px",
                  background: "#1b3b5e",
                  color: "white",
                  border: "1px solid #3b5a7a",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "#ef4444",
                      color: "white",
                      borderRadius: "999px",
                      fontSize: "11px",
                      minWidth: "18px",
                      height: "18px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <span>
                {user.email} <strong>({user.role})</strong>
              </span>
              <button
                onClick={logout}
                style={{
                  padding: "6px 12px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Logout
              </button>
            </>
          )}

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: 0,
                width: "360px",
                maxHeight: "420px",
                overflowY: "auto",
                background: "white",
                color: "#111827",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong style={{ fontSize: "14px" }}>Notifications</strong>
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#0b5ed7",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Mark all read
                </button>
              </div>

              {visibleNotifications.length === 0 ? (
                <div style={{ padding: "14px", fontSize: "13px", color: "#6b7280" }}>
                  No notifications yet.
                </div>
              ) : (
                visibleNotifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: item.is_read ? "white" : "#eff6ff",
                      border: "none",
                      borderBottom: "1px solid #f1f5f9",
                      padding: "10px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", marginBottom: "4px" }}>{item.message}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
