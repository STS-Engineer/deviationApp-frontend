import { Link, useSearchParams } from "react-router-dom";
import NotificationBar from "../../components/NotificationBar";

export default function SubmitSuccess() {
  const [params] = useSearchParams();
  const requestId = params.get("request_id");
  const status = params.get("status");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <NotificationBar
        type="success"
        message="Your pricing deviation request has been submitted successfully!"
        autoClose={true}
        duration={5000}
      />

      <h2 style={{ margin: 0 }}>Request submitted ✅</h2>

      <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div><strong>Request ID:</strong> {requestId ?? "-"}</div>
          <div><strong>Status:</strong> {status ?? "-"}</div>
          <div style={{ marginTop: 10, color: "#374151" }}>
            Your request has been sent to the Product Line responsible for review.
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link to="/" style={{ textDecoration: "none", fontWeight: 700 }}>
            + Create another request
          </Link>
        </div>
      </div>
    </div>
  );
}
