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

## Zoom, movement and durability rebalance

This user-requested update supersedes earlier movement and HP values. All ships move at 0.10° per simulation second; fighter 0.50° and bomber 0.25°. Ship turn limit is 0.04 rad/s, fighter 0.8 and bomber 0.08. Fighter break passes last 2.5–4.5 seconds over a 1.4° destination, rather than 22–34 seconds over 4°. AI arrival scheduling now consumes the actual bomber speed. Aircraft fuel remains travelled distance, not elapsed time: airborne blue fuel circles are centered on the aircraft and have radius equal to remaining fuel. They contract to zero, at which point aircraft crash; movement cannot overspend the final fraction of fuel. Host rings continue to show half-budget nominal return reach. Existing bomber/fighter tank budgets remain unchanged.

Current HP: battleship/carrier 6, submarine 4, fighter 3, bomber 4, silo 40, airbase 30, radar 6. All conventional unit-to-unit shot probabilities are halved; ASW depth-charge hit probability is 0.15, silo warhead interception 0.25, fighter warhead interception 0.15. Conventional damage remains one per successful projectile; nuclear damage remains 10. Silos now require four direct nuclear hits and airbases three. Saves migrate to balance revision 6 once, preserving remaining HP percentage, dead status, inventory and fuel. Existing in-flight conventional shot probabilities adopt the same table.

Submarine torpedo range remains 3°; surfaced nuclear launch range is independently 20°. AI uses that 20° reach when selecting safe firing stations, while retaining land/island margin and self-blast clearance.

Rendering: city visibility threshold is 8M at minimum zoom, dropping monotonically to zero at zoom 5. Selected cities remain visible. Population-sorted labels use measured text rectangles and four candidate positions; labels without a collision-free position are omitted. Population layer respects this zoom filtering. Hidden small city markers cannot be picked accidentally. Unit icon extent is 0.85 map degrees at every zoom, preserving its ratio to the circular fleet's 1° member spacing rather than letting minimum screen sizes merge the fleet.

Validation: 207 tests pass, including exact movement, tight fighter turns, real fighter-to-ship projectiles, fuel exhaustion, proportional save migration and zoom scaling. Browser QA covers increasing city labels (4/8/10 in the same synthetic cluster), no intersecting labels, fixed icon/spacing ratio, centered fuel rendering, actual session reload migration and screenshots. Build and syntax checks pass. Safari has not been checked.

### Fleet radar follow-up

Battleship and carrier radar now share a 12° radius (`NAVAL_COMBAT.radarRange`). The actual sensor lookup and coverage drawing both read the same type value, including existing saved ships. Submerged submarines retain sonar-based detection with no new radar capability. A regression checks visible contacts just inside 12° and hidden contacts just outside, as well as displayed coverage radius.

### Readable zoom correction

The previous linear world-sized icon change made installations unreadably small, and the city-detail filter incorrectly removed markers as well as labels. Unit glyphs now have 18 CSS-pixel visible extent at every zoom, normalized by original texture alpha bounds. Every city dot remains rendered and clickable; zoom filtering applies only to text. Population-based city marker size remains consistent across zoom (minimum 2.5, maximum 12 pixels). Population glow size also stays consistent on screen.

Fleet glyphs use compact visual decluttering only when their true projected spacing is too small. Faint stems mark each real position; selected glyphs stay at their actual coordinates to center operational ranges accurately. This does not move the fleet physically or grant sensor information: only currently visible members participate. Shared display positions drive picking and target markers. Full test suite: 210 passing checks; browser checks verify all city dots at all tested zooms, progressively revealed nonoverlapping text, stable unit size, individually pickable fleet contacts, fuel centering and real session reloads. Safari remains untested.

### Fleet, launch and save responsiveness

Four reproductions failed before this update: a fleet with an old south-facing heading drifted south on a new eastbound route, two of three queued airfield fighters remained after 11 simulation seconds, small markers were below 5 pixels, and 20× playback captured 30 autosaves per wall-clock minute. Fleet movement now follows each validated center-route waypoint immediately; standalone ship turning is unchanged. Airfield fighter/bomber spacing is 5/10 seconds and carrier spacing 8/15. Old saved host cooldowns clamp to the current launch interval without dropping queued orders or replenishing inventory. AI package not-before schedules remain authoritative.

City markers now range from 5 to 18 CSS pixels with at least a 10-pixel pick radius. All dots still render at all zooms and only labels are filtered. Fuel circles use 4/6 dashes at 25% opacity.

Autosave intervals are 8 real seconds normally, 15 at 10×/20×; input-triggered saves debounce 1.5 seconds with 3/5-second minimum spacing. Manual/visibility saves remain immediate. Pending autosaves are coalesced instead of recursively queueing captures. Live capture uses a shallow immutable descriptor; postMessage makes the point-in-time structured copy. JSON, gzip and IndexedDB recovery writes run inside a module Worker, eliminating repeated synchronous localStorage writes. Successful saves remove the pending journal; failed requests retain it. Legacy localStorage recovery remains readable. Workerless environments use the same encoder on the main thread, so the full performance benefit requires Worker support.

Browser verification uses the real local API/SQLite store: 8-pixel-offset clicks select small cities, fuel strokes report rgba alpha 0.25 plus dashes, queued aircraft drain, fleets translate immediately without south drift, and Save Now persists the queue. An injected 503 leaves a worker recovery snapshot; another client restores and commits it, preserving the captured unit state even when the live object changes immediately afterward.

Performance fixture: 800 units / 51,200 trail points, four saves. Before: total capture 77.6 ms, maximum sampled frame gap 33.4 ms. After: capture 0.2–0.3 ms, sampled frame gap 16.7–16.8 ms. Async encode/save completion takes longer in this synthetic stubbed-network fixture because it now includes worker gzip and IndexedDB; this is a UI-stall measurement, not a network-latency or whole-game FPS guarantee. Final suite: 217 passing tests; syntax/build/browser checks pass. Safari not tested.
