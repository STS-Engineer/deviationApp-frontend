import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

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

        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: "14px" }}>
          {user && (
            <>
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
        </div>
      </div>
    </header>
  );
}
