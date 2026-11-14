# Control, sensor and launch audit — 2026-11-14

## Evidence and limits

Checked the official DEFCON manual, printed pp. 7, 11, 17–19: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1520/manuals/DEFCON%20manual.pdf?t=1739091415

Reopened the user-supplied unpacked v1.43 PE through REA; observed SHA-256 `8169bbbbb364084dadea790a004a4595acc9549dfcc5fc9a12884d072e4615e2`, matching BASELINE.md. Deep decompilation is still unavailable: Ghidra/IDA/Kuna not configured, Hopper executable missing. No native Windows runtime was executed and no analysis configuration was changed. Existing constructor/combat disassembly remains the numeric evidence; this audit does not establish complete native algorithm parity.

Read the extracted v1.43 `main/data/language/english.txt`. Relevant shipped keys: `tooltip_selectobject`, `tooltip_setobjectstate`, `tooltip_attack`, `tooltip_moveobject`, `tooltip_movefleet`, `tooltip_spawnfighter`, `tooltip_spawnbomber`, `tooltip_spawnnuke`, `tooltip_spacetodeselect`, `tutorial_silofocus`, `tutorial_silofocus_selectpopup`, `tutorial_mission1destroyradar_popup`, `tutorial_mission1deselect_popup`. These corroborate primary-action click, state popup, movement and deselection semantics independently of the manual. They do not recover the native input handler.

## Findings and resulting behavior

| Mechanic | Original evidence | Web result |
| --- | --- | --- |
| Unit selection, state, movement | Left select; right unit state popup; right map move; Space deselect | Retained, including fleet movement and individual attack/state commands. |
| Coordinate launch | Manual and shipped `tooltip_spawnnuke` allow primary-action left click at coordinates while selected | Explicit user-requested change: selecting alone never arms an empty-map launch. Empty primary click deselects. Info's Target nuclear strike / Launch command enables one coordinate action; successful action disarms it. Space/Esc/right click, state/selection changes and session reload cancel it. |
| Enemy target icon | Shipped tutorial directs selection of a silo followed by clicking an enemy radar station | Contextual surface-icon/city launch retained. Target center is used; aircraft are rejected as requested previously. Cities use their marker hit area, not labels. |
| ICBM reach vs radar | Manual says silo LRBMs reach any part of map; radar provides local detection | Shared 360-degree/global launch validation already allowed distant strikes. The local cyan sensor circle was being mistaken for strike range. A broad strike glow/tint and explicit ENTIRE WORLD text now distinguish them. Radar never grants global contact visibility. |
| Submarine / bomber missiles | Manual establishes medium/shorter reach and close-range bomber delivery | Existing 45-degree MRBM / 25-degree SRBM calibration retained; bomber ingress/fuel/return uses shared gameplay implementation. These exact numeric radii remain reconstruction values. |
| Selected sensor animation | Static local coverage existed; selected scan drawing was absent | The current-action scope follows the selected unit through pan/zoom/wrap. A cached angular/radial glow has no needle and takes about 84 seconds per revolution. Radar coverage is a separate opt-in layer; selecting airbases or nuclear silos does not add a second local radar ring. No scan without selection; passive sonar does not emit a sweep. Reduced effects suppresses motion. Style/rate are user-requested art direction, not native renderer parity. |
| Readiness and launch systems | Nuclear at DEFCON 1; aircraft/combat at 3; state transitions take time | Dispatch still calls the shared engine validators. Target command unavailable during preparation/reload, with no stock, or at wrong DEFCON. No additional Lab combat model. |
| Flight decks | Manual: airbase 5 fighters, 5 bombers, 10 SRBMs; carrier 5/2/6 | Simulation already correct. Fixed inspector's airbase capacity denominator, which incorrectly showed 10 aircraft per type. |
| Combat and durability | Constructor/disassembly evidence in COMBAT.md; manual silo requires three direct hits | Existing differentiated conventional weapons, sensors, damage, interception, air fuel/steering and installation HP retained. |
| Placement and alliances | Manual territory placement, deployment before DEFCON 3, up to six ships, alliance/radar rules | Existing territory/maritime placement and ceasefire retained. Exactly six ships is the user's deliberate override. |

Other retained deviations/unknowns: nuclear aircraft immunity and stronger horror glare are user requests; dogfight AI/steering geometry, tactical AI, missile flight/display integration and city casualty falloff are reconstructed. The current server is a persistent single-commander session model, not native multiplayer/network simulation. See BASELINE.md and COMBAT.md for the broader evidence and limits.

## Regression evidence

`node qa/commands-browser.mjs` reproduced the reported input path before the fix: a blank click reduced silo ammo from 10 to 9 and created a missile. Afterward ammo stays 10, no missile is created, and selection clears. Explicit targeting creates one strike; Space cancels it. Browser pixel comparison proves the selected radar animates and remains still under reduced effects. `tests/commands.test.mjs` also checks global strikes without global radar detection, city/unit targeting, foreign/dead/ended selection rejection, DEFCON/preparation/ammo/range checks, and deliberate deck launch commands.

## Population and impact visibility extension

Requested after the audit: preserve the strong blast while rendering operational units and HP above it, add confirmed destroyed markers, add Population Strike to Lab, and make city light depend on population. Hidden contacts remain hidden; destroyed annotations use the observers that knew the target before damage.

Immediate city damage retains the existing calibrated curve: current population × 0.5 × proximity inside the 2-degree damage radius. Each impact also schedules a separate radiation dose of 20% of the post-impact survivors × proximity, applied evenly over 300 game seconds. This is a user-requested game rule, not recovered DEFCON radiation logic or a real-world fallout model. Doses retain their source faction, accumulate across impacts, stop while paused, expire, clamp to surviving population, update losses/scoring exactly once and persist within city state. Old saves without doses continue normally. Both Lab and campaign use the same implementation, with a deterministic equivalence test.

Factions with surviving cities remain in the operation even if they have no military units, preventing the civilian-target Lab from ending before impact/radiation can resolve. The population Lab uses population scores rather than military kills for its 60-minute result.
