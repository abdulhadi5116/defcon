# Ten-faction world, naval formations and revised balance

## World data

New operations contain ten factions: North America, South America, Europe, Russia, Africa, South Asia, Iran, China, Southeast Asia, and Australia & NZ. South Asia retains India/Pakistan/Bangladesh/Nepal/Sri Lanka and neighboring South Asian states. Iran represents the West Asian block; China includes the East Asian block; Southeast Asia includes the ASEAN countries and Timor-Leste. Australia and New Zealand share one faction.

The first five retained territory masks remain the starting point. Country geometry partitions the new Asian/Oceanian blocks into unique land owners. Maritime deployment cells are assigned to the nearest land owner through an 18-cell raster expansion; they are game-scale deployment zones rather than a live maritime-boundary dataset. Boundaries use the retained 512-pixel, 360-degree map projection. The original map rendering/colors and original assets remain in place.

Country and new city inputs are Natural Earth GeoJSON:

- https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
- https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_populated_places_simple.geojson

`tools/build-expanded-world.py` takes a JSON export of the retained `TERRITORY_MASKS`/`TERRITORY_CITIES`, country GeoJSON, and populated-place GeoJSON. It generates `public/expanded-territory-data.js`. There are 25 cities per faction; each faction retains the existing balanced 100M initial population rule. Starting installations and circular fleets are checked against their territory and the map coastline.

Existing six-faction campaign saves keep their original territory masks, units, ownership, stock, scores and cities. New factions become available in new operations, without converting a live country's assets into enemy assets. Old setup preferences expand to the ten-faction operation picker. Legacy aircraft retain fuel already spent while adopting the smaller fighter budget. Old preparation timers are capped once to the current state duration; current saves retain their countdown. Existing missiles preserve progress/positions while adopting the slower travel duration.

## Current control and presentation behavior

- Fleet drafts contain six naval units, distributed on a circle of radius 2.2 map degrees. Group routes share center waypoints and member offsets. Legacy two-row fleets reform through physical movement, with no teleport or stock changes. Ships slow through tight turns to reach short formation waypoints rather than orbiting them indefinitely.
- Coast clearance is 1 map degree for hull centers. Group routing reserves 3.2 degrees for the circle plus hull clearance. Placement validates each member. Routes and actual movement use the same buffered coastline geometry; antimeridian wrapping remains enabled.
- A ground deployment type remains selected after successful placement until its stock runs out or Esc cancels. A six-unit fleet draft remains available for repeated placement while the full composition is still in stock. Invalid placements do not consume stock.
- The mobile header keeps the brand, readiness, clock, pause and a compact speed selector in one row. The map remains the primary surface. The desktop speed buttons are unchanged.
- Unit health bars and integrity numbers are removed from the map and unit inspector/roster. Actual damage and survival rules remain intact.
- City markers scale more strongly with surviving population, and ambient city lights are larger. Clicking a city shows its local green life area and the faction's aggregate life tint. Both dim with losses; a selected city's Info view reports its own survivors and casualties. Dead cities remain inspectable rather than valid contextual nuclear targets.

## Requested combat overrides

These are custom gameplay balance changes, not claims of native v1.43 parity.

| Behavior | Current value |
| --- | --- |
| Ballistic warhead ground-track speed | 0.12 degrees/game second |
| Bomber direct payload speed | 0.25 degrees/game second |
| Defensive silo weapon/radar range | 22 / 30 degrees |
| Silo missile reload / per-shot interception chance | 12 game seconds / 70% |
| Fighter weapon/radar range | 7 / 7 degrees |
| Fighter per-shot warhead interception chance | 50% |
| Defensive interceptor travel speed | 1.2 degrees/game second |
| Submarine nuclear range | 18 degrees |
| Bomber nuclear release range | 5 degrees (ingress releases inside 4.5) |
| Fighter total fuel from carrier / airfield | 30 / 44 travel degrees |
| Close passive sea-contact detection | 2.5 degrees |
| Active submarine sonar | 5 degrees |
| Carrier/fighter anti-submarine detection | 8 degrees |
| Silo launch / defense preparation | 20 / 25 game seconds |
| Other selectable state preparations | 15–30 game seconds |

Interception is resolved by travelling projectiles. Friendly interceptors avoid assigning more than two pending shots per team to the same warhead. The defense has finite reload throughput, so an isolated warhead can be stopped while a large simultaneous attack can saturate it. Underwater submarines require close naval contact or sonar; surfaced launch-mode submarines are normal radar contacts. Fighter ASW mode uses depth charges and temporarily gives up normal air/warhead engagement. AI can select ASW in response to actually observed submarine contacts.

## Fuel semantics

A host's displayed return-fuel circle is half of the aircraft's total travel budget. For an airborne aircraft, the displayed ellipse satisfies distance(current, destination) + distance(destination, home) = remaining fuel. Outside it, returning to that home is geometrically impossible, even before maneuver costs. Normal turns and combat can consume additional fuel inside the boundary.

Manual one-way flights are permitted, warned about, and not automatically redirected back before leaving the return envelope. They try to recover afterward and crash when fuel reaches zero if no recovery can be reached. Unattended AI sorties retain a conservative RTB safety margin. A destroyed host can still lead to recovery at another compatible friendly host; fuel never refills in flight.

## State ownership

A manual mode selection claims that unit even if the requested mode was already selected. AI cannot overwrite its mode or restart its preparation timer. Nuclear states explicitly indicate the DEFCON 1 lock or an empty payload instead of appearing to accept a blocked change. Preparation is measured in game time; pause and speed apply normally. Exhausted silos still automatically prepare defense after the final queued launch.
