# Balance review: local defense, strategic reach

Current close-engagement balance and Radar/Full view settings are documented in [LOCAL_ENGAGEMENTS.md](LOCAL_ENGAGEMENTS.md), superseding older values below.

This revision supersedes the defense/fighter/warhead numbers in WORLD_EXPANSION.md. `public/balance.js` is the shared current configuration used by combat, operation overlays and strategic target assessment. Lab and campaign use the same engine.

## Evidence and scale

- [NATO Patriot factsheet](https://www.nato.int/nato_static_fl2014/assets/pdf/pdf_2017_01/20170113_1701-factsheet-patriot_en.pdf) distinguishes defended area against ballistic missiles (15–20 km) from radar and aircraft engagement. These are configuration-specific published figures, not universal Patriot performance.
- [Rafael Iron Dome](https://www.rafael.co.il/system/iron-dome/) describes short-to-medium range, local multi-mission defense. Its reported operational success rate is not an individual shot probability against an ICBM.
- The retained official DEFCON manual and v1.43 static evidence are catalogued in BASELINE.md and COMBAT.md. They establish silo offense/defense exclusivity, separate detection/attack/fuel scopes, finite nuclear inventories, role-specific targeting, 25-life silos taking three 10-damage nuclear strikes, and slower naval movement. Native conventional probabilities remain recorded separately from calibrated web interception extensions.

The former silo change from 10 to 22 map degrees multiplied area by 4.84, while increasing per-shot success and reload throughput simultaneously. That was an excessive combined buff. At Earth scale 22 degrees of latitude is roughly 2,446 km; it cannot represent a Patriot battery. Even 12 degrees is not a literal Patriot range. This revision takes the user's alternative of DEFCON-style strategic balance: each silo is an abstract strategic installation, with the previous 10-degree web baseline, after the user rejected the intermediate 12-degree adjustment. That baseline is not a newly recovered native constant. The retained flat wrapped map distance is a game metric, not a geodesic kilometer simulation. Mixing real tactical kilometers into only one unit would leave it effectively invisible at world zoom while every other class retained strategic ranges.

## Recalibrated rules

| Rule | Previous excessive revision | Current |
| --- | ---: | ---: |
| Silo defensive weapon radius | 22° | 10° |
| Silo detection radius | 30° | 20° |
| Dedicated radar detection | 30° | 30° |
| Silo reload | 12 s | 20 s |
| Silo per-shot warhead chance | 70% | 40% |
| Silo fighter / bomber chance | 25% / 35% | 10% / 10% (retained native table) |
| Fighter combat / radar | 7° / 7° | 5° / 5° |
| Fighter per-shot warhead chance | 50% | 25% |
| Interceptor against warhead | 1.2°/s | 0.6°/s |
| Ballistic ground-track speed | 0.12°/s | 0.10°/s (native constructor 0.20 reference) |
| Bomber direct missile speed | 0.25°/s | 0.18°/s |

Silo defensive area is now 20.66% of the excessive 22-degree version. Radar can detect outside weapon range without enabling an out-of-range shot. Descending hostile missiles can be intercepted; fighters supplement local defense but do not provide guaranteed protection. At most two pending shots per team are allocated to one missile. Reload throughput and travelling projectiles permit saturation. Projectiles now have a finite flight budget of 1.25 times launch engagement range; a launched missile cannot chase a target indefinitely beyond the installation's area. AI assesses defensive coverage with the same current 10-degree radius and ignores defenses still preparing, replacing its stale hardcoded 10-degree estimate.

## Other rules audited and retained

- **Naval roles:** battleship/carrier life 3, sub life 1; conventional chances retain the native matrix. Submarine→carrier 20%, battleship→carrier 20%, ASW carrier→submarine 30%. These probabilities are per travelling attack; they do not imply equal duel win rates. Carriers trade direct surface fire for finite air wings and ASW. Fleet motion remains at the slowest member's speed, 0.02°/s with a sub, otherwise 0.03°/s.
- **Air roles:** fighter speed 0.10, bomber 0.05, turn limits 0.04/0.01, single-life aircraft and probabilistic missile/gun engagement. Fighter→bomber 30%, fighter→fighter 10%. ASW mode sacrifices fighter air interception for submarine search/depth charges. Bombers use close ingress, one nuclear payload, direct SRBM and immediate recovery. Conventional aircraft cannot damage stationary installations; this follows the retained native table rather than adding a new weapon class.
- **Fuel:** fighter carrier/airbase budgets 30/44 travelled degrees; bomber 210/300. Host return circles are half total fuel, airborne ellipses account for both outbound and recovery legs. Manual one-way flights can exhaust fuel and crash; AI retains a return margin. Bomber long endurance is intentional strategic reach; it is not weapon reach or a literal modern-aircraft specification.
- **Nuclear reach and durability:** silo global, submarine 18°, bomber 5° (release inside 4.5°); payloads 10/5/1 and 120-second launcher reload. Silo 25 HP / airbase 15 HP with 10 damage per direct nuclear hit; blast damage radius 2°, visual radius 5°. These remain different ranges. Silo launch mode disables air defense; final payload automatically returns to defense after 25 s. Manual FIFO is one warhead per command.
- **Sensors/stealth:** radar 30, silo/airfield 20, carrier 15, battleship 10, fighter/bomber 5 degrees. Sub passive close contact 2.5, active sonar 5, carrier/fighter ASW detection 8. ASW weapon range remains 5. Submarines in launch mode are radar contacts, submerged units require sonar. Allied sharing and fog apply equally to targeting and rendering.
- **Pace/preparation:** stages last 360/600/1800/3600 game seconds before DEFCON 1; conventional war has 90 minutes from DEFCON 3 to 1. Mode changes remain 15–30 seconds, silo launch/defense 20/25. No faster escalation was introduced by this correction.
- **Economy/outcomes:** equal 100M initial population per faction; scoring +2 enemy deaths / −1 own; impact and timed fallout use the same city state in Lab/campaign. Fleet deployment reserves six real units atomically, without replenishing inventory. Current AI doctrines, reserves, staged waves, observed intelligence and handover/manual overrides remain intact.

## Reproducible checks

`node qa/balance-simulation.mjs`: 40 decorrelated deterministic seeds per scenario, 200 real-engine trials. One incoming ballistic missile with no defense hits in 40/40; a target beyond the defended region also hits in 40/40. One prepared silo intercepts 33/40 isolated missiles (82.5% in this scenario, not a universal rate). Against 12 simultaneous warheads, one silo stops 61/480 (12.71%); three nearby silos stop 132/480 (27.5%). This establishes a local defense benefit and measurable saturation, without continental immunity. Geometry, seed, damage to defenses and arrival synchronization affect results.

`node qa/matchup-simulation.mjs`: 84 exercises across battleship/carrier, sub/carrier, carrier/sub, fighter/bomber, fighter/fighter, silo/bomber and silo/fighter. Each runs real deployments, inventory, AI, fuel, shots and damage for up to 1,200 game seconds, asserting combat occurs and unit/fuel state remains finite. These are role/regression checks, not equal-cost win-rate certification.

Two one-hour three-faction strategy scenarios still establish staging, no-first-use retaliation and arsenal reserves. Focused tests cover the exact 10-degree boundary, visible-but-out-of-range contacts, finite projectile chase, smaller fighter scope and current-save migration. Existing full engine tests and browser checks cover selected scopes, state completion, persistent placement, fuel, fog, damage and mobile controls.

Existing sessions adopt the shared current ranges on reload. Revision-2/3 in-flight warheads preserve their progress and remaining inventories while adopting the new duration once; existing preparation/cooldown progress is not reset. Already fired conventional shots retain their launch-time chance; new shots use the new profile. No faction ownership, stocks, scores or cities are reset.

Limits: the model is DEFCON-style strategy, not real Patriot/Iron Dome/ICBM physics; native numerical parity is not claimed. Safari is not tested. The scenarios do not establish balance across every geography, alliance or player tactic.

### Final requested range/speed adjustment

Defense stays at the original 10-degree web baseline. Ballistic speed changes from 0.16 to 0.10 degrees/game-second, direct nuclear payload speed from 0.25 to 0.18. A nominal 10-degree straight defensive approach now takes 100 game seconds rather than 75 for the preceding 12-degree/0.16 profile; actual curved trajectories vary. Interceptor speed/probability/reload and radar are unchanged. Balance revision 4 updates existing missile durations once while preserving progress and inventory.

### Current adjustment — 2026-11-17, revision 17

Bomber HP 8, airfield HP 20, nuclear silo HP 30. Silo defense missiles reload every 12 game seconds; silo nuclear launch reload remains 30. Carrier launch intervals: fighter 25 seconds, bomber 45. Airfield launch intervals: fighter 30 seconds, bomber 45. Existing saves adopt the new HP maxima while preserving the fraction of HP already lost and keeping destroyed units destroyed.

Population district light crossfades from faction color to red as survivors decline, then extinguishes at zero survivors. Core and outskirts retain separate impact/radiation survival ratios. Nuclear-damaged ground installations also receive a subtle land-clipped damage field using remaining HP; hidden enemy installations never reveal a field. Original/red textures are cached separately, avoiding new procedural textures for every changing population value.

### Revision 18

ICBM speed is 0.12 degrees per game second; submarine nuclear warhead speed is 0.15. Bomber direct nuclear payload remains 0.06. Existing in-flight strategic warheads retain normalized trajectory progress and current HP while their duration adopts the new speed. Active submarine torpedo reach is six degrees, damage remains six HP, and passive targeting restrictions remain in force.

Bomber conventional bomb and nuclear payload release ranges are now both three degrees. Weapon scopes, ingress validation and actual release use this same limit.

## 2026-11-20 current rules

Absolute war-clock milestones: DEFCON 4 at 00:02:00, 3 at 00:10:00, 2 at 00:30:00, 1 at 00:45:00; score ends the match at 01:00:00. Old saves migrate to these deadlines without rewinding their clock.

Speeds in degrees per game second: fleet 0.10, fighter 0.50, bomber 0.25, silo ICBM 0.15, submarine nuclear 0.20, bomber nuclear payload 0.60. Fuel remains distance-based. Bombers use wider go-arounds and an outward ingress leg when turning too close to the target at their new speed.

Airfields never regenerate fighters; each host starts with five. Returned airframes can be reused. Individual aircraft mode survives landing, save/load, and redeployment; preparation time and real nuclear stock still apply.
