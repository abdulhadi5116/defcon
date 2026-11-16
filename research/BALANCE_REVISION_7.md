# Combat and flight revision 7

These are the current user-requested game values, not real-world weapons specifications. Engine, campaign and Battle Lab share the same rules.

| Unit | HP | Movement degrees / game second | Conventional reach | Reload |
|---|---:|---:|---|---|
| Battleship | 6 | 0.05 | 7° air, 9° sea | 20s |
| Carrier | 6 | 0.05 | 3° AA gun only | 4s, separate from launch deck |
| Submarine | 4 | 0.05 | 5° passive confirmed contacts, 9° active sonar/torpedo | 20s |
| Fighter | 3 | 0.25 | 5° missile, 2° gun | missile 10s, gun 3s |
| Bomber | 4 | 0.10 | 5° conventional bombs | minimum 4s plus completed attack pass |
| Silo | 30 | 0 | 10° air/missile defense | 8s |
| Airfield | 20 | 0 | launches aircraft | fighter 5s / bomber 10s |
| Radar | 6 | 0 | sensor 30° | — |
| Nuclear warhead | 10 | 0.06 | ballistic/direct strike | — |

Surface fleet radar remains 12°. Active submarine sonar and torpedo reach both use 9°; passive sensing remains 2.5° and permits short-range attacks only on confirmed contacts. Surfaced submarine nuclear reach remains 20°, bomber nuclear release remains 2°, silo strike reach remains global. Carrier aircraft launch intervals remain fighter 8s / bomber 15s.

## Damage and probabilities

Every successful conventional projectile, bomb, gun bullet and depth charge deals one damage. Nuclear blasts deal ten damage inside the existing 2° footprint and exclude airborne aircraft. Three successful nuclear hits destroy a full-health silo; two destroy an airfield. A nuclear warhead now needs ten successful one-damage interceptions, rather than becoming dead on the first hit.

| Attacker | Battleship | Carrier | Submarine | Fighter | Bomber | Building | Nuclear warhead |
|---|---:|---:|---:|---:|---:|---:|---:|
| Battleship missile | 10% | 20% | 30% | 12% | 10% | — | — |
| Carrier AA gun | — | — | — | 6% | 10% | — | — |
| Submarine torpedo | 20% | 30% | 10% | — | — | — | — |
| Fighter missile | 10% | 10% | 3% | 20% | 30% | — | 25% |
| Fighter gun | 10% | 10% | 10% | 20% | 20% | — | — |
| Bomber conventional bomb | 40% | 40% | 25% | — | — | 65% | — |
| Silo air defense | — | — | — | 10% | 10% | — | 25% |

Fighter ASW depth charges use 30%. Probabilities are rolled at projectile arrival; range, visibility, preparation and firing alignment still apply. Conventional guided missiles now travel at 1°/s, silo/nuclear interceptors at 1.2°/s, guns at 3°/s, torpedoes at 0.2°/s and depth charges at 0.5°/s. This restores useful hit rates after the earlier excessive nerf while retaining multiple-hit durability.

## Bomber sorties

A conventional bomber receives eight bombs at launch, separately from nuclear ammunition. One accepted pass spends one bomb. The next bomb requires both a substantial angular manoeuvre and at least 4° of flight since the last drop; it cannot dump all eight during one turn or while stationary. It can attack confirmed silos, airfields, radar stations and naval contacts. An explicitly assigned installation takes priority: nearby ships cannot consume its payload before it reaches the assigned target. The bomber returns after exhausting its bombs or reaching its fuel reserve. Nuclear loadouts still carry one real warhead, deducted from host stock, and return after releasing it.

## Flight and return base

Fighter/bomber nominal return radii are 25°/30° from both carrier and airfield, implemented as total travel budgets of 50°/60°. Airborne fuel scopes remain centered on the aircraft and show remaining travel. Reduced speed extends patrol and manoeuvre time without refuelling aircraft. Coordinate arrivals establish a moving patrol; engagement uses continuous lead interception followed by a target-centered orbit. Missile and gun fire do not stop movement.

Launches record immutable `originalHomeId`; a target-icon launch also binds the enemy ID immediately. Return orders use only the launch host. If full, the aircraft holds near that host and consumes fuel until a slot opens or fuel runs out. If destroyed, no silent diversion or inventory transfer occurs. Existing saves recover original launch hosts from retained launch events when possible; if older history was already discarded, only the last stored home can be recovered. Fuel spent and health percentages are preserved once, and the migration does not refill flight tanks or resurrect dead units.

## Deployment and visual changes

AI remaining stock is deployed on the first review at ten simulation seconds, before the thirty-second deadline. Generated plans score coverage of population, spacing of installations and separated naval fronts, including coastal city candidates on both sides of a continent. Every placement still passes territory, sea-zone and island-clearance validation. Player stock is unchanged until manual deployment or AI handover. `node scripts/plan-deployments.mjs` regenerates `public/deployment-plans.js` after map, border, formation or deployment-rule changes. Legacy/custom configurations use the validated dynamic fallback.

City symbols use a continuous logarithmic 6–25px scale so medium settlements are distinguishable. Every city dot remains visible; names alone obey zoom and collision filtering. Population influence is broader and uses cached irregular multi-lobed textures, including selected-city light, rather than perfect circular halos. Surviving population still controls brightness and extent. Unit glyphs keep the maximum-zoom-out baseline of 18px with gentle optical compensation up to about 22.65px at maximum zoom; real unit positions are unchanged.

## Validation

232 tests cover exact reach boundaries, independent fighter weapons, ten-hit warhead interception, eight distinct bomber passes, ground strikes, launch-to-engage targeting, continuous flight, strict RTB/full-host handling, save migration and legal complete AI deployment across every territory. Browser interaction verifies real target clicks, ammunition display, final payload RTB and landing inventory. Canvas checks verify irregular city edges and the optical scale. The early 30-second simulation completed with all AI stock deployed, 496 total units including player seed units, and a maximum measured tick around 33ms on the local fixture. This is a fixture measurement, not a universal frame-rate guarantee. Safari has not been tested.
