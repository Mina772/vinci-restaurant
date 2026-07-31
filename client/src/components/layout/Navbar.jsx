import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiShoppingCart, FiMenu, FiX, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { selectCurrentUser, logOut } from "../../features/auth/authSlice.js";
import { useGetCartQuery } from "../../features/cart/cartApi.js";
import { useLogoutMutation } from "../../features/auth/authApi.js";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reservations" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery(undefined, { skip: !user });
  const [logout] = useLogoutMutation();
  const count = cart?.data?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      /* ignore */
    }
    dispatch(logOut());
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-muted bg-ink/90 backdrop-blur">
      <nav className="container-lux flex h-20 items-center justify-between">
        <Link to="/" className="text-2xl font-serif font-bold tracking-wide text-gold">
          VINCI
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-gold ${
                  isActive ? "text-gold" : "text-gray-300"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative text-gray-200 hover:text-gold">
            <FiShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              {["admin", "manager"].includes(user.role) && (
                <Link to="/admin" className="text-sm text-gold hover:underline">
                  Admin
                </Link>
              )}
              <Link to="/account" className="flex items-center gap-2 text-gray-200 hover:text-gold">
                <FiUser /> {user.name?.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="btn-outline px-4 py-2 text-sm">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden btn-gold px-5 py-2 text-sm md:inline-flex">
              Sign In
            </Link>
          )}

          <button className="md:hidden text-gray-200" onClick={() => setOpen((o) => !o)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink-muted bg-ink md:hidden">
          <div className="container-lux flex flex-col gap-2 py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-gray-200 hover:text-gold"
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <button onClick={handleLogout} className="btn-outline mt-2">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-gold mt-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
