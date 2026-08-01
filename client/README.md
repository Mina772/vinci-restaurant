# VINCI Restaurant — Frontend

React 19 + Vite SPA for the VINCI Restaurant platform. Luxury dark-gold theme,
Redux Toolkit + RTK Query data layer, TailwindCSS styling, Framer Motion animation.

## Stack

- **React 19** + **Vite 5**
- **Redux Toolkit** + **RTK Query** (auth-aware base query with silent token refresh)
- **React Router v6** (public + protected + role-guarded routes)
- **TailwindCSS** design system (`btn-gold`, `card`, `input`, `container-lux`)
- **React Hook Form** for forms, **React Hot Toast** for notifications
- **Recharts** for the admin analytics dashboard
- **Framer Motion** for micro-interactions

## Getting started

```bash
cd client
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev               # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:5000` (see `vite.config.js`),
so run the backend (`../server`) alongside it.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Structure

```
src/
  app/            # store + RTK Query base api slice
  features/       # auth, catalog, cart, orders, admin (slices + api endpoints)
  components/     # layout (navbar/footer), ui (ProductCard, Spinner), routing guards
  layouts/        # MainLayout, DashboardLayout
  pages/          # Home, Menu, ProductDetail, Cart, Checkout, Reservation,
                  # auth/*, dashboard/*, admin/*
```

## Routes

| Path | Access | Description |
| --- | --- | --- |
| `/` | public | Landing page (hero, categories, featured, story) |
| `/menu` | public | Menu with search, category filter & sort |
| `/menu/:id` | public | Product detail with gallery, nutrition & reviews |
| `/cart` | public* | Shopping cart |
| `/checkout` | protected | Address, payment method & order placement |
| `/reservations` | public | Table reservation request |
| `/login`, `/register`, `/forgot-password` | public | Authentication |
| `/account/orders`, `/account/profile` | protected | Customer dashboard |
| `/admin` | admin/manager | Analytics dashboard (revenue, status, top products) |

\* Cart prompts sign-in for server-side persistence.

## Production

A multi-stage `Dockerfile` builds the SPA and serves it via nginx with gzip and
SPA history fallback (`nginx.conf`).
