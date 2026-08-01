import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useGetProductsQuery } from "../features/catalog/catalogApi.js";
import { useGetCategoriesQuery } from "../features/catalog/catalogApi.js";
import ProductCard from "../components/ui/ProductCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";

export default function HomePage() {
  const { data: featured, isLoading } = useGetProductsQuery({ featured: true, limit: 6 });
  const { data: categories } = useGetCategoriesQuery();

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,15,15,0.95), rgba(15,15,15,0.5)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')",
          }}
        />
        <div className="container-lux relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="mb-4 uppercase tracking-[0.3em] text-gold">Fine Dining Reimagined</p>
            <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl">
              Taste the Art of <span className="text-gold">VINCI</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-gray-300">
              Premium meals crafted by master chefs, delivered to your door or served in our elegant
              dining room.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/menu" className="btn-gold">
                Explore Menu <FiArrowRight />
              </Link>
              <Link to="/reservations" className="btn-outline">
                Book a Table
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories?.data?.length > 0 && (
        <section className="container-lux py-16">
          <h2 className="mb-8 text-center text-3xl text-gold">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {categories.data.map((c) => (
              <Link
                key={c._id}
                to={`/menu?category=${c._id}`}
                className="card flex flex-col items-center gap-2 p-4 text-center hover:border-gold"
              >
                <span className="text-3xl">{c.icon || "🍽️"}</span>
                <span className="text-sm text-gray-300">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="container-lux py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl text-gold">Featured Meals</h2>
          <Link to="/menu" className="text-sm text-gold hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured?.data?.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Story band */}
      <section className="border-y border-ink-muted bg-ink-soft py-20">
        <div className="container-lux grid items-center gap-10 md:grid-cols-2">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
            alt="VINCI dining room"
            loading="lazy"
            className="rounded-2xl object-cover"
          />
          <div>
            <p className="uppercase tracking-[0.3em] text-gold">Our Story</p>
            <h2 className="mt-3 text-4xl text-white">A Passion for Perfection</h2>
            <p className="mt-5 text-gray-400">
              Since our founding, VINCI has blended timeless culinary craft with modern innovation.
              Every plate is a canvas, every ingredient hand-selected for excellence.
            </p>
            <Link to="/reservations" className="btn-gold mt-8">
              Reserve Your Experience
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
