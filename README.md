# DEFCON: BLACKOUT

Browser reconstruction of DEFCON's unit baseline inside the retained BLACKOUT map and interface. Includes original v1.43 unit textures, music and sound effects extracted from the installer supplied by the user. The published site remains owner-private.

## Run

Node.js 20 or later; runtime requires no npm installation:

```sh
npm start
```

Open http://localhost:5186. `PORT` optionally overrides the port. `dist/` works on a static web host; no API keys or backend services. Original OGG audio is approximately 61 MB and streams on demand. Enable AUDIO with a click to satisfy browser autoplay requirements.

## Classic controls

- Left click a unit to select; left click a destination/target for its current primary action (aircraft launch, nuclear launch or attack).
- Right click open water to move the selected fleet. Right click a unit for its state menu, or use inspector state buttons.
- Space deselects. M toggles sound. Keys 1/2/3/4 select 1×/5×/10×/20×. WASD/arrows pan. Q/E or +/- zoom. The pause button pauses time.
- During DEFCON 5–4, deploy remaining finite ground units or compose a fleet of up to six ships in the left panel. Ground installations require land; fleet formations require open water. Aircraft launch from airbases or carriers.
- Carrier: 5 fighters, 2 bombers, 6 SRBMs. Airbase: 5 fighters, 5 bombers, 10 SRBMs. Silo: 10 ICBMs. Submarine: 5 MRBMs. Bomber: 1 SRBM.
- State changes take preparation time. Silos cannot provide air defense in launch state. Submarines must surface to launch. Submerged contacts require sonar. Aircraft use fuel and return to a compatible host to land.
- The inspector shows fleet members, garrison, warheads, fuel, speed, preparation and reload. Unselected contacts blend into the map; selected contacts are emphasized.
- At DEFCON 1, choose a nuclear launch state, wait for preparation, then left click a target. Submarine range is 45 map degrees; bomber range is 25; silo range is global.
- Score: 2 points per million enemy dead, minus 1 per million allied dead. A 45-game-minute victory countdown starts when available nuclear stock falls to 20% of initial inventory.
- Battle Lab uses the same unit constants with observer visibility; impossible matchups can end in a standoff. Nuclear-silo lab auto-launches both sides. Use 20× for observation.

## Verification and provenance

```sh
npm test
npm run check
```

Fourteen tests cover native constants, fleet pace, inventory, gates, launch preparation, garrison, fuel/landing, sonar, nuclear damage, scoring, water routes and asset provenance. `qa/browser.mjs` tests interactive flows and actual original-music playback in installed Microsoft Edge; install dev dependencies with `npm install` for browser QA.

See [research/BASELINE.md](research/BASELINE.md) for binary hashes, instruction addresses, original file references, and explicit parity limits. The JavaScript engine is a reconstruction, not execution of the native Windows simulation. Full native combat math, AI, six-territory multiplayer and audio mixer parity are not claimed.

Natural Earth coastline data is public domain, sourced from nvkelso/natural-earth-vector `ne_110m_land.geojson`. Original DEFCON graphics/audio belong to Introversion Software and were reused at the user's request from their supplied installer. This project is not affiliated with Introversion.
