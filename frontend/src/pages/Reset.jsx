import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

const schema = z.object({ email: z.string().email() });

export default function Reset() {
  const { resetPassword } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    await resetPassword(email);
    alert("Password reset email sent.");
    reset();
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-orange-50 to-white">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4">Reset password</h1>
        <label className="block mb-4">
          <span className="text-sm">Email</span>
          <input {...register("email")} className="mt-1 w-full rounded border p-2" />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </label>
        <button disabled={isSubmitting} className="w-full rounded bg-slate-900 text-white py-2">
          {isSubmitting ? "Sending…" : "Send reset email"}
        </button>
        <div className="mt-4 text-sm text-center">
          <Link to="/login" className="underline">Back to sign in</Link>
        </div>
      </form>
    </div>
  );
}
