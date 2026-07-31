import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiClock, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetProductQuery, useGetProductReviewsQuery } from "../features/catalog/catalogApi.js";
import { useAddToCartMutation } from "../features/cart/cartApi.js";
import { selectIsAuthenticated } from "../features/auth/authSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetProductQuery(id);
  const { data: reviews } = useGetProductReviewsQuery(id);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const isAuth = useSelector(selectIsAuthenticated);
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();

  if (isLoading) return <Spinner />;
  const p = data?.data;
  if (!p) return <p className="container-lux py-20 text-center">Product not found.</p>;

  const handleAdd = async () => {
    if (!isAuth) return toast.error("Please sign in to order");
    try {
      await addToCart({ productId: p._id, quantity: qty }).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.data?.message || "Could not add to cart");
    }
  };

  const gallery = p.images?.length ? p.images : [p.thumbnail];

  return (
    <div className="container-lux py-12">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/menu" className="hover:text-gold">Menu</Link> / <span className="text-gray-300">{p.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="card aspect-square">
            <img src={gallery[activeImg]} alt={p.name} className="h-full w-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${
                    activeImg === i ? "border-gold" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl text-white">{p.name}</h1>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1 text-gold">
              <FiStar className="fill-gold" /> {p.ratingAverage?.toFixed(1) || "—"} ({p.ratingCount || 0})
            </span>
            {p.preparationTime > 0 && (
              <span className="flex items-center gap-1">
                <FiClock /> {p.preparationTime} min
              </span>
            )}
          </div>
          <p className="mt-5 text-gray-300">{p.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {p.calories != null && (
              <Info label="Calories" value={`${p.calories} kcal`} />
            )}
            {p.ingredients?.length > 0 && (
              <Info label="Ingredients" value={p.ingredients.join(", ")} />
            )}
            {p.allergens?.length > 0 && (
              <Info label="Allergens" value={p.allergens.join(", ")} />
            )}
          </div>

          <div className="mt-8 flex items-center gap-6">
            <span className="text-3xl font-semibold text-gold">{p.price} EGP</span>
            <div className="flex items-center gap-3 rounded-full border border-ink-muted px-3 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-gold"><FiMinus /></button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="text-gold"><FiPlus /></button>
            </div>
          </div>

          <button onClick={handleAdd} disabled={adding || !p.isAvailable} className="btn-gold mt-6 w-full">
            {p.isAvailable ? "Add to Cart" : "Currently Unavailable"}
          </button>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 text-2xl text-gold">Reviews</h2>
        {reviews?.data?.length ? (
          <div className="space-y-4">
            {reviews.data.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-200">{r.user?.name || "Guest"}</span>
                  <span className="flex items-center gap-1 text-gold">
                    <FiStar className="fill-gold" /> {r.rating}
                  </span>
                </div>
                {r.title && <p className="mt-2 font-serif text-gray-100">{r.title}</p>}
                <p className="mt-1 text-sm text-gray-400">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No reviews yet. Be the first to review this meal.</p>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="card p-3">
      <p className="text-xs uppercase tracking-wide text-gold">{label}</p>
      <p className="mt-1 text-gray-300">{value}</p>
    </div>
  );
}
