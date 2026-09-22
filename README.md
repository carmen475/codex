# Sample Service Checkout

A fake service checkout app starter for `carmen475/codex`.

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

Replace the placeholder services in `src/main.js` when you have the real service package names, descriptions, and prices.

## Google Workspace administration

Chrome cannot be uninstalled from a computer by deleting it from Google Workspace. Administrators who need to remove a managed-browser record, stop managing browsers, or remove Chrome from an endpoint should follow the [Google Workspace Chrome removal runbook](docs/remove-chrome-from-google-workspace.md).
