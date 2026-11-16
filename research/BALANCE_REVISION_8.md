# Bomb and durability revision 8

Latest requested balance supersedes revision 7 where listed.

| Unit | HP |
| --- | ---: |
| Battleship | 15 |
| Carrier | 20 |
| Submarine | 5 |
| Fighter | 5 |
| Bomber | 4 |
| Silo | 30 |
| Airfield | 20 |
| Radar | 6 |
| Nuclear warhead | 10 |

Conventional bomber payload: six bombs per sortie; three damage per successful bomb hit, maximum eighteen damage with six successful impacts. Hit probabilities, range and one-bomb-per-moving-pass gating are retained. Nuclear payload remains separate. Other conventional weapons retain one damage per successful hit.

Bomb projectile uses a finned filled body, subtle tumble/drop and no missile exhaust/guidance trail. Bomb impact uses a larger warm glow with radial fragments. Actual damage is applied only upon arrival, through the same engine in Lab and campaign.

Revision 8 restores the fraction of remaining unit health against the new max HP; dead units remain dead. Old in-flight conventional bomb damage becomes three. A saved bomber preserves the number of bombs already spent: old eight remaining becomes six, five becomes three, two or fewer becomes zero; empty conventional bombers return home. Restoring the migrated snapshot again does not repeat the changes.

Validation: 240 automated tests; local Edge browser verifies actual bomb/missile projectile kinds, three/one damage on arrival, requested HP, render without browser errors. Safari was not tested.

## Passive submarine correction

Passive sonar cannot engage any target, even a confirmed contact at zero distance. Its conventional weapon range is zero and there is no weapon ring. Passive hearing remains 2.5° as a separate detection scope. Active sonar alone enables 9° torpedoes after preparation; surfaced MRBM mode retains its separate 20° nuclear strike scope and cannot fire torpedoes.

Against a passive submarine, every eligible enemy conventional weapon uses the smaller of its normal target-specific range and 1.5°. This applies even if shared sonar/ASW has already detected the submarine farther away; detection does not extend firing range. It applies to battleship fire, active submarine torpedoes, bomber conventional bombs and fighter ASW. Switching the target submarine to active or launch mode restores normal enemy weapon ranges. Weapons already in flight keep their existing travel budget; this is a firing-range rule, not projectile immunity or cancellation. Area nuclear blasts keep their existing damage behavior.

The shared weaponRange helper controls actual combat and targeted aircraft steering; passive attack commands are rejected by canTarget. Inspector uses mode-aware weapon range rather than static type metadata. Restoring older snapshots clears obsolete passive attack intent without altering payload or nuclear queues. Local Edge browser verifies passive 0°/no weapon ring, active 9° torpedoes, and switch back to passive; no browser errors. Safari remains untested.

The later [naval pursuit and mixed Fleet Lab rules](NAVAL_PURSUIT_AND_FLEET_LAB.md) supersede the passive-submarine attacker eligibility paragraph above: only fighter/carrier ASW can conventionally engage submerged subs; active sonar is detected by ASW at 12°, passive at 8°. Carrier depth charges now have 3° normal range, capped at 1.5° against passive subs.

Latest [DEFCON 5 navigation and range update](DEFCON5_NAVIGATION.md): fighter missile/ASW 3°, carrier AA/ASW 5°; fighter guns 2° and passive-sub cap 1.5° remain. Global Conflict fleets stay in own/allied sea zones at DEFCON 5, with open-sea movement at DEFCON 4.
