# Aircraft and battlefield presentation

- [x] Host-controlled bomber payload; launch inherits payload and queued orders retain it.
- [x] Aircraft attack + fuel rings, close bomber ingress, direct payload path, immediate RTB.
- [x] Classic small missile streaks and fighter gun bursts.
- [x] Friendly/allied guidance only; bounded, time-fading trails.
- [x] Animated nuclear launch detected marker, honoring reduced effects.
- [x] Varied intercept, break and evasion maneuvers within existing turn/fuel limits.
- [x] Reachable defensive silo versus aircraft Battle Lab preset.
- [x] Defense-mode silo missile icon in map and inspector.
- [x] Soft illuminated radar coverage instead of hard boundary rings.
- [x] Regression tests, browser/visual verification, build and publish.

Verification: 101 engine/state tests; browser checks for aircraft operations, hostile guidance privacy, payload locking, air-defense SAM engagement, launch markers, FIFO commands, population, blast, selection and fuel scopes. Published through the existing owner-private Site.

## Fuel and visibility follow-up

- [x] Larger host-specific fuel budgets, with airbases exceeding carriers.
- [x] Preserve consumed fuel and orders when upgrading existing saved flights once.
- [x] Selected unit radar glow uses its actual sensor radius.
- [x] Strict radar/sonar visibility in both Lab and campaign; no unknown contacts, projectiles, launch ghosts or inspector leaks.
- [x] Fuel/fog regression and browser verification, build and publication.


## Aftermath cleanup and controller impact feedback

- [x] Expire stale contacts in 12 simulation seconds; clear confirmed destroyed bodies and trails immediately.
- [x] Fade nuclear destruction markers within 6 simulation seconds, independent of blast lifetime.
- [x] Follow playback speed; keep cosmetic cleanup running after game end.
- [x] Gate full-screen shake/flash to controller territory impacts; preserve local blasts everywhere.
- [x] Verify engine regressions and browser checks for own/foreign/ocean/reduced-effects cases and speed-scaled cleanup.

## Radar coverage clarity

- [x] Replace radial coverage gradients with flat illuminated sensor fields and raised rims.
- [x] Prevent overlapping fleet sensors from accumulating bright haze.
- [x] Increase unit ink contrast above coverage while retaining the existing map colors.
- [x] Browser pixel checks for uniform fill, overlap stability, selected coverage and visible unit ink; screenshot review.

## Persistent selection, direct commands and conventional pacing

- [x] Keep selection on map/action clicks; Esc clears and Space only cancels targeting.
- [x] Direct aircraft launch clicks from hosts, preserving one-click/one-launch FIFO rules.
- [x] Immediate placement when a fleet draft reaches six units.
- [x] Fighter anti-warhead interception, detected missile clicking, finite pursuit coordinates.
- [x] Remove AI omniscient installation targets; remember observed ground sites and reveal launched silos.
- [x] Give conventional phases longer windows; persist per-phase countdowns and migrate old saves once.
- [x] Update controls/manual and exercise recon scene; engine and real-browser regression checks.

## Automatic defense after nuclear payload exhaustion

- [x] Return an exhausted silo to defense after its final queued/direct launch.
- [x] Preserve remaining FIFO launches and in-flight warheads; keep unspent silos available for chaining.
- [x] Apply the normal defense preparation time and preserve it through reloads.
- [x] Repair exhausted silos in old saves; verify engine and browser behavior including SAM icon.

## Unified radar area and save reliability

- [x] Remove individual sensor outlines; overlaps and nested sensors form one continuous illuminated area.
- [x] Pixel checks prove internal boundaries match the surrounding covered area; retain readable unit glyphs.
- [x] Fix non-finite fighter evasion when a newly created hostile projectile has no heading yet.
- [x] Invalid local pending recovery resumes the same session's valid server checkpoint.
- [x] Regression tests and browser verification for merged coverage and recovery.

## Adaptive strategic AI and territory handover

- [x] Utility-scored faction plans with five seeded, nationality-independent doctrines.
- [x] First-use restraint, attack grievances, allied retaliation, staging, reserves and bounded waves.
- [x] Intel-gated target selection, friendly blast veto and in-flight target deconfliction.
- [x] Defensive/recon/offensive fleet objectives, sortie caps, fighter reserves and staged bomber payloads.
- [x] Menu handover, immediate header/menu takeover, persistent control flag and preserved commands.
- [x] Manual unit/fleet overrides; old save migration and strategy-state validation.
- [x] 139 tests; two self-play scenarios; handover/reload/takeover and FIFO browser regression checks.

## Circular fleets, extended world and defense/fuel/mobile revision

- [x] Six-ship circular formation; physical legacy reformation and stable shared fleet waypoints.
- [x] Hidden coastline margin in routing, movement and each fleet placement member.
- [x] Repeat ground placement and repeat complete fleet drafts until stock is insufficient; Esc cancels.
- [x] Compact one-row mobile brand/clock/pause/speed controls.
- [x] Slower warheads, wider silo defense, reliable fighter/SAM interception and measurable mass saturation.
- [x] Remove unit health bars and integrity presentation; preserve physical damage rules.
- [x] Reduced fighter fuel; truthful return envelope; warned manual one-way flights can exhaust fuel and crash.
- [x] Larger population markers/lights and selected-city life/territory tint that fades with casualties.
- [x] Smaller bomber and submarine nuclear ranges.
- [x] Shorter mode preparations, protected manual state, explicit DEFCON/payload locks and old-timer migration.
- [x] Passive/active/ASW submarine detection; surfaced submarines use ordinary radar; fighter ASW mode.
- [x] Ten-faction setup with India/South Asia, Iran, China, SEA, Australia + New Zealand and 250 cities.
- [x] Preserve existing six-faction sessions without resetting ownership, units or inventory.
- [x] Engine/geometry/migration regressions; desktop/mobile browser checks; build and publication.

Validation: 160 tests passed, syntax/build and diff checks passed; two one-hour self-play scenarios and desktop/mobile browser checks (320, 375, 430 px) passed. Safari has not been tested.

## Local-defense balance correction

- [x] Audit combat, sensor, fuel, nuclear, naval, population, escalation and AI rules; record primary references and calibration limits in research/BALANCE.md.
- [x] Replace excessive silo defense with 12° weapons / 20° radar / 20s reload; normalize probabilities and fighter scope.
- [x] Shared AI/overlay/weapon configuration; finite interceptor flight budget; preserve active saves.
- [x] 200 seeded strike trials, 84 real Lab matchups, strategy self-play, boundary/migration regressions and desktop/mobile checks.

Correction verification: 166 tests, syntax/build/diff checks, 200 strike trials, 84 matchup exercises, two strategy self-play runs, desktop and mobile browser checks passed.

## Final requested 10-degree defense

- [x] Set defense to 10°, ballistic warheads to 0.10°/s and direct bomber nuclear payloads to 0.18°/s; keep interceptor/radar rules intact.
- [x] Revision-4 restore preserves active missiles/progress and inventory; verify 200 strike trials and two strategy scenarios.

## Large-save failure

- [x] Reproduce the exact 1.5 MB API rejection with a valid large snapshot.
- [x] Compress persisted snapshots below D1 row limits; retain legacy reads and optimistic controller checks.
- [x] Bounded 16 MB decoded requests and 1.8 MB compressed rows; omit completed visual trails.
- [x] Suppress repeated identical save-error toasts while retaining error status and retries.
- [x] Verify large create/update/reopen, plain JSON upgrade, cross-browser restoration and size protections.

Verification: 172 tests and syntax/build/diff checks passed. Real-browser 2.89 MB save create/update/reload and independent-browser restore passed; session/settings/controller regressions and repeated-error-toast recovery passed.

## Compact fleet formation

- [x] Reduce circular radius 2.2° → 1° (55% narrower); derive naval group clearance from radius plus unchanged coastline margin.
- [x] Existing revision-2 fleets physically reform without teleport, stock reset or lost destination; new placements use compact geometry.
- [x] Circle/movement/coast/legacy migration tests and browser placement checks.

## Close-range fleet/air balance and map intelligence

- [x] Battleship 4°, fighter 2°, carrier 1.5° AA gun only with separate deck/gun cooldowns; no carrier surface/ASW weapon.
- [x] Bomber release 2° inside defense coverage; both nuclear profiles 0.06°/s; SAM radius 10°, speed 1.2°/s, reload 8s.
- [x] Render-only Radar mode / Full view in Settings, persisted in session/default preferences across browsers.
- [x] Revision-5 migration, 179 tests, 200 strike trials, 84 Lab exercises, strategy simulations and browser/mobile checks passed.

## Unified strategic AI and 3-degree battleships

- [x] Battleship weapon radius 3°.
- [x] Disable personality/difficulty variants; migrate old minds to one strategic controller without resetting manual queues or stock.
- [x] Real deployment, coastal force positioning, value/intelligence-based targets, synchronized multi-platform FIFO salvo schedules, reserves and damage reassessment.
- [x] Scheduled packages persist across reload and respect real fuel, ammunition, preparation, cooldown, alliances and sensor information.
- [x] 185 tests, prepared-defense penetration scenarios, narrow maritime deployment, single-controller Settings and handover/reload browser checks.

## Continuous offense, counterstrikes and 3-degree submarine weapons

- [x] Both torpedo and submarine nuclear ranges are 3°; sensor/sonar coverage remains distinct.
- [x] Overlap independent coordinated packages; keep pressure between impacts; prioritize detected aggressors even after interception.
- [x] Faster staging/reassessment, 6%/2% reserves with pending-ammo accounting, local air response and active submarine torpedo combat.
- [x] Near-shore launch stations and physical fleet rotation keep short-range submarines useful without breaking formation/coast margins.
- [x] 192 engine/save tests, active-wave counterstrike and coastal movement regressions; stronger prepared-SAM simulation outcomes; browser reload, mode and concurrent-package checks.

## Substantially reduced bomber fuel

- [x] Carrier bomber fuel 210 → 40 and airbase 300 → 60; return rings 20° / 30°; fighter budgets unchanged.
- [x] Revision-4 bomber migration retains spent fuel, aborts unrecoverable nuclear ingress and cancels invalid old queued missions without spending inventory.
- [x] AI planning respects shorter reach; warned manual one-way flights can still exhaust fuel.
- [x] Fuel/range/recovery/migration regressions and real-browser host ring, launch and reload checks.
