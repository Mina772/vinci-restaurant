import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useForgotPasswordMutation } from "../../features/auth/authApi.js";
import { AuthShell } from "./LoginPage.jsx";

export default function ForgotPasswordPage() {
  const { register, handleSubmit, reset } = useForm();
  const [forgot, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      await forgot(data).unwrap();
      toast.success("If that email exists, a reset link was sent");
      reset();
    } catch {
      toast.success("If that email exists, a reset link was sent");
    }
  };

  return (
    <AuthShell title="Reset Password" subtitle="We'll email you a secure reset link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input className="input" type="email" placeholder="Your email" {...register("email", { required: true })} />
        <button disabled={isLoading} className="btn-gold w-full">{isLoading ? "Sending…" : "Send Reset Link"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        <Link to="/login" className="text-gold hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
