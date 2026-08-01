import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useRegisterMutation } from "../../features/auth/authApi.js";
import { setCredentials } from "../../features/auth/authSlice.js";
import { AuthShell } from "./LoginPage.jsx";

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [signup, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async ({ confirm, ...data }) => {
    try {
      const res = await signup(data).unwrap();
      dispatch(setCredentials(res.data));
      toast.success("Account created — welcome to VINCI!");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthShell title="Create Account" subtitle="Join the VINCI experience">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input className="input" placeholder="Full name" {...register("name", { required: "Name required", minLength: { value: 2, message: "Too short" } })} />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        <input className="input" type="email" placeholder="Email" {...register("email", { required: "Email required" })} />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        <input className="input" placeholder="Phone (optional)" {...register("phone")} />
        <input className="input" type="password" placeholder="Password" {...register("password", { required: "Password required", minLength: { value: 8, message: "Min 8 characters" } })} />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        <input className="input" type="password" placeholder="Confirm password" {...register("confirm", { validate: (v) => v === watch("password") || "Passwords do not match" })} />
        {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
        <button disabled={isLoading} className="btn-gold w-full">{isLoading ? "Creating…" : "Create Account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account? <Link to="/login" className="text-gold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
