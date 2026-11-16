# Close engagements and selectable map intelligence

This is the current balance profile, superseding earlier numeric tables in BALANCE.md, WORLD_EXPANSION.md and COMBAT.md where they differ. These are requested game rules, not claims of native DEFCON parity or real-world weapon specifications.

| Weapon/rule | Current |
| --- | --- |
| Battleship weapon radius | 3° (previously 10°, then 4°) |
| Battleship chance per shot against fighter / bomber | 12% / 10% (previously 30% / 20%) |
| Carrier direct armament | AA gun only; aircraft targets only, no surface/ASW/warhead shots |
| Carrier gun radius / reload / speed | 1.5° / 4 game seconds / 3° per game second |
| Carrier gun per-shot fighter / bomber chance | 3% / 6% |
| Fighter attack radius | 2° (previously 5°); radar remains 5° |
| Bomber nuclear release radius | 2°; ingress releases inside 1.8° |
| Silo defensive radius | 10° (unchanged) |
| Silo SAM reload | 8 game seconds (previously 20) |
| SAM speed against aircraft and warheads | 1.2° per game second |
| Silo per-shot air / warhead chance | 10% / 40% (unchanged) |
| All nuclear warhead ground-track speeds | 0.06° per game second, including direct bomber payloads |

Carrier gun cooldown is separate from flight-deck cooldown and state preparation. Guns can defend the ship while planes are launching or the deck is changing mode, without preventing aircraft launches. The gun has travelling tracers and muzzle bursts; it does not fire SAMs, torpedoes or depth charges. ASW search mode retains sonar detection only. Fighter ASW and active submarines retain actual anti-submarine weapons; the Lab ASW preset uses submarine versus ASW fighter. AI carriers respond to detected submarines by launching fighters configured for ASW instead of attempting an illegal carrier depth-charge attack.

The bomber uses a direct missile profile with the same slow speed as an ICBM; it does not inherit the ballistic arc. The smaller ingress standoff includes room for the aircraft arrival threshold so it cannot return with an unspent payload just before reaching launch distance. A target under a defensive silo's coverage must now be approached well inside the SAM envelope before release. Fast SAMs and slower warheads provide response time; ammunition, reloads, detected contacts and pending-projectile allocation remain real engine rules in both Lab and campaign.

Balance revision 5 preserves live missile progress and inventory while recalculating their duration once at restore. Existing fired conventional projectiles retain their launch-time properties. Subsequent shots use the revised profile. Naval circle radius remains 1°, hidden coastline clearance remains 1°, fighter fuel remains carrier 30 / airfield 44, and silo global reach remains unchanged; the subsequent offensive-pressure revision reduces submarine nuclear/torpedo range to 3°.

## Settings: Radar mode / Full view

Menu → Settings → Map intelligence now offers Radar mode (default) or Full view. Full view displays enemy units, submerged submarines, aircraft and projectiles even outside player sensors, and permits inspection. Radar mode restores sensor/sonar-based display and picking. Dead/landed units remain hidden in either mode. Future enemy destinations/guidance lines remain private.

This is a display setting: it does not change AI information, radar/sonar acquisition, attack range, fuel, alliances or weapon locks. It is stored as preferences.visibilityMode in server-backed session checkpoints and default preferences, restored after reload and in another browser. Legacy saves default to Radar mode. Unsupported values are rejected by preference validation.

## Verification

- 179 tests: carrier AA-only behavior in all deck modes, deck/gun cooldown independence, short battleship/fighter boundaries, faster SAMs, bomber entering SAM coverage before its one direct payload, equal slow warhead profiles, save migration, and render-only full intelligence.
- 200 deterministic strike trials: isolated missile 40/40 stopped; 12 simultaneous warheads against one silo yield 262/480 impacts; three nearby silos yield 30/480 impacts. An undefended or outside-coverage target receives 40/40 hits. These are scenario-specific results, not universal interception rates.
- 84 real Lab matchup exercises still produce combat with finite fuel and valid unit state.
- Two one-hour strategy exercises retain staging, retaliatory restrictions and reserves; seeds 42/91 produce six launches each, with first-use timing [421,901,901] / [421,901,1081].
- Browser checks cover close ASW engagement, placement, scopes, mobile HUD, actual server-backed Radar/Full selection, reload, independent browser restoration, enemy inspection and returning to radar fog. Safari has not been tested.

AI update: research/STRATEGY.md documents the unified coordinated-strike controller, replacing all previous personality and difficulty variants.

## Short bomber fuel update

Bomber total travel fuel is now carrier 40° / airbase 60°, down from 210° / 300° (81% / 80% reductions). Host return-fuel radii are 20° / 30°. Fighter fuel remains 30° / 44°. New bomber flights use fuel revision 4. Existing flights retain distance already consumed; migrated fuel is max(0, new budget minus spent fuel), never a refill. Nuclear ingress that no longer permits recovery aborts and attempts return; already stranded aircraft may still exhaust fuel. Invalid old queued missions cancel before spending aircraft/payload stock. AI nuclear plans read the new shared host budgets, and naval bomber sorties avoid missions that cannot return within the smaller tank. Explicit manual one-way flights remain possible and are warned.
