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
