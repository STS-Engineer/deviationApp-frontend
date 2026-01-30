import { useState, useEffect } from "react";
import { api } from "../api/client";
import NotificationBar from "./NotificationBar";

interface Comment {
  id: number;
  request_id: number;
  author_email: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CommentsThreadProps {
  requestId: number;
  currentUserEmail: string | undefined;
}

export default function CommentsThread({ requestId, currentUserEmail }: CommentsThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successNotification, setSuccessNotification] = useState("");

  useEffect(() => {
    loadComments();
  }, [requestId]);

  const loadComments = async () => {
    try {
      const res = await api.get(`/api/comments/request/${requestId}`);
      setComments(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("Failed to load comments");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("author_email", currentUserEmail || "");
      params.append("author_name", currentUserEmail || "Unknown");
      await api.post(`/api/comments/request/${requestId}?${params.toString()}`, { content: newComment });
      setNewComment("");
      await loadComments();
      setError("");
      setSuccessNotification("✅ Comment posted successfully! Notifications sent to all stakeholders.");
      setTimeout(() => setSuccessNotification(""), 5000);
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const params = new URLSearchParams();
      params.append("author_email", currentUserEmail || "");
      await api.delete(`/api/comments/${commentId}?${params.toString()}`);
      await loadComments();
      setError("");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError("Failed to delete comment");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "COMMERCIAL":
        return "#3b82f6";
      case "PL":
        return "#f59e0b";
      case "VP":
        return "#dc3545";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {successNotification && (
        <NotificationBar
          type="success"
          message={successNotification}
          autoClose={true}
          duration={5000}
          onClose={() => setSuccessNotification("")}
        />
      )}
      
      <div>
        <h3 style={{ margin: "0 0 16px 0", color: "#0f2a44", fontSize: "16px", fontWeight: 600 }}>
          💬 Discussion Thread
        </h3>

        {/* Comments List */}
        <div
          style={{
            display: "grid",
            gap: "12px",
            maxHeight: "400px",
            overflowY: "auto",
            marginBottom: "16px",
            background: "#f9fafb",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            minHeight: "100px",
          }}
        >
          {comments.length === 0 ? (
            <div style={{ color: "#999", fontSize: "14px", textAlign: "center", padding: "20px" }}>
              No comments yet. Start the discussion!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: "white",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          background: getRoleColor(comment.author_role),
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {comment.author_role}
                      </span>
                      <span style={{ fontWeight: 600, color: "#0f2a44", fontSize: "14px" }}>
                        {comment.author_name}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>

                  {comment.author_email === currentUserEmail && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#fecaca";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "#fee2e2";
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p style={{ margin: 0, color: "#333", fontSize: "14px", lineHeight: "1.5" }}>
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} style={{ display: "grid", gap: "8px" }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment to discuss this request..."
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "14px",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              style={{
                background: newComment.trim() ? "#10b981" : "#d1d5db",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: newComment.trim() ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </div>

          {error && <div style={{ color: "#dc3545", fontSize: "12px" }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
