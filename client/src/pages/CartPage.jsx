import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectIsAuthenticated } from "../features/auth/authSlice.js";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from "../features/cart/cartApi.js";
import Spinner from "../components/ui/Spinner.jsx";

export default function CartPage() {
  const isAuth = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const { data, isLoading } = useGetCartQuery(undefined, { skip: !isAuth });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();

  if (!isAuth)
    return (
      <Empty text="Sign in to view your cart" cta="Sign In" to="/login" />
    );
  if (isLoading) return <Spinner />;

  const cart = data?.data;
  const items = cart?.items || [];
  if (!items.length) return <Empty text="Your cart is empty" cta="Browse Menu" to="/menu" />;

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const changeQty = async (item, delta) => {
    const q = item.quantity + delta;
    if (q < 1) return;
    try {
      await updateItem({ itemId: item._id, quantity: q }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <div className="container-lux py-12">
      <h1 className="mb-8 text-4xl text-gold">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item._id} className="card flex items-center gap-4 p-4">
              <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-serif text-lg text-gray-100">{item.name}</p>
                <p className="text-sm text-gold">{item.unitPrice} EGP</p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-ink-muted px-3 py-1">
                <button onClick={() => changeQty(item, -1)} className="text-gold"><FiMinus /></button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button onClick={() => changeQty(item, 1)} className="text-gold"><FiPlus /></button>
              </div>
              <button
                onClick={() => removeItem(item._id)}
                className="text-gray-400 hover:text-red-400"
                aria-label="Remove"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 text-xl text-gold">Order Summary</h2>
          <Row label="Subtotal" value={`${subtotal} EGP`} />
          <Row label="Tax (14%)" value={`${(subtotal * 0.14).toFixed(2)} EGP`} />
          <div className="my-4 border-t border-ink-muted" />
          <Row label="Estimated Total" value={`${(subtotal * 1.14).toFixed(2)} EGP`} bold />
          <button onClick={() => navigate("/checkout")} className="btn-gold mt-6 w-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "text-lg font-semibold text-gray-100" : "text-gray-400"}`}>
      <span>{label}</span>
      <span className={bold ? "text-gold" : ""}>{value}</span>
    </div>
  );
}

function Empty({ text, cta, to }) {
  return (
    <div className="container-lux flex flex-col items-center justify-center gap-4 py-24 text-center">
      <FiShoppingCart size={48} className="text-gold" />
      <p className="text-xl text-gray-300">{text}</p>
      <Link to={to} className="btn-gold">{cta}</Link>
    </div>
  );
}
