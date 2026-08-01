import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { selectCurrentUser, setCredentials } from "../../features/auth/authSlice.js";
import { useUpdateProfileMutation } from "../../features/auth/authApi.js";

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const onSubmit = async (data) => {
    try {
      const res = await updateProfile(data).unwrap();
      dispatch(setCredentials({ user: res.data.user || res.data }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl text-gold">Profile</h1>
      <div className="card max-w-lg p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl font-bold text-ink">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="text-xs uppercase tracking-wide text-gold">{user?.role}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Full name</label>
            <input className="input" {...register("name", { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Phone</label>
            <input className="input" {...register("phone")} />
          </div>
          <button disabled={isLoading} className="btn-gold">{isLoading ? "Saving…" : "Save Changes"}</button>
        </form>
      </div>
    </div>
  );
}
