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
| Submarine / bomber missiles | Manual establishes medium/shorter reach and close-range bomber delivery | Current 45-degree MRBM / 10-degree SRBM calibration; bomber ingress/fuel/return uses shared gameplay implementation. These exact numeric radii remain reconstruction values. |
| Selected sensor animation | Static local coverage existed; selected scan drawing was absent | The current-action scope follows the selected unit through pan/zoom/wrap. A cached angular/radial glow has no needle and takes about 84 seconds per revolution. A selected friendly sensor illuminates its local radius automatically; the global coverage layer remains opt-in. Selecting airbases or nuclear silos adds no rigid local radar ring. No scan without selection; passive sonar does not emit a sweep. Reduced effects suppresses motion. Style/rate are user-requested art direction, not native renderer parity. |
| Readiness and launch systems | Nuclear at DEFCON 1; aircraft/combat at 3; state transitions take time | Dispatch still calls the shared engine validators. Launch orders can queue during preparation/reload but execute only when ready. Wrong DEFCON or exhausted/unassigned stock prevents accepting another launch. No additional Lab combat model. |
| Flight decks | Manual: airbase 5 fighters, 5 bombers, 10 SRBMs; carrier 5/2/6 | Simulation already correct. Fixed inspector's airbase capacity denominator, which incorrectly showed 10 aircraft per type. |
| Combat and durability | Constructor/disassembly evidence in COMBAT.md; manual silo requires three direct hits | Existing differentiated conventional weapons, sensors, damage, interception, air fuel/steering and installation HP retained. |
| Placement and alliances | Manual territory placement, deployment before DEFCON 3, up to six ships, alliance/radar rules | Existing territory/maritime placement and ceasefire retained. Exactly six ships is the user's deliberate override. |

Other retained deviations/unknowns: nuclear aircraft immunity and stronger horror glare are user requests; dogfight AI/steering geometry, tactical AI, missile flight/display integration and city casualty falloff are reconstructed. The current server is a persistent single-commander session model, not native multiplayer/network simulation. See BASELINE.md and COMBAT.md for the broader evidence and limits.

## Regression evidence

`node qa/commands-browser.mjs` reproduced the reported input path before the fix: a blank click reduced silo ammo from 10 to 9 and created a missile. Afterward ammo stays 10, no missile is created, and selection clears. Explicit targeting creates one strike; Space cancels it. Browser pixel comparison proves the selected radar animates and remains still under reduced effects. `tests/commands.test.mjs` also checks global strikes without global radar detection, city/unit targeting, foreign/dead/ended selection rejection, DEFCON/preparation/ammo/range checks, and deliberate deck launch commands.

## Population and impact visibility extension

Requested after the audit: preserve the strong blast while rendering unit icons and HP above it, add confirmed destroyed markers, add Population Strike to Lab, and make city light depend on population. Hidden contacts remain hidden; destroyed annotations use the observers that knew the target before damage.

Immediate city damage retains the existing calibrated curve: current population × 0.5 × proximity inside the 2-degree damage radius. Each impact also schedules a separate radiation dose of 20% of the post-impact survivors × proximity, applied evenly over 300 game seconds. This is a user-requested game rule, not recovered DEFCON radiation logic or a real-world fallout model. Doses retain their source faction, accumulate across impacts, stop while paused, expire, clamp to surviving population, update losses/scoring exactly once and persist within city state. Old saves without doses continue normally. Both Lab and campaign use the same implementation, with a deterministic equivalence test.

Factions with surviving cities remain in the operation even if they have no military units, preventing the civilian-target Lab from ending before impact/radiation can resolve. The population Lab uses population scores rather than military kills for its 60-minute result.

## One-command / one-launch regression

Reported behavior reproduced with real Lab AI enabled: one manual target click reduced player silo ammo from 10 to 8 after 180 game seconds. The second warhead came from Lab's strategic AI, which controlled both sides even after a player command.

Player-selected or manually commanded Lab units now retain manual control in their saved unit record. Uncontrolled Lab units retain automated scenario behavior. A shared FIFO launch queue accepts one nuclear/aircraft launch per click, reserves finite available stock, waits for readiness and reload, executes each entry once and stops when empty. Coordinates are captured per command; already launched missile endpoints are never rewritten. Pending targets that die or become allied are cancelled, with no automatic substitute. Bomber ingress remains one active strike and reserves its one payload. Inspector queue, numbered map previews, clear-pending action and save/reload behavior are covered by tests.

Blast readability revision: removed the opaque circular survivor backing and Operational banner after visual review. Only the icon strokes receive a subtle shadow. The white glare overlay radius is reduced from 40% to 18% of the blast, with continuously graded white/cream/amber haze and no detached ring.

## Aircraft refinement requested after the queue fix

Payload configuration moves to the carrier/airbase; aircraft inherit a fixed naval or nuclear payload and pending deck launches retain the choice from their command. A nuclear bomber consumes one SRBM at loading and returns any unused payload to stock only on an actual landing. Old airborne bomber saves receive compatible fixed-payload/one-pass metadata on restore.

The user requested closer release and a direct payload path: bomber conventional/SRBM launch range is calibrated to 10 degrees, with nuclear ingress approaching within 90% before firing. The SRBM follows a direct shared position function at .4 degrees/s; silo/submarine missiles retain their ballistic profile. Bomber RTB turns use 2.5 times its normal turn parameter to commit promptly to recovery; its normal .01 turn and .05 speed are preserved. These are requested gameplay calibrations, not newly recovered native constants.

The blue aircraft return envelope is centered on its current host. Its radius is the outer bound `(remaining fuel + distance to home - turn reserve) / 2`; outside it no round trip is possible. Individual destination validation still checks actual ingress and return travel. This circular outer bound is conservative only as an exclusion test: being inside the circle is not a guarantee in every heading. Aircraft use actual travelled distance for fuel, and out-of-fuel aircraft crash without restoring host inventory. Host reachability and remaining fuel are shown separately. Enemy aircraft do not expose their host/fuel envelope.

Fighter lead/lag/crossing tactics and projectile-triggered evasive breaks are seeded reconstruction logic, not native recovered steering. Gun bursts are a presentation of the existing conventional firing event, with no extra damage roll. The hit matrix, one-life aircraft durability and successful-impact damage rules remain intact.

Allied-only future guidance, age-bounded traces, soft coverage illumination, native SAM state symbol and launch-origin warning animations are renderer changes. Detection/weapon validation remain in the shared engine. Manual-ownership and FIFO launch guarantees remain in force. The Air Defense Approach Lab is a real approach into the same silo radar/range and SAM code used by normal gameplay.

## Host fuel rebalance and strict visibility

Requested fuel increase: carrier fighters/bombers now receive 90°/210° travel budgets; airbase flights receive 140°/300°. Launch validation, aircraft fuel/maxFuel, host range display, consumption and return envelopes use the shared host-aware definition. These requested values supersede launch use of the native-derived baseline 45/140 constants. Existing living, airborne saved flights without fuel revision 2 are upgraded once by `new budget - already consumed distance`; orders, HP, payload and queue state remain intact. New flights carry revision 2, preventing repeated top-ups on reload.

The reported contact leak reproduced in three paths: Lab rendered every contact unconditionally; launches temporarily exposed the launching unit globally; launch-created ghosts could remain without any radar observation. Lab's observer bypass is removed. Radar visibility now uses a shared sensor-radius helper (radar 30°, silo/airbase 20°, carrier 15°, battleship 10°, aircraft 5°). Radar remains offline at DEFCON 5. Allied sensors contribute only when radar sharing is enabled.

Sonar acquisition has its own per-observer expiry record, separated from legacy launch reveal flags. Submerged contacts still require sonar. Selected sensors use the same radius for their soft raised glow; selecting a unit does not expand detection or change the saved global layer setting. Unknown enemies cannot be picked or inspected, and hidden missiles, gun flashes and impact markers no longer inherit Lab observer visibility.

Nuclear launches still produce their requested origin warning, but an out-of-radar launch is labelled unidentified and does not grant a live unit contact or ghost. Ghosts are created only from observed units. Unverified legacy enemy ghosts are removed on restore; verified historical contacts remain faint memories after contact loss.

Regression evidence: `tests/fuel-fog.test.mjs` tests host budgets, all sensor boundaries, Lab fog, launch-source privacy, allied sharing, DEFCON gates, legacy fuel upgrade idempotency and ghost migration. `qa/fuel-fog-browser.mjs` verifies actual rendering/picking before detection, after sensor entry and after exit, plus selected glow radii for all radar-capable unit types.


## Aftermath timing and territorial screen effects

Confirmed destroyed units lose their cached contact and trail immediately. Unconfirmed last-known contacts fade over 12 simulation seconds; nuclear destruction markers fade over 6 simulation seconds. Both follow 1×/5×/10×/20× playback, including cosmetic cleanup after the result is final. Old saves discard expired or undated contacts. The nuclear blast itself keeps its existing long decay.

Full-screen nuclear flash and map shake require the blast footprint to touch the controller faction's land territory (or an owned coastal city). Foreign territory, other allied territories and open ocean retain only the local blast. Reduced effects still suppress flash/shake. Territory attribution uses the current controller, regardless of who launched the missile.
