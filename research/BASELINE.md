# DEFCON v1.43 baseline reconstruction

## Source and provenance

User supplied `/Users/ghost/Downloads/defcon-win32-v143.exe` and explicitly requested reverse engineering and sound reuse. Installer SHA-256: `33d2edb954d2a3ba9a8f42ee33090f7be783444f875ff88fc7e4d6a790903e55`.

Read-only REA `open_binary` admitted the installer as PE32/x86. `innoextract` 1.10.8 extracted its four members, without running Windows installer code. The two DAT files are solid RAR archives, extracted with `unar`. The game EXE is UPX compressed; UPX 5.3.0 decompressed a temporary copy for static PE analysis. The original download remained unchanged.

- Unpacked temporary game EXE SHA-256: `8169bbbbb364084dadea790a004a4595acc9549dfcc5fc9a12884d072e4615e2`
- Packed game EXE SHA-256: `4e5645f54729914bfb2c9640a23831a4c8f830145b2fb5752726bb79efa009f4`
- `main.dat` SHA-256: `83419ebb60be5289052179a507cd01e8e2d18b41feaf31940b3e8e0caaaba409`
- `sounds.dat` SHA-256: `50e051a445419ee23aeff614661cf8b4aed71d8e0b540cefc2888d97d6c38c61`

REA's deep provider was unavailable: Ghidra, Hopper and IDA were not configured. No REA configuration was modified. The fallback used PEfile 2024.8.26 and Capstone 5.0.9 against the temporary unpacked PE. C++ RTTI type descriptors locate class complete-object locators, vtables and constructor references. This is static disassembly, not decompilation or observed Windows runtime behavior. Instruction excerpts are retained in `native-constructors.txt`.

## Observed native constants

`0x401790` converts a signed integer to the game's double representation. `0x41c6c0` divides an integer by the double at `0x534190`, which is exactly `100.0`. Constructors store the resulting movement value at object offset `0x210` and the turn parameter at `0x218`.

| Unit | Constructor | Native speed | Turn parameter | Other observed initialization |
| --- | --- | --- | --- | --- |
| Battleship | 0x444110 | 3 / 100 = 0.03 | 1 / 100 = 0.01 | Life 3 |
| Carrier | 0x446bf0 | 3 / 100 = 0.03 | 1 / 100 = 0.01 | Life 3; stock 6; launch-state fighter/bomber stocks 5/2 |
| Submarine | 0x4593a0 | 2 / 100 = 0.02 | 1 / 100 = 0.01 | Life 1; MRBM stock 5 |
| Fighter | 0x44aa50 | 10 / 100 = 0.10 | 4 / 100 = 0.04 | Fuel/range member initialized to 45 |
| Bomber | 0x445700 | 5 / 100 = 0.05 | 1 / 100 = 0.01 | SRBM stock 1; fuel/range member initialized to 140 |
| Missile | 0x454ff0 | 20 / 100 = 0.20 | 1 / 100 = 0.01 | Long- and short-range states |
| Silo | 0x458400 | Stationary | N/A | Life 25; stock 10 |
| Airbase | 0x442c00 | Stationary | N/A | Life 15; stock 10; launch states each permit 5 starting aircraft; capacity members 10/10 |
| Radar | 0x4578a0 | Stationary | N/A | Life 1; radar initialized to 30 |

Constructor arguments establish 120-second launch/preparation values for airbases/carriers; 240 for carrier anti-submarine and submerged submarine states; 120 for surfaced submarine and silo launch; 340 for silo defense; bomber nuclear preparation 240 and naval preparation 60. Mapping the constructor arguments to the web model is a derived interpretation, corroborated where possible by the manual. The web integrator uses these native constants in a new JavaScript implementation; this does not prove numerical parity with the original integrator.

## Primary references

- Official [DEFCON manual](https://cdn.akamai.steamstatic.com/steam/apps/1520/manuals/DEFCON%20manual.pdf), printed pp. 11 and 14–19: readiness, fleet size, right-click movement/state menu, aircraft launch/fuel/landing, garrison contents, silo defense/launch exclusivity and nuclear ranges by class.
- Installer `data/gameoptions.txt`, retained here as `classic-gameoptions.txt`: speeds 1/5/10/20; victory trigger 20%; victory timer 45 game minutes. Default score uses 2 enemy civilian deaths minus 1 own civilian death, as documented in the manual.
- Installer `data/sounds.txt`, retained as `classic-sounds.txt`: original sound event mappings, samples, gains, frequency parameters and playlist order.
- [User video](https://www.youtube.com/watch?v=GYYzCz19GbI): metadata identifies “EU vs Russia - nuclear whipeout [DEFCON - No commentary gameplay]”. Inspected its YouTube storyboard frames for silhouettes, fleet grouping and visual density. Full streaming playback was unavailable in headless Edge; the video alone was not used to infer numeric movement constants.

## Reused assets

`dist/assets/classic/manifest.json` records per-file SHA-256 provenance for 17 unit textures and all 115 original OGG files, including the 28 music samples listed in the original music group. OGG bytes are unmodified. Original bitmap textures (mostly 128×128) are converted to PNG by mapping luminance to alpha, equivalent to rendering their black backgrounds transparently; outlines remain the original pixels. The retained map geometry and background colors are unchanged. Units render at reduced opacity and no longer receive invented red diamond frames.

`tools/extract-classic-assets.py` reproduces extraction from a user-provided installer. Native executables are not shipped or executed by the web game. Original audio and graphic assets remain Introversion's work; this site remains owner-private.

## Implemented classic behavior

Finite deployment counts; strict six-ship fleets as explicitly requested by the user; slowest-member fleet pace; carrier and airbase garrisons; fighter/bomber launch modes; fuel consumption and automatic return/landing; submarine passive/active/surfaced states and sonar detection; radar-dependent contact visibility; silo defense/launch exclusivity; native-derived speed, turn and preparation values; 10/5/1 silo/sub/bomber payloads; original audio and soundtrack; original click semantics and 1/5/10/20 time speeds; default population-based scoring and inventory-based victory countdown. Naval routes avoid the retained coastline geometry.

## Explicit remaining differences

This is a source-backed reconstruction of the requested unit baseline, not a complete port of the Windows executable. Combat hit probabilities, missile arcs and damage falloff, aircraft steering/landing integrator, radar ghost expiry, coarse water routing, AI and preplaced opening forces are JavaScript implementations and have not been proved equivalent to native v1.43. The readiness schedule (6,12,20,30 elapsed game minutes) is a reference calibration, not a recovered code path. Original music/sound files are reused exactly, but the full native positional mixer, DSP and survivor-linked playback modulation are not reproduced. Native multiplayer/lobby networking remains outside this implementation; a local six-faction setup is provided. Battle lab is explicitly a sandbox with observer visibility and a 60-game-minute limit.

## Full-map, territory and fleet update

The current build adds six independently controlled faction slots and a setup screen for territory, faction identity and alliances. The previous fixed Western/Eastern split is removed. Original `data/earth/{northamerica,southamerica,europe,russia,africa,southasia}.bmp` masks supply land and coastal deployment zones. Raster lookup preserves the original 512×285 sampling, with world projection 360°/512 px and top latitude 100°. Bright pixels form land masks (luminance ≥200); coastal deployment pixels use luminance ≥70. Simplified boundary loops are derived from the same masks; per-mask source SHA-256 values are retained in `dist/territory-data.js`. This threshold/projection mapping is a reconstruction verified against initial deployments and retained map geometry, not a recovered native mask-reading function.

At the user's explicit request, placement now requires exactly six naval units, overriding the original manual's one-to-six fleet rule. Stock allocation remains 12 each of battleships/carriers/submarines: two initial six-ship fleets plus four deployable complete fleets. Individual targeting/state changes preserve the fleet's movement order; AI fleet commands also apply to every living member. Each member's starting position must fit the chosen faction's maritime mask and the retained coastline water test.

There are 25 cities per territory, built from Natural Earth's public-domain 1:50m populated-place coordinates and normalized to 100M inhabitants each. Public source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_populated_places_simple.geojson. These are game population weights, not live population estimates.

The full-screen map uses on-demand popover windows, viewport-centered sweep, optional animated territory/maritime overlays and radar/people/orders/nukes layers. The toolbar/layer functions and pregame territory/identity selections were cross-checked against the official manual, printed pp. 6–7 and 14–17. Alliance ceasefire and optional sensor sharing are implemented; submerged allied submarines remain hidden without sonar. The setup fixes alliances before play; the player can leave its alliance, but the native timed multiplayer voting system is not implemented.

Horizontal geography and movement wrap at the antimeridian; vertical camera travel is bounded. Distance, radar, routes and missile arcs use wrapped longitude. The new degree/MGRS grid is a requested extension, not a native v1.43 feature. MGRS conversion uses proj4js/mgrs 2.2.0. Precision changes 3/4/5 digits per axis with zoom, while display lines mark UTM grid zones rather than one-meter cells. Polar UPS conversion is not provided.

Combat hit probabilities, blast damage curves, the steering/landing integrator, coarse naval routing, AI, readiness timing and full native audio DSP remain reconstruction differences. Original OGG bytes remain unmodified and hash-verified.

## Combat update

See [COMBAT.md](COMBAT.md) and [native-combat.txt](native-combat.txt) for recovered v1.43 matchup integers, stationary-object nuclear damage and shrinking explosion rendering. This supersedes the previous generic hit chances and 10-degree damage falloff. Conventional ground attacks are not introduced; aircraft retain native one-life fragility. Nuclear aircraft immunity is an explicit user-requested deviation. Lab no longer bypasses radar targeting and now stages real decks and fleets using the shared gameplay combat implementation. Remaining native numerical parity limits still apply.
