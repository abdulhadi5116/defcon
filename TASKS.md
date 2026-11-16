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

## Zoom and combat durability follow-up
- [x] Population-ranked city detail by zoom and collision-free names.
- [x] World-scaled unit/fleet glyphs and selection rings.
- [x] Ships 0.10°, fighter 0.50°, bomber 0.25° per simulation second.
- [x] Tight fighter turns and shortened firing/evasive passes.
- [x] Aircraft-centered shrinking fuel circles and exact exhaustion crash.
- [x] Higher HP for every unit, reduced hit probabilities, proportional legacy-save migration.
- [x] Separate submarine 20° nuclear and 3° torpedo range, including AI planner.
- [x] 207 tests, seeded AI exercise, browser rendering/session migration checks, syntax and deployment build.

## Fleet radar range
- [x] Battleship/carrier radar 12°, shared by real detection and coverage display.
- [x] Boundary regression at 11.99° / 12.01°; submarine sonar retained.

## Readable zoom correction
- [x] Keep every city marker at every zoom; filter only labels.
- [x] Normalize original unit texture bounds and compensate zoom for readable screen size.
- [x] Population marker sizes remain consistent across zoom and unlabelled dots stay clickable.
- [x] Compact visual fleet separation, real-position stems and accurate selected-unit range origins.
- [x] Regression/browser checks for dots, labels, glyph sizing and individual fleet selection.

## Control pacing and autosave follow-up
- [x] Larger population markers and 10px minimum city hitbox.
- [x] Immediate fleet direction along validated center routes; retain island clearance.
- [x] Dashed low-opacity aircraft fuel circles.
- [x] Airfield fighter/bomber queue intervals 5s/10s, carrier 8s/15s; migrate saved cooldowns.
- [x] Wall-clock autosave throttling and coalescing at high playback speed.
- [x] Worker JSON/gzip and IndexedDB recovery; shallow snapshot capture; immediate manual save feedback.
- [x] Real-server interrupted-save recovery, captured-state isolation, browser interaction and before/after frame-gap checks.
- [x] 217 automated tests, syntax checks and production build.

## Combat and flight revision 7
- [x] Battleship 7° AA / 9° ship, submarine 5° normal / 9° active, carrier 3° AA.
- [x] Independent fighter 5° missiles / 2° guns, missile reload 10s.
- [x] Nuclear warheads 10 HP with incremental interception damage.
- [x] Eight conventional bomber bombs, one per moving pass; conventional ground-target support.
- [x] Silo HP 30 / airfield HP 20; proportional save migration.
- [x] Launch on enemy binds the target immediately; continuous interception/orbit movement.
- [x] Original-base RTB, full-base holding and no silent diversion.
- [x] Fighter/bomber return radius 25°/30°; fighter speed 0.25, bomber 0.10, fleet 0.05.
- [x] All AI deployment stock placed within first 30s, with validated spread across naval fronts.
- [x] Medium city markers, wider organic population influence and optical unit scaling.
- [x] Automated/browsed combat, reload and rendering verification; shared Lab/campaign rules.

## Per-city light clarification
- [x] Remove city-selection-driven full faction fill and boundary stroke.
- [x] Partition local city influence against nearby city catchments, including longitude wrap.
- [x] Apply organic texture and soft fade without drawing district lines.
- [x] Keep the selected city's light and casualties local; preserve explicit territory layer control.
- [x] 237 tests, browser pixel/stroke checks, actual city-click verification, syntax/build checks.

## Bomb identity and durability revision 8
- [x] Conventional bombs use a finned body with falling/tumbling animation and a larger fragment impact; missile streaks remain distinct.
- [x] Six conventional bombs per sortie, three damage per successful impact; one release per moving pass.
- [x] Battleship 15 HP, carrier 20 HP, submarine 5 HP, fighter 5 HP.
- [x] Save migration preserves damage ratio and spent payload; no resurrection or repeated replenishment.
- [x] 240 automated tests and local browser projectile/damage checks.

## Passive submarine correction
- [x] Disable all conventional attack commands and autonomous firing outside active sonar.
- [x] Show no passive weapon ring; active torpedoes remain 9°, nuclear launch 20°.
- [x] Cap enemy conventional firing range against passive submarines at 1.5°, including shared sonar contacts.
- [x] Clear stale passive attack intent on restore; keep original ammunition.
- [x] Correct inspector ranges/help and host conventional bomber label to six payloads.
- [x] Verify state switches and scopes in local browser, plus shared combat boundary tests.

## Fleet pursuit, submarine eligibility and mixed Fleet Lab
- [x] Attack orders close the whole formation into the selected ship's actual target-specific range.
- [x] Track visible moving contacts; cancel pursuit on manual movement, lost contact, death or invalid state.
- [x] Preserve existing movement for targets already in range; retain save/reload and longitude wrapping.
- [x] Complete water waypoints without cutting island clearance; retain the reachable start node when replanning.
- [x] Restrict submerged targets to fighter/carrier ASW; passive firing cap 1.5°, detection 8° versus active detection 12°.
- [x] Carrier ASW depth charges: 3° active/surfaced targets, 8-second reload; independent from deck cooldown.
- [x] Ordinary projectiles lose submerged targets; old sonar memory cannot track live positions beyond coverage.
- [x] Fleet vs fleet preset with six configurable ships per side and one/two formations per side.
- [x] AI vs AI and Manual vs AI, persistent through save/reload; finite launch decks and ASW support.
- [x] 260 tests, real UI attack-to-move/fire, AI Lab combat, manual mode persistence and mobile overflow checks.
