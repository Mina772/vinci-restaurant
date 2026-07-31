import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../features/auth/authSlice.js";
import { useAddToCartMutation } from "../../features/cart/cartApi.js";

export default function ProductCard({ product }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const handleAdd = async () => {
    if (!isAuth) return toast.error("Please sign in to order");
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err?.data?.message || "Could not add to cart");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="card group flex flex-col"
    >
      <Link to={`/menu/${product._id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={product.thumbnail || product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        {product.isBestSeller && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
            Best Seller
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/menu/${product._id}`} className="font-serif text-lg text-gray-100 hover:text-gold">
            {product.name}
          </Link>
          <span className="flex items-center gap-1 text-sm text-gold">
            <FiStar className="fill-gold" /> {product.ratingAverage?.toFixed(1) || "—"}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-gray-400">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-semibold text-gold">{product.price} EGP</span>
          <button onClick={handleAdd} disabled={isLoading} className="btn-gold px-4 py-2 text-sm">
            <FiPlus /> Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
