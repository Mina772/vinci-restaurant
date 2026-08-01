import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { apiSlice } from "../app/api/apiSlice.js";

const reservationApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    createReservation: b.mutation({
      query: (body) => ({ url: "/reservations", method: "POST", body }),
    }),
  }),
});
const { useCreateReservationMutation } = reservationApi;

export default function ReservationPage() {
  const { register, handleSubmit, reset } = useForm();
  const [createReservation, { isLoading }] = useCreateReservationMutation();

  const onSubmit = async (form) => {
    try {
      await createReservation({ ...form, partySize: Number(form.partySize) }).unwrap();
      toast.success("Reservation requested — we'll confirm by email");
      reset();
    } catch (err) {
      toast.error(err?.data?.message || "Could not submit reservation");
    }
  };

  return (
    <div className="container-lux max-w-2xl py-16">
      <h1 className="text-center text-4xl text-gold">Reserve a Table</h1>
      <p className="mt-3 text-center text-gray-400">
        Secure your VINCI experience. We'll confirm availability shortly.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-10 space-y-4 p-8">
        <input className="input" placeholder="Full name" {...register("name", { required: true })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" type="email" placeholder="Email" {...register("email", { required: true })} />
          <input className="input" placeholder="Phone" {...register("phone", { required: true })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <input className="input" type="date" {...register("date", { required: true })} />
          <input className="input" type="time" {...register("time", { required: true })} />
          <input className="input" type="number" min="1" placeholder="Guests" {...register("partySize", { required: true })} />
        </div>
        <textarea className="input" rows="3" placeholder="Special requests (optional)" {...register("notes")} />
        <button disabled={isLoading} className="btn-gold w-full">
          {isLoading ? "Submitting…" : "Request Reservation"}
        </button>
      </form>
    </div>
  );
}
