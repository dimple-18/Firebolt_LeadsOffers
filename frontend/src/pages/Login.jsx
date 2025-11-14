import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  // If already logged in, go to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setErr("");
    try {
      await login(data.email, data.password);
      console.log("LOGIN OK");
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      // Friendly messages
      const code = e?.code || "";
      if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
        setErr("Invalid email or password.");
      } else if (code.includes("auth/user-not-found")) {
        setErr("No account found. Please create one.");
      } else if (code.includes("auth/too-many-requests")) {
        setErr("Too many attempts. Try again later.");
      } else {
        setErr("Could not sign in. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-orange-50 to-white">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4">Welcome back</h1>

        {err && <div className="mb-3 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>}

        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input {...register("email")} className="mt-1 w-full rounded border p-2" />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input type="password" {...register("password")} className="mt-1 w-full rounded border p-2" />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </label>

        <button disabled={isSubmitting} className="w-full rounded bg-slate-900 text-white py-2">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <button type="button" onClick={loginWithGoogle} className="w-full mt-3 rounded border py-2">
          Continue with Google
        </button>

        <div className="mt-4 text-sm flex justify-between">
          <Link to="/register" className="underline">Create account</Link>
          <Link to="/reset" className="underline">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
}
