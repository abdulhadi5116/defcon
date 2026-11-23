# Server simulation

Production uses the private Sites frontend and the `defcon-realtime` Cloudflare Worker. Each session runs in its own SQLite-backed Durable Object. Browsers submit commands over WebSockets and render server snapshots/deltas; they never advance or overwrite the authoritative simulation. Pause and speed apply to every connected browser. Alarms keep unpaused games advancing after all browsers disconnect.

The existing Sites D1 saves remain intact. Opening a legacy session imports it into a Durable Object once, preserving its ID and game time. Browser view preferences remain local. The standalone Node server retains its legacy browser simulation unless a realtime proxy is configured.

## Deploy

Authenticate Wrangler to the account in `wrangler.realtime.jsonc`, then run `npm run deploy:realtime`. Set the Worker secret `BACKEND_TOKEN` through Wrangler's interactive stdin. Configure the Sites runtime values `REALTIME_BACKEND_URL` and secret `REALTIME_BACKEND_TOKEN`, then build/publish the frontend. Never include the token in browser assets or Git.

Bindings and SQLite migrations are declared in `wrangler.realtime.jsonc`. Separate `NavalRoutes` objects process expensive pathfinding without blocking the simulation room. Exact-coordinate navigation caching avoids repeated coastline scans for stationary fleets. Tick scheduling permits only one pending timer invocation per room.

## Verify

- `npm test` and `npm run check`
- `npm run build`
- Start the backend with `npm run dev:realtime` and a local-only test token; start the frontend Worker with its backend URL/token configured.
- `npm run test:realtime` checks two WebSockets, shared pause/speed, progression with all clients disconnected, reconnect, command deduplication, and snapshot overwrite rejection.
- Set `REALTIME_TEST_FAST=1` to verify the 20x clock through initial fleet deployment. Tests use a new `Realtime integration` session; `REALTIME_TEST_CLEANUP=1` removes only that test session on a direct backend run.

The backend exposes public `/health`; all session and maintenance endpoints require the server bearer secret. The frontend forwards only the public session protocol, never internal import/delete/metrics routes. Sites access controls continue protecting the frontend and WebSocket proxy.

## Deployment verification (2026-11-23)

418 unit/regression tests passed. The network integration passed against both the direct Cloudflare backend and the owner-private Sites URL, including an actual WebSocket upgrade through Sites. Two independent local browser profiles passed shared control, background progression, reload without takeover, lab creation, and a server-side unit mode command. The Cloudflare 20x smoke test passed initial deployment; a complete two-hour battle soak was not run.
