# DEFCON: BLACKOUT

A browser strategy game using original DEFCON v1.43 unit textures, music and sounds from the installer supplied by the user. The published site remains owner-private. The ocean/land palette is retained; the map now occupies the entire viewport with clickable command windows.

## Run

Node.js 20 or later. No installation is needed to serve the vendored static game:

```sh
npm start
```

Open http://localhost:5186. `PORT` optionally overrides the port. The `dist/` directory also works on a static web host. Original OGG audio is approximately 61 MB and streams on demand; enable it through Menu → Audio.

## Start an operation

Click Begin Operation, choose your territory on the preview map or selector, name/color your faction, activate opposing factions, and assign alliances. The six original game territories are North America, South America, Europe, Russia, Africa, and South Asia. Every active territory has 25 cities, normalized to the classic 100 million population.

Authorize Operation starts the clock. The command dock opens Units, Info, Alliances, Layers, Intel, and Menu windows. No sidebar remains permanently visible. Clicking a unit opens its inspector. Popups close with their × button, their dock button, or Escape. Menus do not pause combat; modal setup/settings/manual windows do.

## Fleet placement and controls

- The user's fleet rule requires exactly **six** naval units per placed group. Choose battleship/carrier/submarine composition, fill all six slots, then select Place Fleet. Incomplete or invalid placements consume no inventory.
- Each territory starts with two six-ship fleets (four of each naval type deployed) and 24 remaining ships, equivalent to four complete additional fleets. Total allocation: 12 battleships, 12 carriers, 12 submarines, or six fleets of six ships. Ground-unit inventory is separate.
- Every ship in a placement must be inside that faction's maritime deployment mask and off land. Ground installations must be inside its land mask. The game uses the original territory bitmap zones, not real-world official EEZ boundaries.
- Right click the map to move the **whole fleet**, paced by its slowest living member. Player and AI naval orders use the same fleet command path. Clicking an individual member still selects its weapon/state and target without replacing the fleet movement order.
- Left click selects or performs a primary action: aircraft launch, nuclear launch, or individual targeting. Right click a unit opens its state menu.
- Space deselects, M toggles audio, 1/2/3/4 select 1×/5×/10×/20×. WASD/arrows pan; Q/E or +/- zoom. The HUD pause button pauses time.

## Map and layers

Horizontal panning wraps around the globe. Map geometry, units, radar distances, missile paths, fleet movement and naval routing cross ±180° using the short direction. Vertical pan is clamped so the camera cannot leave the world bounds.

Layers toggles territory borders, maritime zones, allied radar coverage, orders, population and nuclear inventory. Territory overlays fade in/out. Alliance members cease fire, optionally share radar coverage, and remain separate factions with separate inventories and scores. Submerged allied submarines remain hidden without sonar.

The grid can switch between degrees and MGRS. Degree spacing adapts to zoom. MGRS uses the bundled proj4js/mgrs converter with 3+3 digits at 0%, 4+4 at 50%, and 5+5 at 100% zoom. MGRS lines mark UTM grid zones; displayed coordinate references have 100 m, 10 m or 1 m precision. They are not one-meter-size screen cells. UTM MGRS references cover 80°S–84°N; polar positions retain a clear outside-grid indication. Norway/Svalbard grid-zone exceptions are represented.

Nuclear detonations leave a shrinking soft blast after the initial flash and shake, without a hard outline or location label. Reduced Effects and the OS reduced-motion setting suppress flash and shake.

## Unit baseline

Original v1.43 movement constants and state preparations are retained. Carrier: 5 fighters, 2 bombers, 6 SRBMs. Airbase: 5 fighters, 5 bombers, 10 SRBMs. Silo: 10 ICBMs. Submarine: 5 MRBMs. Bomber: 1 SRBM. Aircraft consume fuel and return to compatible hosts. Silos cannot defend while in nuclear-launch mode; submarines must surface to launch. Deployment closes at DEFCON 3, nuclear launch unlocks at DEFCON 1.

Score credits the faction that caused enemy civilian deaths (+2 per million), minus its own civilian deaths (−1 per million). Allied deaths grant no offensive points. A 45-game-minute victory timer starts when nuclear stock reaches 20% of initial deployed inventory.

Battle Lab stages live engagements using the same combat engine as Global Conflict. Observer visibility never supplies weapon targeting radar. Naval formations have six ships; aircraft launch from finite carrier inventories and consume fuel. Presets include sub versus carrier and a nuclear airbase strike. It has two forces and a 60-game-minute limit; impossible encounters can end in a standoff.

Conventional missiles, torpedoes and depth charges travel before resolving target-specific hit chances. Capital ships take three successful one-point conventional hits; aircraft/subs retain original one-life fragility. Direct nuclear hits do 10 damage: airbases survive one hit, silos survive two. Nuclear weapons cannot target or damage aircraft, per the requested rule. The blast has a soft 5-degree visual radius that shrinks and fades over 500 game seconds (25 real seconds at 20×); damage is confined to 2 degrees. See research/COMBAT.md for native evidence and reconstruction limits.

## Verify and reproduce

```sh
npm test
npm run check
npm install
node qa/browser.mjs
```

Browser QA uses an installed Microsoft Edge through Playwright. The tests cover fleet quotas and group movement, original asset hashes, six-faction setup, territory placement, radar/alliances, antimeridian routing, MGRS conversion, native unit parameters, fuel/landing, nuclear damage and scoring. Browser checks include full-viewport layout, popup controls, setup, complete fleet placement, layer/grid controls, horizontal wrap, vertical constraints, original audio playback, explosion effects and responsive layouts.

`tools/extract-classic-assets.py` extracts unit/audio assets without executing the supplied installer. `tools/extract-territories.py` derives outlines and lookup masks from its extracted `data/earth` bitmaps. `tools/build-cities.mjs` builds 25-city lists from Natural Earth's `ne_50m_populated_places_simple.geojson`.

See [research/BASELINE.md](research/BASELINE.md) for reverse-engineering evidence and remaining native-parity limits. Native combat math, AI and audio-mixer parity are not claimed; this is a JavaScript reconstruction, not execution of the Windows engine. Multiplayer is not implemented.

Natural Earth coastline and populated-place data are public domain, sourced from `nvkelso/natural-earth-vector`. City population weights come from that dataset and are rescaled for gameplay, not live population estimates. Original DEFCON graphics/audio belong to Introversion Software and were reused from the user-provided installer. The project is not affiliated with Introversion. MGRS conversion uses proj4js/mgrs 2.2.0; license notices are bundled in `dist/vendor`.

Selecting a unit shows its operation rings: red weapon range, blue remaining aircraft fuel / launch flight range, and cyan radar or sonar. There is no viewport radar sweep. Radar buildings show their own 30-degree coverage. Silo launch mode marks global ICBM reach; submarine launch mode has a 45-degree MRBM circle; bomber nuclear mode has a 25-degree SRBM circle. These use the same range definitions as launch validation.

Fighters use lead interception, forward firing passes and break turns under the recovered .04 turn limit; bombers retain .01 turns. A bomber in nuclear mode can receive a surface target outside SRBM range: with sufficient return fuel, it flies inward, launches at 25 degrees, then returns to a compatible host. Fuel, payloads, preparation and recovery remain shared between Lab and Global Conflict.
