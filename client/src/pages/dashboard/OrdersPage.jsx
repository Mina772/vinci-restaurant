import { Link } from "react-router-dom";
import { useMyOrdersQuery, useCancelOrderMutation } from "../../features/orders/orderApi.js";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner.jsx";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  preparing: "bg-orange-500/20 text-orange-400",
  cooking: "bg-orange-500/20 text-orange-400",
  ready: "bg-purple-500/20 text-purple-400",
  out_for_delivery: "bg-indigo-500/20 text-indigo-400",
  delivered: "bg-green-500/20 text-green-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function OrdersPage() {
  const { data, isLoading } = useMyOrdersQuery();
  const [cancelOrder] = useCancelOrderMutation();

  if (isLoading) return <Spinner />;
  const orders = data?.data || [];

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id).unwrap();
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err?.data?.message || "Cannot cancel");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl text-gold">My Orders</h1>
      {orders.length ? (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-gold">{o.orderNumber}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(o.createdAt).toLocaleString()} · {o.items.length} items
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[o.status] || "bg-gray-500/20 text-gray-300"}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
                <span className="text-lg font-semibold text-gold">{o.total} EGP</span>
              </div>
              {["pending", "confirmed"].includes(o.status) && (
                <button onClick={() => handleCancel(o._id)} className="mt-3 text-sm text-red-400 hover:underline">
                  Cancel order
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-gray-400">
          <p>No orders yet.</p>
          <Link to="/menu" className="btn-gold mt-4 inline-flex">Browse Menu</Link>
        </div>
      )}
    </div>
  );
}
