# Combat correction: v1.43 evidence and web behavior

Current close-engagement balance and Radar/Full view settings are documented in [LOCAL_ENGAGEMENTS.md](LOCAL_ENGAGEMENTS.md), superseding older values below.

The target is the same user-supplied v1.43 installer documented in BASELINE.md. REA admitted the unpacked PE with SHA256 `8169bbbbb364084dadea790a004a4595acc9549dfcc5fc9a12884d072e4615e2`. Deep providers remain unavailable (Ghidra/Hopper/IDA/Kuna not configured); configuration was not modified. Read-only PEfile/Capstone inspection recovered the following evidence. No native Windows code was executed. `tools/inspect-classic-combat.py` reproduces the retained `native-combat.txt` using the existing analysis environment.

## Recovered matchup table

Function `0x468810` initializes integer entries; `0x468a8e` indexes `0x553748 + (targetType * 14 + attackerType) * 4`. Calls and constructors establish type IDs: silo 2, radar 3, nuke 4, submarine 6, battleship 7, airbase 8, fighter 9, bomber 10, carrier 11. Values are interpreted as percent hit chances for conventional weapons. The JavaScript retains one damage point on a successful conventional impact.

| Attacker / target | Submarine | Battleship | Carrier | Fighter | Bomber |
| --- | ---: | ---: | ---: | ---: | ---: |
| Battleship | 30 | 10 | 20 | 30 | 20 |
| Carrier ASW | 30 | 0 | 0 | 0 | 0 |
| Active submarine | 10 | 20 | 20 | 0 | 0 |
| Fighter | 3 | 10 | 10 | 10 | 30 |
| Naval bomber | 25 | 25 | 25 | 0 | 0 |
| Defensive silo | 0 | 0 | 0 | 10 | 10 |

Ground installation columns have no conventional damage entries from these attackers. We have not invented conventional ground attack capability. Silos defend against aircraft and warheads; their 25% nuclear-interception chance remains a web calibration, not recovered from this table. Native table modifiers, distance/evade checks and exact RNG sequencing are not fully traced.

## Nuclear durability and visuals

The official [DEFCON manual, printed page 18](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1520/manuals/DEFCON%20manual.pdf?t=1739091415) says silos withstand three direct hits. Constructors establish silo life 25 and airbase life 15. In `0x464790`, the area-damage path at `0x464969` subtracts exactly 10 life from stationary objects. The nuke impact supplies intensity 100; the proximity comparison divides by the constant 50. We map this to a 2-degree damage radius, applying 10 damage without the previous invented 10-degree falloff. This distance mapping remains an interpretation of the native distance helper. Cities retain a reconstructed population-loss curve inside that radius.

Explosion update `0x44a6c0` stores initial size and decreases the remaining-size member at offset `0x218`. Draw `0x44a850` uses remaining/initial size for alpha (capped near .7), and remaining-size/20 for dimensions. The web effect therefore starts at a 5-degree visual radius, gradually shrinks and fades for 500 game seconds (25 real seconds at 20x), with no labels or crisp boundary stroke. The requested visual override uses a continuous radial glow and a brighter white core: alpha holds at 1 through half the lifetime, then fades while the radius continues to contract. The exact native time integration was not recovered; the 500-second lifetime is a visual calibration. Impact uses a single 2.2-second flash decay and .6-second shake, honoring reduced motion. These stronger glare settings are user-requested art direction, not native rendering parity. Visual radius does not imply damage radius.

## Requested deviation from native

Nuclear weapons cannot select aircraft, and airborne units are excluded from nuclear blast damage, as explicitly requested in this chat. Native `0x46a5a0` classifies aircraft as moving objects and the nuclear area path would destroy moving objects within its range. The web aircraft immunity is deliberately a user-requested rule, not a claim about native DEFCON. Fighters and bombers retain native one-life durability and can be shot down by a successful conventional hit. Ships retain three life; submarines one. Shot attempts can miss, so a launch is not a guaranteed hit.

## One combat engine

Both Global Conflict and Battle Lab call the same target-validation, radar/sonar, projectile travel, impact probability, damage, nuclear detonation, flight steering/fuel, deck launch/reload and recovery functions. Rendering and weapon targeting now both obey real radar/sonar visibility in Lab and campaign; the previous Lab rendering-only observer bypass has been removed. Real projectiles carry source/target IDs, home toward live positions, resolve damage on arrival, expire and respect new alliances.

Fighters curve into firing passes; naval bombers maintain standoff passes. These steering patterns, projectile speeds (.4 degrees/s conventional missiles, .12 torpedoes, .08 depth charges), sonar exposure, tactical target priorities and AI are web reconstructions, not recovered native algorithms.

Lab stages up to two formations per side: six-unit naval fleets or real aircraft/decks with finite inventories; nuclear/defensive silos and airbases are available. Lab assigns starting mission/state and lets both sides run the same tactical AI, whereas Global Conflict leaves the player's orders manual. The naval mission can also be carried by a gameplay unit; it does not change weapon rules. Lab remains a 60-game-minute controlled scene. It does not reproduce a full campaign or multiplayer.

Tests cover repeated direct strikes, capital-ship multi-hit durability, moving projectile timing and misses, legal target classes, sonar acquisition, carrier ASW, aircraft fuel/passes, visual decay, real lab inventories and exact simulated encounter equality across Lab/Global Conflict under identical orders and seed.

## Selected operations and flight update

The official manual (printed pp. 11 and 18-19) distinguishes attack range (red), aircraft fuel range (blue), radar coverage, globally reaching silo missiles, shorter submarine/bomber missiles, and automatic recovery after an objective. Recovered constructors retain fighter turn .04 and bomber turn .01. These existing source-backed constants are preserved. Operation overlays now read one shared range definition with launch validation: silo 360/global, submarine 45, bomber 25, radar 30, current aircraft fuel, and selected host launch mode flight range. Numeric launch radii remain the web baseline's calibration; the manual establishes the reach hierarchy. The old viewport-centered sweep is removed.

Dogfighting now uses lead intercept, a forward firing arc and a timed break turn before re-engaging. The intercept lead (up to 8 seconds), break duration (30 seconds), forward firing arcs and turn-course geometry are reconstruction choices constrained by the recovered turn limits; no native dogfight state machine was recovered. The surface strike objective queues ingress without spending a warhead, validates remaining return fuel, launches within SRBM radius and recovers to a living compatible host. This path is shared by the Lab and normal gameplay; no Lab-only weapon physics is added. Tests include complete ingress/launch/return/landing, alternative-host recovery, turn limits, firing direction, reacquisition, fuel refusal and selection range consistency.

### Requested population extension and impact readability

See MECHANICS_AUDIT.md for immediate/radiation loss separation and its explicitly calibrated game rules. City light follows surviving population; the Population Strike Lab and campaign share damage, fallout, scoring and persistence. The blast remains unchanged but now draws below live unit symbols and confirmed impact status, so glare does not conceal a surviving airbase or silo.

### Aircraft calibration update

The later user-requested aircraft refinement supersedes the earlier 25-degree bomber radius and per-aircraft payload controls: hosts configure immutable launch payloads; bomber release is now 10 degrees with close ingress and a direct SRBM profile, followed by RTB. Aircraft display attack and host-centered return-fuel coverage. See MECHANICS_AUDIT.md for the new calibration, fuel-envelope limits, seeded tactics and regression evidence.

### Fuel and fog correction

Later user-requested fuel rebalance uses carrier 90/210 and airbase 140/300 fighter/bomber travelled-degree budgets. Selected units illuminate their real radar radius without a hard edge; global coverage is still an explicit layer. The same radar helper determines detection and projectile display. Dedicated sonar acquisition is tracked separately from launch announcements, so neither a launch nor legacy launch flags can reveal the source unit outside sensors. See MECHANICS_AUDIT.md for compatibility and regression details.

## Requested fighter interception extension

Fighter → nuclear missile now has a 0.15 per-projectile hit chance. The target must be hostile, detected and descending (progress above 0.5), and combat retains the normal 5° fighter range, 20-second reload, facing gate and finite travelling missile. This is a requested gameplay extension, outside the recovered v1.43 combat table. Defensive silo → missile remains 0.25. Campaign and Lab both call the same acquisition, pursuit, combat and projectile resolution methods.

## Latest requested defense/fuel/naval balance

The authoritative current override table is in research/WORLD_EXPANSION.md. Defensive silo range is 22°, radar 30°, reload 12s, warhead hit chance 70%; fighter warhead chance is 50% with 7° engagement. Interceptors travel at 1.2°/s. Ballistic warheads travel at 0.12°/s and direct bomber payloads at 0.25°/s. Submarine nuclear range is 18°, bomber nuclear range 5°. States now prepare in 15–30 game seconds (silo launch 20s, defense 25s). Hidden close-contact/ASW detection, actual reloads and finite projectile travel determine penetration; mass attacks can saturate defense. These user-requested overrides supersede earlier runtime values while preserving the recovered native table as provenance.

## Defense correction

The excessive 22-degree/70% defense revision is superseded by [BALANCE.md](BALANCE.md): local 10-degree weapons, separate 20-degree silo radar, 20s reload, 40% warhead chance, native 10% aircraft chances, 5-degree fighter scope and 25% fighter warhead chance. Current shared values live in public/balance.js; real-system sources and measured saturation are recorded there.


## Current weapon and aircraft override (2026-11-16)

These values supersede the earlier balance history above and are shared by Campaign and Battle Lab:

| Unit | Weapon | Range | Damage per successful hit |
| --- | --- | --- | --- |
| Fighter | Missile / gun | 4° / 1.5° | 1 / 1 |
| Carrier | AA gun / depth charge | 5° / 2° | 1 / 1 |
| Battleship | AA missile / AA gun / anti-ship | 6° / 2° / 9° | 1 / 1 / 1 |
| Active submarine | Torpedo | 6° | 3 |

Passive submarines retain the 1.5° enemy ASW firing cap. Active sonar detection remains 9°. Each selected unit has at most one weapon ring, representing its furthest weapon; sensor coverage and fuel remain separate overlays.

Fighter loadout is configured at the launch host. Each queued launch captures that configuration; airborne aircraft cannot switch payload through the UI or engine command. Saved host configurations and queued payloads persist. AI and Lab select the loadout before takeoff.

Conventional bombers approach the target center, release within 0.65° and 30° of their heading, continue 4.5° past the target, and go around before approaching again. Bomb projectiles start at the aircraft center with no visual wing offset. Six bombs are carried; the original-base fuel reserve can end a sortie before all six are spent. Tests cover complete six-pass delivery with sufficient fuel and normal-budget recovery with multiple completed passes.


## Nuclear shock, fuel and sonar override (2026-11-16 follow-up)

Carrier depth charges remain 2°. Fighter fuel is now 40 travelled degrees, corresponding to a nominal 20° return radius at both host types. Existing airborne fighters retain distance already consumed when upgrading fuel revision 5 to 6; bomber budgets are unchanged.

Silo and submarine Nuclear Launch preparation takes 120 game seconds. AI strike synchronization includes the actual transition preparation, not only an existing countdown. Submarine active-sonar attack orders may be assigned during preparation and are held as the pending engagement until readiness; visibility, ownership and target-class validation still apply. This intent survives session restore.

Active submarines can engage other submarines with torpedoes: 6° for active/surfaced opponents, with the existing 1.5° passive-target weapon cap. Passive attackers remain unarmed. Torpedoes can resolve underwater; ordinary missiles still lose lock on a diving submarine.

Nuclear sea damage is 20 × (1 − distance / 2°) HP inside a 2° radius, applied to every ship in the footprint, including neighboring fleets. Damage is zero at and beyond 2°. Ground installations retain 10 HP nuclear impact damage. Aircraft remain excluded. Radiation continues to affect population only.

Visual radii are unchanged: initial glow radius 5°, additional center-light radius 0.9° (18% of glow radius), fading and shrinking over 500 game seconds. The brightest portion of the additional core occupies roughly its inner 0.27° and blends into the other gradient; none of these are hard-edged damage rings.
