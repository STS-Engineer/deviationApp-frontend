import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../ui/AppLayout.tsx";
import CommercialDashboard from "../pages/commercial/CommercialDashboard.tsx";
import CreateRequest from "../pages/commercial/CreateRequest.tsx";
import SubmitSuccess from "../pages/commercial/SubmitSuccess.tsx";
import RequestDetails from "../pages/commercial/RequestDetails.tsx";
import PLInbox from "../pages/pl/PLInbox.tsx";
import PLDecision from "../pages/pl/PLDecision.tsx";
import VPInbox from "../pages/vp/VPInbox.tsx";
import VPDecision from "../pages/vp/VPDecision.tsx";
import Login from "../pages/Login.tsx";
import ErrorPage from "../pages/ErrorPage.tsx";
import RoleBasedRedirect from "../pages/RoleBasedRedirect.tsx";
import { ProtectedRoute } from "../components/ProtectedRoute.tsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <RoleBasedRedirect /> },
      { path: "/create", element: <CreateRequest /> },
      { path: "/my-requests", element: <CommercialDashboard /> },
      { path: "/submitted", element: <SubmitSuccess /> },
      { path: "/pricing-requests/:id", element: <RequestDetails /> },
      {
        path: "/pl",
        element: <PLInbox />,
      },
      {
        path: "/pl/:id",
        element: <PLDecision />,
      },
      {
        path: "/vp",
        element: <VPInbox />,
      },
      {
        path: "/vp/:id",
        element: <VPDecision />,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
