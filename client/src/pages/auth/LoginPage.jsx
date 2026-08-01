import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useLoginMutation } from "../../features/auth/authApi.js";
import { setCredentials } from "../../features/auth/authSlice.js";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res.data));
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || "Invalid credentials");
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to your VINCI account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input className="input" type="email" placeholder="Email" {...register("email", { required: "Email required" })} />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <input className="input" type="password" placeholder="Password" {...register("password", { required: "Password required" })} />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-400">
            <input type="checkbox" {...register("rememberMe")} className="accent-gold" /> Remember me
          </label>
          <Link to="/forgot-password" className="text-gold hover:underline">Forgot password?</Link>
        </div>
        <button disabled={isLoading} className="btn-gold w-full">{isLoading ? "Signing in…" : "Sign In"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        No account? <Link to="/register" className="text-gold hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-lux flex min-h-[80vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-center text-3xl text-gold">{title}</h1>
        <p className="mb-8 mt-2 text-center text-gray-400">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
