# Self-host DEFCON: BLACKOUT

The Node server serves the game and `/api` on the same origin. Static-only hosting cannot save sessions across browsers. Use Node 24 or newer, or the Docker image below. No external database service or runtime npm dependency is needed for the Node host.

## Docker

```sh
docker build -t defcon-blackout .
docker run -d --name defcon-blackout --restart unless-stopped \
  -p 127.0.0.1:5186:5186 \
  -v defcon-saves:/app/data \
  defcon-blackout
```

Point your HTTPS reverse proxy to `127.0.0.1:5186`, preserving Host and forwarding `X-Forwarded-Proto: https`. Keep the `defcon-saves` volume when replacing the container. Mounting this volume is what keeps sessions across image updates and container restarts.

For a shared command server, protect the reverse proxy with your existing authentication. Alternatively set `GAME_PASSWORD` in the container's environment to enable built-in HTTP Basic authentication (any username). Supply the password through your server's secret/environment configuration, not a committed file. Use HTTPS for remote access. Sessions are shared within one server; this is a single command archive, not a separate account system.

## Direct Node process

```sh
HOST=127.0.0.1 PORT=5186 DATA_DIR=/srv/defcon-data node server.mjs
```

Run from the repository root. Use your service manager to restart the process. `DATA_DIR` must be writable and persistent. If omitted it defaults to `./data`; SQLite creates `defcon.sqlite` there. WAL mode and prepared statements are enabled. Startup applies the included schema migration without resetting saved games.

## Game behavior

- The last unfinished active session resumes automatically on reload or from another browser.
- Menu → Sessions & Saves lists saved operations. Continue transfers control to this browser; the old browser pauses after its next save is rejected. Revision checks prevent stale overwrites.
- Autosave uses wall-clock time: every 8 seconds normally and every 15 seconds at 10×/20×. Input changes are debounced and limited to one save per 3 seconds normally or 5 seconds at high speed. Save Now requests an immediate checkpoint. The status distinguishes saved, saving and failed requests.
- World state includes unit/fleet orders, weapons in flight, fuel, stock, targets, state preparation, RNG, cities, casualties, scoring, DEFCON and timers. Settings, map layers, coordinate mode, speed, selection and camera are included.
- The simulation advances in the controlling browser. It does not advance offline. Without a browser, the server retains the last checkpoint. A same-browser IndexedDB recovery journal, written by the save worker before each network checkpoint, supplements the last server save after reload; other devices see the server checkpoint.
- Sound preference is retained, but browsers require a click to resume audio.
- Game records stay on the server. Browser storage contains the controller identifier, preference cache and recovery journal. JSON encoding, gzip compression and IndexedDB journaling run in a module Worker; old localStorage journals remain readable during migration.

For backups, stop the Node process/container briefly and back up the whole data directory/volume, including SQLite companion files. Restore that directory to the same `DATA_DIR`. Updating the game files does not reset the database.

## Hosted Sites version

The existing private Sites URL uses the same API and SQL schema through the `DB` D1 binding, with migrations under `drizzle/`. The Worker serves assets from `dist/client`; the self-host server serves the exact same source assets from `public/`. `npm run build` creates the hosted Worker artifact. Database credentials never enter the browser bundle.

## Snapshot storage format

Game snapshots use gzip plus a `gz1:` Base64 prefix in the existing game_sessions.snapshot column. The API decodes both legacy JSON and new compressed rows, so existing sessions retain their IDs and revision/controller protection. HTTP requests accept up to 16 MB after decompression; compressed snapshot text is capped at 1.8 MB to leave room below the hosted D1 2 MB row limit. Local SQLite uses the same codec. Updating requires no destructive schema migration. Old server versions without this codec cannot read newly compressed rows. Completed aircraft trails are omitted from checkpoints; core units, RNG, inventory, timers, orders and cities are retained.

If a running browser previously showed Save exceeds 1.5 MB, leave it open after deployment until Save Now/autosave reports SAVED, then reload. An unsaved running simulation only exists in that browser plus any successful local recovery journal; other browsers can restore only a successful server checkpoint.
