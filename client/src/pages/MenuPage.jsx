import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useGetProductsQuery, useGetCategoriesQuery } from "../features/catalog/catalogApi.js";
import ProductCard from "../components/ui/ProductCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";

export default function MenuPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const category = params.get("category") || "";
  const [sort, setSort] = useState("-createdAt");

  const query = useMemo(
    () => ({ ...(category && { category }), ...(search && { search }), sort, limit: 24 }),
    [category, search, sort]
  );
  const { data, isFetching } = useGetProductsQuery(query);
  const { data: categories } = useGetCategoriesQuery();

  return (
    <div className="container-lux py-12">
      <h1 className="mb-2 text-4xl text-gold">Our Menu</h1>
      <p className="mb-8 text-gray-400">Explore our chef-crafted selection.</p>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-11"
            placeholder="Search meals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input md:w-56"
          value={category}
          onChange={(e) => setParams(e.target.value ? { category: e.target.value } : {})}
        >
          <option value="">All Categories</option>
          {categories?.data?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input md:w-56" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-ratingAverage">Top Rated</option>
          <option value="-soldCount">Most Popular</option>
        </select>
      </div>

      {isFetching ? (
        <Spinner />
      ) : data?.data?.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-gray-400">No meals found. Try another search.</p>
      )}
    </div>
  );
}
