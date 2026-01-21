import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import backgroundImage from "../assets/back.jpg";

export default function AppLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
