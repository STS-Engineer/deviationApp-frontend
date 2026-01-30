interface NotificationBarProps {
  type: "info" | "success" | "warning" | "error";
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const colorSchemes = {
  info: {
    bg: "#dbeafe",
    border: "#93c5fd",
    text: "#1e40af",
    icon: "ℹ️",
  },
  success: {
    bg: "#dcfce7",
    border: "#86efac",
    text: "#166534",
    icon: "✅",
  },
  warning: {
    bg: "#fef3c7",
    border: "#fde047",
    text: "#92400e",
    icon: "⚠️",
  },
  error: {
    bg: "#fee2e2",
    border: "#fca5a5",
    text: "#991b1b",
    icon: "❌",
  },
};

export default function NotificationBar({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: NotificationBarProps) {
  const scheme = colorSchemes[type];

  // Auto-close notification
  if (autoClose && onClose) {
    setTimeout(onClose, duration);
  }

  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "8px",
        border: `1px solid ${scheme.border}`,
        background: scheme.bg,
        color: scheme.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        fontSize: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>{scheme.icon}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "18px",
            padding: "0",
            display: "flex",
            alignItems: "center",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
