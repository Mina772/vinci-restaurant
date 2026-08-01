import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { FiDollarSign, FiShoppingBag, FiUsers, FiCalendar } from "react-icons/fi";
import { useGetDashboardQuery } from "../../features/admin/adminApi.js";
import Spinner from "../../components/ui/Spinner.jsx";

const COLORS = ["#c8a04f", "#e0c589", "#a07c2f", "#8a6d2a", "#d4b878", "#b8944a"];

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetDashboardQuery();
  if (isLoading) return <Spinner />;

  const d = data?.data || {};
  const kpis = d.kpis || {};
  const revenueByDay = (d.revenueByDay || []).map((r) => ({ date: r._id?.slice(5), revenue: r.revenue, orders: r.orders }));
  const statusData = (d.statusBreakdown || []).map((s) => ({ name: s._id, value: s.count }));

  return (
    <div>
      <h1 className="mb-6 text-3xl text-gold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={FiDollarSign} label="Total Revenue" value={`${(kpis.totalRevenue || 0).toLocaleString()} EGP`} />
        <Kpi icon={FiShoppingBag} label="Total Orders" value={kpis.totalOrders || 0} />
        <Kpi icon={FiUsers} label="Customers" value={kpis.totalCustomers || 0} />
        <Kpi icon={FiCalendar} label="Pending Reservations" value={kpis.pendingReservations || 0} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg text-gold">Revenue (last 30 days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueByDay}>
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #c8a04f" }} />
              <Line type="monotone" dataKey="revenue" stroke="#c8a04f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-lg text-gold">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((e, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #c8a04f" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="mb-4 text-lg text-gold">Top Selling Products</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={d.topProducts || []}>
            <XAxis dataKey="name" stroke="#666" fontSize={11} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #c8a04f" }} />
            <Bar dataKey="soldCount" fill="#c8a04f" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-4 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-gray-100">{value}</p>
      </div>
    </div>
  );
}
