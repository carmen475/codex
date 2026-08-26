# Checkout Starter

A neutral checkout app starter for `carmen475/codex`.

It includes:

- placeholder product cards
- cart quantity controls
- customer-detail validation
- safe simulated payment success
- safe simulated payment decline
- no real payment processor and no real charges

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

## Test cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

Replace the placeholder products in `src/main.js` when you have the real store name, products, and prices.
