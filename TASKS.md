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
