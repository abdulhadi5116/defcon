# Friendly fleet separation

User request: 1° minimum fleet separation, smooth avoidance for crossing/scissor routes, hostile fleets allowed to pass through.

Implemented in public/fleet-avoidance.js and Simulation.prepareFleetAvoidance. Each living formation's center and enclosing radius are measured from its actual hulls, including partially destroyed formations. The safe center distance is radiusA + radiusB + 1°, so the free gap between envelopes is at least 1°. Internal ship spacing is unchanged. Only pairs accepted by the existing allied() relation participate; enemy coordinates never influence avoidance.

Closest-approach prediction uses nominal velocities over 60 simulation seconds. A lateral steering force blends over an eight-second response and retains a chosen passing side until clear, preventing direction flipping. Coastal probes choose a pass with room at the projected encounter. Every member receives the same translation, limited to that fleet's existing ship speed. Original destination and waypoint records are retained.

At the safety boundary, inward closing velocity is removed while tangential movement remains. Hull/coast checks can stop an unsafe translation; a monotonic safety pass prevents following formations running into a newly stopped fleet. Moving traffic goes around anchored formations. Already overlapping legacy formations separate gradually at normal speed rather than teleporting. Narrow passages may require waiting when there is no safe passing room.

Saved fleet records contain avoidance velocity and encounter passing sides. No new save schema or balance-resource migration is needed; absent state starts at zero. Restore rejects non-finite steering or invalid passing-side values. Runtime per-tick planned translations are not serialized.

Verification: 269 automated tests passed. Dedicated cases cover friendly head-on passes, scissor crossings, four fleets at one junction, anchored fleets, allied factions, enemy pass-through, exact formation preservation, movement speed/turn smoothness, dateline crossings, deterministic restored steering, island margin and preexisting overlaps. The local Edge UI test issued two actual fleet movement commands, measured minimum envelope gap 1.7567°, verified destinations after the encounter, and exercised Save Now plus reload mid-avoidance with identical restored positions. No browser errors. Safari was not tested.
