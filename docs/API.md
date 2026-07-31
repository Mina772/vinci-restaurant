# API Reference

Base URL: `http://localhost:5000/api/v1`
Interactive docs (Swagger UI): `GET /docs` - Raw spec: `GET /docs.json`

All responses share an envelope:
```json
{ "success": true, "statusCode": 200, "message": "...", "data": {}, "meta": {} }
```
Errors:
```json
{ "success": false, "statusCode": 400, "message": "Validation failed", "errors": [{"field":"email","message":"Invalid"}] }
```

Auth: send the access token as `Authorization: Bearer <token>` or rely on the httpOnly `accessToken` cookie set at login. Refresh via `POST /auth/refresh`.

## Endpoints

### Auth
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | - | Create account |
| POST | `/auth/login` | - | Login, returns tokens + sets cookies |
| POST | `/auth/refresh` | cookie | Rotate access token |
| POST | `/auth/logout` | yes | Revoke refresh tokens |
| GET | `/auth/me` | yes | Current user |
| POST | `/auth/verify-email` | - | Verify email with token |
| POST | `/auth/forgot-password` | - | Send reset link |
| POST | `/auth/reset-password` | - | Reset with token |
| PATCH | `/auth/change-password` | yes | Change password |
| PATCH | `/auth/profile` | yes | Update profile |

### Catalog
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/categories` | - | List categories (+subcategories) |
| GET | `/products` | - | List/search/filter/sort/paginate |
| GET | `/products/:id` | - | Product + reviews + related |
| GET | `/products/slug/:slug` | - | Product by slug |
| POST/PATCH/DELETE | `/products`,`/categories` | admin/manager | CRUD |
| GET | `/products/:productId/reviews` | - | List reviews |
| POST | `/products/:productId/reviews` | yes | Create review |

**Product query params:** `page, limit, sort (e.g. -ratingAverage,price), search, category, tag, minPrice, maxPrice, featured, popular, vegetarian`.

### Cart
`GET /cart` - `POST /cart/items` - `PATCH /cart/items/:itemId` - `DELETE /cart/items/:itemId` - `DELETE /cart` - `POST /cart/coupon` — all require auth.

### Orders
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/orders/checkout` | yes | Place order from cart |
| GET | `/orders/me` | yes | My orders |
| GET | `/orders/:id` | owner/staff | Order detail |
| PATCH | `/orders/:id/cancel` | owner | Cancel |
| GET | `/orders` | staff | All orders |
| PATCH | `/orders/:id/status` | staff | Update status |
| PATCH | `/orders/:id/assign-driver` | admin/manager | Assign driver |

### Users (self-service)
`/users/favorites`, `/users/favorites/:productId`, `/users/addresses[...]`, `/users/notifications[...]` — all require auth.

### Reservations
`POST /reservations` (guest ok) - `GET /reservations/me` - `GET /reservations` (staff) - `PATCH /reservations/:id/status` (staff).

### Admin
`GET /admin/dashboard`, `GET /admin/reports/sales`, `GET/PATCH /admin/users...`, `/admin/coupons...`, `/admin/reviews/:id/moderate|reply` — admin/manager only.

## Curl examples
```bash
curl -X POST localhost:5000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jane","email":"jane@x.com","password":"Passw0rd!"}'

curl 'localhost:5000/api/v1/products?featured=true&sort=price&limit=8'
```
