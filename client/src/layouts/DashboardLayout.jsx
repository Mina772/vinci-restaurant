import { Outlet, NavLink } from "react-router-dom";
import { FiShoppingBag, FiUser, FiGrid, FiHome } from "react-icons/fi";

const customerLinks = [
  { to: "/account/orders", label: "My Orders", icon: FiShoppingBag },
  { to: "/account/profile", label: "Profile", icon: FiUser },
];
const adminLinks = [{ to: "/admin", label: "Dashboard", icon: FiGrid, end: true }];

export default function DashboardLayout({ admin = false }) {
  const links = admin ? adminLinks : customerLinks;
  return (
    <div className="container-lux flex flex-col gap-8 py-10 md:flex-row">
      <aside className="md:w-64 shrink-0">
        <div className="card p-4">
          <NavLink to="/" className="mb-4 flex items-center gap-2 text-gold">
            <FiHome /> Back to site
          </NavLink>
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                    isActive ? "bg-gold text-ink" : "text-gray-300 hover:bg-ink-muted"
                  }`
                }
              >
                <Icon /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <section className="flex-1">
        <Outlet />
      </section>
    </div>
  );
}
