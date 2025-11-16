import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Reset from "@/pages/Reset";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Offers from "@/pages/Offers";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Admin from "@/pages/Admin"; // 👈 NEW

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

      {/* 🔐 Admin-only route (still wrapped in ProtectedRoute) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
