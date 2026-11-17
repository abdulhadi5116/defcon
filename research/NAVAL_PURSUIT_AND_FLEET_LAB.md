# Fleet pursuit, ASW eligibility and mixed Battle Lab

## Corrected attack movement

Previously Simulation.order only saved target/engageTargetId for a naval attack. Aircraft used that target for steering; ships did not create any movement order. A fleet could therefore accept an out-of-range attack and remain stationary.

Naval attack intent now drives formation routing. The selected ship's effective target-specific range sets the standoff; the full six-ship formation moves together at the unchanged 0.05 degrees per simulation second. Moving contacts trigger bounded replanning rather than a fresh route every frame. Longitude wrapping and coastal clearance use normal navigation. Targets already in range preserve the current route. On reaching the attack band, pursuit stops the fleet and normal projectile combat fires. A manual destination replaces pursuit. Dead targets, lost sensor contact or invalid weapon states stop tracking rather than following hidden live coordinates. Intent persists in normal unit/fleet snapshot records.

Island testing exposed two route edge cases: sea units used the 0.15-degree waypoint tolerance to cut a coastal corner before reaching its actual clearance point; route reconstruction could omit the reachable start grid node needed during a later replan. Ships now complete exact water waypoints and replans retain the reachable start node before route smoothing.

## Current submarine engagement matrix

| Target mode | Eligible conventional attackers | ASW detection | ASW firing range |
| --- | --- | --- | --- |
| Passive | Fighter ASW, carrier ASW | 8 degrees | at most 1.5 degrees |
| Active sonar | Fighter ASW, carrier ASW | 12 degrees | fighter 5, carrier 3 degrees |
| MRBM/ICBM launch (surfaced) | ordinary fighter, battleship and eligible ASW/anti-ship weapons | normal radar; ASW also applies | normal target-specific range |

A passive submarine cannot fire torpedoes. Active sonar enables its 9-degree torpedoes against eligible surface ships. Submerged target restrictions apply even when another allied sensor confirms the contact. Carrier ASW depth charges use 8-second reload and 1 damage per successful hit, separately from aircraft deck preparation. Carrier AA guns remain 3 degrees against aircraft. Ordinary missile/torpedo/bomb projectile locks are discarded if the target sub dives before impact; depth charges remain valid. Old sonar timer fields no longer provide live submarine tracking outside actual coverage. Historical contacts still use normal ghost fading. Area nuclear detonation rules remain separate.

## Fleet vs fleet laboratory

Select Battle Lab -> Fleet vs Fleet. Each side has six configurable battleship/carrier/submarine slots; the existing formation count can repeat that composition once or twice. The default is two of each type. Every second carrier starts as ASW support; others launch from finite decks. The support carrier can resume aircraft operations after opposing submarines are eliminated.

AI vs AI controls both sides; Manual vs AI leaves allied movement and launch decisions to the player. A manual fleet command takes over that allied formation. Mode and composition survive session saves. Mixed Lab AI selects visible eligible contacts and calls the same naval pursuit implementation as player commands. It does not bypass targeting, preparation, payload, fuel or damage rules.

Validation: 260 automated tests passed, covering moving/stationary targets, attack arrival and firing, preserved formation, cancelled pursuit, lost contact, dateline, island routes, restored intent, submarine attacker/mode combinations, finite mixed fleet decks, autonomous naval/air/ASW combat and manual control persistence. Local Edge browser tests exercised actual preset controls, a changed fleet composition, AI combat with naval projectiles/aircraft/depth charges, manual mode reload, 390px mobile overflow, and real map-click pursuit followed by firing at 8.099 degrees. No browser errors. Safari was not tested.

## Locked fleet interception — revision 18

Active submarine torpedoes have six-degree reach and retain six HP damage. Fleet attack orders use the shortest positive weapon range among living, ready members that can actually target the contact; passive submarines and incompatible AA weapons do not shorten that range. Every eligible attacker retains the designated contact. Close ASW approaches use a compact formation, and pursuit stops only when the relevant weapons are within range. A destroyed target transfers the lock to another visible hull of the same enemy fleet; loss of all valid sensor contacts stops pursuit.

Pursuit refreshes keep following the accepted safe route while the worker calculates the next intercept. Applying the refreshed path validates its first segment from the ship's current position. Ordinary movement orders and shore-recovery jobs still hold movement while planning. Fleet speed uses the cosine of wrapped course error with smooth braking/acceleration, giving proportional slowdown and equal signed 180-degree reversals.

Intercept lead uses successive visible contact positions rather than an enemy's private movement destination. A refreshed route omits a passed formation-join waypoint only when the next segment is safe from the current hull position, preventing backtracking during worker handoff.
