# DEFCON: BLACKOUT

An original browser strategy game inspired by the atmosphere of classic global nuclear-war strategy games. Not affiliated with the commercial DEFCON game. All game art, interface and procedural audio are original. Coastline data is public-domain Natural Earth (https://www.naturalearthdata.com/), sourced from nvkelso/natural-earth-vector, ne_110m_land.geojson.

## Run

Node.js 20 or later, no installation needed:

```sh
npm start
```

Open http://localhost:5186. The `dist` folder also works on any static web host. No API keys, backend or paid services. After loading, all gameplay and audio run locally. Voice announcements use optional browser speech synthesis, whose voice availability varies by device.

## Play

- Begin operation. Deploy assets during DEFCON 5–4 by selecting an asset and clicking the western command sector.
- Select an allied unit, click an empty map location to move, or a hostile contact to engage. Drag to pan, scroll to zoom. Contact list buttons select and center allied units.
- Conventional combat unlocks at DEFCON 3. Nukes unlock at DEFCON 1. Select a silo, submarine or bomber, arm a strike and click its target. Bomber/submarine launch radius: 65 map degrees; silo range is global.
- DEFCON advances every 55 simulation seconds. Manual escalation accelerates readiness. Speed controls: 1×, 3×, 10×.
- Silos automatically defend against aircraft and incoming warheads, with probabilistic interception.
- Full war ends at 10 simulation minutes, destruction of a faction's units, or catastrophic population losses. Score: 4 per enemy unit destroyed + enemy civilian losses in millions − twice allied civilian losses in millions.
- Battle lab offers naval, air, bomber and nuclear presets, configurable units and force count. Nuclear lab auto-launches both sides. Impossible matchups are labeled and draw after four simulation minutes.
- Press Space to pause/resume, M to toggle sound, 1/2/3 for speed, Escape to cancel selection, +/- to zoom and arrows to pan. Settings include reduced effects, voice, master volume and AI launch frequency.

The game starts silent to respect browser autoplay requirements. Enable AUDIO for the procedural drone, weapon sounds, sirens, launch warning and spoken radio announcements. Settings are remembered in browser storage.

## Verify

```sh
npm test
npm run check
```

Simulation tests cover escalation, deployment, targeting restrictions, combat resolution, nuclear damage, pause, ownership, nuclear labs, and full-match completion. Browser QA is in `qa/browser.mjs` and uses Playwright with an installed Microsoft Edge; adjust its executable path for another system.

## Scope

Single-player AI and local battle sandbox. Combat is a fictional abstract simulation: units move in map space without coastline pathfinding; all contacts are visible, and ship movement is unrestricted by land. No multiplayer. No commercial DEFCON assets or code.
