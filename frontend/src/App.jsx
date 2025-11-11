import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Reset from "@/pages/Reset";
import ProtectedRoute from "@/routes/ProtectedRoute";

function Dashboard() {
  return (
    <div className="min-h-screen grid place-items-center">
      <h1 className="text-3xl font-bold">Dashboard (Protected)</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}
