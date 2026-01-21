import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/back.jpg";

export default function ErrorPage() {
  const navigate = useNavigate();

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
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "60px 40px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <div
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            color: "#dc3545",
            marginBottom: "20px",
          }}
        >
          404
        </div>

        <h1 style={{ color: "#0f2a44", marginBottom: "10px", marginTop: 0 }}>
          Page Not Found
        </h1>

        <p style={{ color: "#666", fontSize: "16px", marginBottom: "30px" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            background: "#0b5ed7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
