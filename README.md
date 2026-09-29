# Tasty

A mobile-first food-corner menu and order-notification prototype built with HTML, CSS, and JavaScript.

## Run locally

1. Copy the environment template and add a **new** Resend API key and your notification email:

   ```bash
   cp .env.example .env
   ```

2. Start the integrated web and order-email server:

   ```bash
   set -a && . ./.env && set +a && npm start
   ```

3. Open `http://localhost:8000`.

## Email notifications

When a customer places an order, the browser sends the cart to `POST /api/orders`. `server.js` validates the order and sends the email through Resend. The API key is read only from the server environment and is never sent to the browser or committed to Git.

Set these values in `.env`:

- `RESEND_API_KEY`: a Resend API key.
- `ORDER_NOTIFICATION_EMAIL`: the inbox that should receive the order notification.
- `ORDER_FROM_EMAIL`: a Resend-approved sender. Use the Resend onboarding sender only for initial testing; use an address on a verified domain for production.

Do not put real keys in frontend files, `index.html`, or Git commits. If a key was ever shared publicly, revoke it in Resend and create a replacement before configuring `.env`.
