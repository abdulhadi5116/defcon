# Combat correction: v1.43 evidence and web behavior

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

Explosion update `0x44a6c0` stores initial size and decreases the remaining-size member at offset `0x218`. Draw `0x44a850` uses remaining/initial size for alpha (capped near .7), and remaining-size/20 for dimensions. The web effect therefore starts at a 5-degree visual radius, gradually shrinks and fades for 500 game seconds (25 real seconds at 20x), with a soft annulus and no labels or crisp boundary stroke. The exact native time integration was not recovered; the 500-second lifetime is a visual calibration. Impact flash/shake stays brief and honors reduced motion. Visual radius does not imply damage radius.

## Requested deviation from native

Nuclear weapons cannot select aircraft, and airborne units are excluded from nuclear blast damage, as explicitly requested in this chat. Native `0x46a5a0` classifies aircraft as moving objects and the nuclear area path would destroy moving objects within its range. The web aircraft immunity is deliberately a user-requested rule, not a claim about native DEFCON. Fighters and bombers retain native one-life durability and can be shot down by a successful conventional hit. Ships retain three life; submarines one. Shot attempts can miss, so a launch is not a guaranteed hit.

## One combat engine

Both Global Conflict and Battle Lab call the same target-validation, radar/sonar, projectile travel, impact probability, damage, nuclear detonation, flight steering/fuel, deck launch/reload and recovery functions. Observer visibility only affects rendering. It never provides weapon lock. Real projectiles carry source/target IDs, home toward live positions, resolve damage on arrival, expire and respect new alliances.

Fighters curve into firing passes; naval bombers maintain standoff passes. These steering patterns, projectile speeds (.4 degrees/s conventional missiles, .12 torpedoes, .08 depth charges), sonar exposure, tactical target priorities and AI are web reconstructions, not recovered native algorithms.

Lab stages up to two formations per side: six-unit naval fleets or real aircraft/decks with finite inventories; nuclear/defensive silos and airbases are available. Lab assigns starting mission/state and lets both sides run the same tactical AI, whereas Global Conflict leaves the player's orders manual. The naval mission can also be carried by a gameplay unit; it does not change weapon rules. Lab remains a 60-game-minute controlled scene. It does not reproduce a full campaign or multiplayer.

Tests cover repeated direct strikes, capital-ship multi-hit durability, moving projectile timing and misses, legal target classes, sonar acquisition, carrier ASW, aircraft fuel/passes, visual decay, real lab inventories and exact simulated encounter equality across Lab/Global Conflict under identical orders and seed.
