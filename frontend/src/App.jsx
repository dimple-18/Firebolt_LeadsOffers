import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Reset from "@/pages/Reset";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Offers from "@/pages/Offers";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Admin from "@/pages/Admin";
import AdminUsers from "@/pages/AdminUsers";
import AdminOffers from "@/pages/AdminOffers";
import Leads from "@/pages/Leads";   // ✅ already added

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/offers"
        element={
          <ProtectedRoute>
            <Offers />
          </ProtectedRoute>
        }
      />

      {/* Admin routes (still protected by auth) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/offers"
        element={
          <ProtectedRoute>
            <AdminOffers />
          </ProtectedRoute>
        }
      />

      {/* ✅ NEW: Admin leads page */}
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
