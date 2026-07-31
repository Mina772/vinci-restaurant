# Architecture

## High-level

```
React SPA (Vite/Redux)  --HTTPS/JSON-->  Express REST API  --Mongoose-->  MongoDB
         ^  httpOnly JWT cookies  |
         +-----------------------+
```

## Backend layering (Clean Architecture)

```
routes --> middlewares (auth, validate, rateLimit, security)
   |
   v
controllers --> services (business logic, transactions)
                    |
                    v
                 models (Mongoose schemas + methods)
```

- **routes** — HTTP surface, Swagger annotations, wiring only.
- **middlewares** — cross-cutting concerns (auth/RBAC, Zod validation, error normalisation, rate limiting, sanitisation).
- **controllers** — thin; translate HTTP to service calls and shape responses.
- **services** — orchestrate multi-model workflows (auth, checkout); the only layer allowed to open transactions.
- **models** — schema, indexes, instance/static methods, hooks.
- **utils** — framework-agnostic helpers (ApiError, ApiResponse, asyncHandler, tokens, cookies, pagination, email).

### Cross-cutting patterns
- `asyncHandler` removes repetitive try/catch and funnels async errors into one error middleware.
- `ApiError` / `ApiResponse` guarantee a uniform response envelope.
- Zod validators validate & coerce body/query/params before controllers run.
- Env validation (config/env.js) fails fast on misconfiguration.

## Data model (ER overview)

```
User 1---* Address (embedded)
User 1---1 Cart 1---* CartItem *--- Product
User 1---* Order 1---* OrderItem *--- Product
Product *---1 Category 0---1 Category(parent)
Product 1---* Review *---1 User
Order   *---0 Coupon
User 1---* Reservation
User 1---* Notification
```

Key indexes: `User.email`, Product text index (name/description/tags),
`Product.{category,isFeatured,isPopular,isAvailable}`, `Order.{status,user,createdAt}`,
unique `Review(product,user)`, `Coupon.code`.

## Security model
- Access token (15m) + refresh token (7d), both httpOnly/SameSite cookies.
- `tokenVersion` enables server-side refresh-token revocation (logout-all, password change/reset).
- Account lockout after repeated failed logins.
- RBAC via `authorize(...roles)` over six roles.
- Defence in depth: Helmet, CORS allow-list, global + auth rate limiters, Mongo-sanitize, HPP, XSS clean, bcrypt(12).

## Transactions
Checkout runs inside a Mongo session/transaction: validates stock, applies the coupon,
decrements stock, awards loyalty points and clears the cart atomically.

## Frontend
- Redux Toolkit for state, RTK Query for server cache & data fetching.
- Route-based code splitting, protected routes by role.
- Tailwind design system with a luxury dark/gold theme.
