import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminCustomers from "./pages/AdminCustomers";
import AdminVehiclesPage from "./pages/AdminVehiclesPage";  // ✅ import แค่ครั้งเดียว
import BookingList from "./pages/BookingList";
import BookingDetail from "./pages/BookingDetail";
import MyVehicles from "./pages/MyVehicles";
import BookService from "./pages/BookService";
import PartsManager from "./pages/PartsManager";
function AppRoutes() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin only */}
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
          path="/admin/vehicles"
          element={
            <ProtectedRoute allowedRoles={["r1"]}>
              <AdminVehiclesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parts"
          element={
            <ProtectedRoute allowedRoles={["r1"]}>
              <PartsManager />
            </ProtectedRoute>
          }
        />

        {/* User only */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["r2"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-vehicles"
          element={
            <ProtectedRoute allowedRoles={["r2"]}>
              <MyVehicles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-service"
          element={
            <ProtectedRoute allowedRoles={["r2"]}>
              <BookService />
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={["r1", "r2"]}>
              <BookingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={["r1", "r2"]}>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
console.log("AdminDashboard =", AdminDashboard);
console.log("AdminVehiclesPage =", AdminVehiclesPage);
console.log("Navbar =", Navbar);
console.log("ProtectedRoute =", ProtectedRoute);


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
