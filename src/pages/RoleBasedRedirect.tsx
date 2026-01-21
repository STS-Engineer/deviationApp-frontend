import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific dashboard
  if (user.role === "PL") {
    return <Navigate to="/pl" replace />;
  } else if (user.role === "VP") {
    return <Navigate to="/vp" replace />;
  } else {
    // Default to commercial dashboard
    return <Navigate to="/my-requests" replace />;
  }
}
