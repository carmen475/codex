# Service Checkout Starter

A neutral service checkout app starter for `carmen475/codex`.

It includes:

- placeholder service package cards
- service order quantity controls
- client-detail validation
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

Replace the placeholder services in `src/main.js` when you have the real service business name, service packages, and prices.
