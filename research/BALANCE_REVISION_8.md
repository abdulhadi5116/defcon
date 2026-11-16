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
