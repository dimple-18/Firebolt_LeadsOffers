import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email(),
  password: z.string().min(6, "Min 6 characters"),
});

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    await signup(data.email, data.password, data.name);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-orange-50 to-white">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4">Create your account</h1>

        <label className="block mb-2">
          <span className="text-sm">Full name</span>
          <input {...register("name")} className="mt-1 w-full rounded border p-2" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </label>

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
          {isSubmitting ? "Creating…" : "Create account"}
        </button>

        <div className="mt-4 text-sm text-center">
          Already have an account? <Link to="/login" className="underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
