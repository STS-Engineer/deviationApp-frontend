import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import type { UserRole } from "../context/AuthContext";
import backgroundImage from "../assets/back.jpg";
import { api } from "../api/client";

interface UserOption {
  name: string;
  email: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("COMMERCIAL");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "verification">("email");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load users when role changes
  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await api.get(`/auth/users/${role}`);
        setUsers(response.data);
        setEmail(""); // Clear email when role changes
      } catch (err) {
        console.error("Failed to load users:", err);
        setUsers([]);
      }
    }
    loadUsers();
  }, [role]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/send-verification-code", {
        email: email.toLowerCase(),
        role: role.toUpperCase(),
      });
      setStep("verification");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-code", {
        email: email.toLowerCase(),
        code: verificationCode.trim(),
        role: role.toUpperCase(),
      });

      await login(response.data.email, response.data.role);

      if (response.data.role === "PL") {
        navigate("/pl");
      } else if (response.data.role === "VP") {
        navigate("/vp");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: "COMMERCIAL", label: "Commercial", description: "Create pricing deviation requests" },
    { value: "PL", label: "Product Line Manager", description: "Review and approve/reject requests" },
    { value: "VP", label: "VP / Escalation", description: "Handle escalated pricing decisions" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h1 style={{ textAlign: "center", marginTop: 0, color: "#0f2a44" }}>
          Pricing Deviation
        </h1>

        {step === "email" ? (
          <form onSubmit={handleSendCode} style={{ display: "grid", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f2a44" }}>
                Select Your Role
              </label>
              <div style={{ display: "grid", gap: "10px" }}>
                {roles.map((r) => (
                  <label
                    key={r.value}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "12px",
                      border: `2px solid ${role === r.value ? "#0b5ed7" : "#ddd"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: role === r.value ? "#e7f1ff" : "white",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      value={r.value}
                      checked={role === r.value}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      style={{
                        marginRight: "12px",
                        marginTop: "2px",
                        cursor: "pointer",
                        width: "18px",
                        height: "18px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#0f2a44" }}>{r.label}</div>
                      <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                        {r.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f2a44" }}>
                Select User
              </label>
              <select
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "white",
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{ color: "#dc3545", fontSize: "14px" }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              style={{
                padding: "12px",
                background: "#0b5ed7",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: loading || !email ? "not-allowed" : "pointer",
                opacity: loading || !email ? 0.6 : 1,
              }}
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} style={{ display: "grid", gap: "20px" }}>
            <div>
              <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: "14px" }}>
                We've sent a verification code to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "24px",
                  textAlign: "center",
                  letterSpacing: "8px",
                  boxSizing: "border-box",
                  fontWeight: 600,
                }}
              />
              <p style={{ fontSize: "12px", color: "#999", margin: "8px 0 0 0" }}>
                Code expires in 10 minutes
              </p>
            </div>

            {error && (
              <div style={{ color: "#dc3545", fontSize: "14px" }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              style={{
                padding: "12px",
                background: "#0b5ed7",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: loading || verificationCode.length !== 6 ? "not-allowed" : "pointer",
                opacity: loading || verificationCode.length !== 6 ? 0.6 : 1,
              }}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setVerificationCode("");
                setError("");
              }}
              style={{
                padding: "12px",
                background: "transparent",
                color: "#0b5ed7",
                border: "2px solid #0b5ed7",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </form>
        )}

        <p style={{ fontSize: "12px", color: "#666", textAlign: "center", margin: "20px 0 0 0" }}>
          Demo mode: Codes sent to browser console
        </p>
      </div>
    </div>
  );
}

