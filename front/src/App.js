// src/App.js
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminCustomers from "./pages/AdminCustomers";
function AppRoutes() {
  const location = useLocation();
  // ถ้าอยากซ่อน Navbar ในหน้า Login/Register ให้แก้ตรงนี้
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />} {/* ✅ Navbar ทุกหน้า ยกเว้น login/register */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["r1"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute allowedRoles={["r1"]}>
              <AdminCustomers />
            </ProtectedRoute>
          }
        />


        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["r2"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
