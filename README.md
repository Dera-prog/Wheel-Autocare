# Wheel-Autocare
WheelWell-AutoCare is a mobile app that helps car owners and professional drivers proactively manage vehicle health, servicing schedules and critical documents. It combines three things in one place: smart maintenance and renewal reminders, vehicle tracking and fuel analytics, and secure, offline-capable document storage.

## V1 web demo

React + Vite PWA. Everything is local-first: the garage lives in `localStorage`, there is no backend and no SMS or email is sent.

```bash
npm install
npm run dev       # http://localhost:5183
npm run build     # typecheck + production PWA build
npm run preview   # serve the built app
```

### Docker (Node 22)

```bash
docker compose up   # http://localhost:5183
```

The container installs dependencies into its own `node_modules` volume, so it never touches the host install.

First launch plays the animated splash and three intro slides. Sign in with any name, or tap **Use sample details** to open the seeded garage: a 2018 Toyota Corolla (LAG 482 XA, 72,480 km) with documents at different expiry stages, maintenance tasks, service history and eight Lagos workshops.

## Screens

- **Home** — garage health, needs-attention list, upcoming maintenance, closest expiries, odometer update.
- **Vault** — document folders, search, expired / expiring / active groups, paper-style viewer with renewal schedule, add and renew documents.
- **Service** — health ring, upcoming and overdue tasks, log-service sheet, add your own service, history and spend.
- **Garage** — verified mechanics with call, WhatsApp and directions links, plus emergency 112.
- **Settings** — vehicle and profile editing, alert schedule, preferences, data export/reset, sign out.

## Notes

- All document photos are stored as data URLs on the device; nothing leaves the browser.
- SMS/email toggles are preferences only in this demo.
- Built from the WheelWell AutoCare v1.1 PRD and the Figma design system.

