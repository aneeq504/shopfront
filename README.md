# ShopFront

A Daraz-style storefront where only the site owner can list products and customers can browse, add to cart, and place orders. No online payment — orders are placed as cash on delivery.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM with SQLite
- Cart state in React context, persisted to `localStorage`
- Admin access via a password-protected, HMAC-signed cookie session

## Getting started

```bash
npm install
cp .env.example .env      # set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npx prisma migrate deploy # create the SQLite database
npx prisma db seed        # optional demo products
npm run dev
```

Open http://localhost:3000. The admin panel is at http://localhost:3000/admin (log in with `ADMIN_PASSWORD`).

## Features

Customer:
- Accounts: sign up and sign in at `/account/register` and `/account/login` (scrypt-hashed passwords, HMAC-signed cookie session)
- Email OTP: every sign-up and sign-in is confirmed with a 6-digit code emailed to the customer (10-minute expiry, 5 attempts, single use)
- `/account` shows saved contact details, a profile editor, and the customer's own order history
- Profile changes (name, email, password, phone, address) only take effect after confirming a 6-digit code emailed to the address being used; changing email or password also requires the current password
- Checkout requires being signed in and is prefilled from the account
- Dark themed UI; product cards lift on hover
- Products with zero stock are shown as "Out of stock" and cannot be added to the cart
- Product grid with search and category filters
- Product detail pages
- Cart with quantity editing, persisted between visits
- Checkout with delivery details; order confirmation page
- 24-hour cancellation window: an order can be cancelled from its confirmation page for 24 hours (stock is returned), after which it is marked "Sent for delivery"

Owner (admin only):
- Password login at `/admin/login`
- Create, edit, and delete products (name, description, price, stock, category, image URL)
- Adjust the stock quantity of any product inline from the product list (+ / − or typed value)
- View all placed orders with customer, item details, and current state (pending / cancelled / sent for delivery)

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite connection string, e.g. `file:./dev.db` (resolved relative to `prisma/`) |
| `ADMIN_PASSWORD` | Password for the owner login |
| `ADMIN_SESSION_SECRET` | Secret used to sign the admin session cookie |
| `CUSTOMER_SESSION_SECRET` | Secret used to sign customer session cookies and hash OTP codes |
| `SMTP_HOST` | SMTP server for OTP emails; when unset, codes are logged to the server console instead of sent |
| `SMTP_PORT` | SMTP port (default `587`; `465` switches to implicit TLS) |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP credentials (for Gmail, an app password) |
| `SMTP_FROM` | From address for outgoing mail (defaults to `SMTP_USER`) |

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production build and server
- `npm run lint`, `npm run typecheck`
- `npm run db:setup` — apply migrations and seed
