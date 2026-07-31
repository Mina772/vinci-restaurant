import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useGetCartQuery } from "../features/cart/cartApi.js";
import { useCheckoutMutation } from "../features/orders/orderApi.js";
import Spinner from "../components/ui/Spinner.jsx";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetCartQuery();
  const [checkout, { isLoading: placing }] = useCheckoutMutation();
  const [type, setType] = useState("delivery");
  const { register, handleSubmit } = useForm();

  if (isLoading) return <Spinner />;
  const items = data?.data?.items || [];
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const onSubmit = async (form) => {
    const payload = {
      type,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      ...(type === "delivery" && {
        address: {
          label: "Home",
          street: form.street,
          city: form.city,
          phone: form.phone,
        },
      }),
    };
    try {
      const res = await checkout(payload).unwrap();
      toast.success(`Order ${res.data.orderNumber} placed!`);
      navigate("/account/orders");
    } catch (err) {
      toast.error(err?.data?.message || "Checkout failed");
    }
  };

  if (!items.length)
    return <p className="container-lux py-24 text-center text-gray-400">Your cart is empty.</p>;

  return (
    <div className="container-lux py-12">
      <h1 className="mb-8 text-4xl text-gold">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 text-xl text-gold">Order Type</h2>
            <div className="flex gap-4">
              {["delivery", "pickup"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-lg border px-4 py-3 capitalize ${
                    type === t ? "border-gold bg-gold/10 text-gold" : "border-ink-muted text-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {type === "delivery" && (
            <div className="card space-y-4 p-6">
              <h2 className="text-xl text-gold">Delivery Address</h2>
              <input className="input" placeholder="Street address" {...register("street", { required: true })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input" placeholder="City" {...register("city", { required: true })} />
                <input className="input" placeholder="Phone" {...register("phone", { required: true })} />
              </div>
            </div>
          )}

          <div className="card space-y-4 p-6">
            <h2 className="text-xl text-gold">Payment Method</h2>
            <select className="input" {...register("paymentMethod", { required: true })}>
              <option value="cash">Cash on Delivery</option>
              <option value="stripe">Card (Stripe)</option>
              <option value="paypal">PayPal</option>
              <option value="wallet">VINCI Wallet</option>
            </select>
            <textarea className="input" rows="3" placeholder="Order notes (optional)" {...register("notes")} />
          </div>
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 text-xl text-gold">Summary</h2>
          {items.map((i) => (
            <div key={i._id} className="flex justify-between py-1 text-sm text-gray-400">
              <span>{i.quantity}× {i.name}</span>
              <span>{i.unitPrice * i.quantity} EGP</span>
            </div>
          ))}
          <div className="my-3 border-t border-ink-muted" />
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span><span>{subtotal} EGP</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Tax (14%)</span><span>{(subtotal * 0.14).toFixed(2)} EGP</span>
          </div>
          {type === "delivery" && subtotal < 500 && (
            <div className="flex justify-between text-gray-400">
              <span>Delivery</span><span>30 EGP</span>
            </div>
          )}
          <button disabled={placing} className="btn-gold mt-6 w-full">
            {placing ? "Placing…" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
