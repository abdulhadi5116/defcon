# Design system

## Physical scene
A commander at a dimly lit global radar terminal follows a widening conflict. Dark ocean and low luminance land preserve contrast for subtle moving contacts.

## Composition
The canvas occupies the entire viewport. A compact floating HUD carries identity, DEFCON, time and playback. A bottom command dock opens Units, Info, Alliances, Layers, Intel and Menu popovers. No panel stays visible by default. Unit clicks reveal the inspector. Modal operation setup includes a territory map, faction identity and a six-row alliance roster.

## Palette and typography
Retain the original BLACKOUT ocean/land hex colors in canvas and OKLCH interface tokens. The rose primary remains the action accent. Six faction colors identify ownership; unit textures are subdued until selected. System monospace carries instrumentation, Arial carries wordmark and dialog headings. Native v1.43 unit bitmap outlines are converted to PNG alpha without redrawing.

## Map behavior
Horizontal world wrap applies to geography, entities and paths; vertical pan is constrained. Degree graticules adapt to zoom. MGRS references use 2/4/6/8/10 total digits and remain on the X/Y axes, with zone and square context. Zone numbers and latitude bands sit on the outer edges; the map center stays free of coordinate labels. UTM grid-zone boundaries remain visible. Optional territory and maritime overlays use the original game's masks and fade into view. Selected unit operations replace the ambient sweep. Radar coverage, population, orders and nuclear inventory are independently switchable.

## Motion and audio
Radar operation rings appear around the selected sensor. Nuclear explosions shrink and fade after flash and brief shake, without hard circular outlines or labels. Reduced effects and OS reduced motion suppress flash and shake. The original 115 OGG files include music, warnings and bunker ambience; audio starts only after a user click.

## Interaction
Native semantic popovers keep panels outside overflow clipping. One command panel opens at a time; right-click unit state menus remain available. Modal dialogs pause simulation and restore it on cancel. Fleet composition shows six explicit slots and an enabled placement action only when all six are filled.

Nuclear effects start with a strong single flash/shake and sustained white central glare. A continuous radial glow falls smoothly to transparent, contracts from the outside inward, and fades with simulation time; no detached annulus. No hard boundary stroke or Ground Zero label. Small conventional homing missiles use the original SAM texture; torpedoes/depth charges have compact traces.

Selection ranges use red for active weapons, blue for fuel/flight range, cyan for radar and green for sonar. Global ICBM reach marks the entire viewport with a subtle red outline and GLOBAL label, avoiding a misleading small circle. Deselecting clears selection overlays.

X-axis coordinate labels remain pinned to the bottom viewport edge in both Degree and MGRS modes. Interaction instructions live inside the Info popup and are not a permanent map overlay.

Live deployment, fleet, contact and inspector controls preserve their DOM identity across updates. Keyed controls update text/attributes in place instead of replacing buttons between pointerdown and pointerup. This also retains keyboard focus during preparation/reload countdowns.

ICBM simulation, guidance and sprite orientation share one quadratic trajectory, including longitude wrap. Original icon alpha bounds are centered at the world coordinate; attack marks and endpoints use that center, with picking limited to the icon box rather than its labels or health bar.

Selected scopes show the current action: silo air defense, nuclear strike reach, or the chosen aircraft's flight range. Selecting any friendly radar-capable unit automatically shows a soft local sensor glow using its actual radar radius. The Radar layer adds every friendly/shared sensor. This glow has no boundary stroke, keeping it distinct from weapon/fuel rings. Scope sweeps are cached soft angular/radial gradients, with no needle or wedge edge and an approximately 84-second revolution. Reduced effects suppresses motion. Silo ICBM reach remains global with broad illumination; submarine/bomber strike scopes retain their shorter actual launch radii.

Empty-map primary clicks deselect; deliberate coordinate targeting is a one-shot Info command, cancelled by Space, Esc, right click, selection/state change or session reload. Enemy unit/city icons remain contextual targets.

Nuclear glare draws below living unit symbols. Impacted survivors retain their icon and normal HP bar above the glare, with only a subtle shadow on the icon strokes. No opaque circular backing or operational-status banner. Confirmed destroyed contacts receive a cross and destroyed label rather than a living ghost. The hottest white core is compact (18% radius overlay), blending continuously into cream, amber and the retained outer haze. Unknown installations are not revealed by these annotations.

Population-layer city light grows in radius and intensity with surviving population, and contracts/dims after losses. The Population Strike Lab preset enables that layer and stages real named cities. Its Info panel separates immediate impact losses, delayed radiation deaths and surviving population. Clicking a city row focuses the map without arming a weapon. The same city damage and fallout update runs in campaign and Lab and is included in saved city state.

Launch commands are discrete FIFO orders. One accepted nuclear order spends one warhead when executed; additional target clicks append during preparation/reload and never modify in-flight missiles. Queue length reserves available launch stock. Info shows ordered targets and a clear-pending control; map previews number waiting targets. Space/Esc deselects or cancels coordinate targeting without discarding accepted orders. State changes clear pending launches. Pending orders and manual ownership persist in unit save state. Selecting/commanding a player unit in Lab takes that unit out of strategic AI control; unselected units continue the automated scenario, and tactical conventional combat remains automatic.

## Aircraft and sensor refinement

Bomber payload is configured at the airbase/carrier. Nuclear and conventional loadouts are fixed at launch; queued launches snapshot the host choice. Aircraft selection shows weapon reach and a blue return-fuel envelope centered on its host, with explicit home-reachability status. Bomber attacks close to the target before release, use a direct short-range payload profile, and begin RTB immediately; aircraft cannot replenish inventory unless they actually land before fuel runs out.

Guidance endpoints, planned orders and trails are displayed only for own/allied units, including in observer Lab scenes. Aircraft/ship trails carry simulation timestamps, expire after 35 game seconds and fade by age. Small weapon traces expire after 8 seconds. Enemy nuclear launches announce the launch origin with an animated warning symbol without revealing the destination. The warning honors reduced effects.

Fighter intercepts vary seeded lead/lag/crossing choices and reactive evasive breaks within the existing normal turn limit. Firing passes include a short gun-burst visual and small luminous missile streaks. Air-defense Lab stages aircraft that cross the silo's real radar/SAM radius. Air-defense silos use the original SAM state symbol in map and inspector. Radar coverage lifts local color with a soft radial glow and no hard perimeter stroke.

## Fuel and fog correction

Host launch fuel budgets are explicitly rebalanced: carrier fighter/bomber 90°/210°, airbase fighter/bomber 140°/300° of total travelled distance. Blue return coverage and validation use the actual aircraft fuel budget. Existing active saved flights upgrade once, preserving distance already consumed and their current orders, HP and payload. These are requested game-balance values, not claims about native constants.

Lab and campaign now share strict unit and projectile visibility. Unknown enemy contacts are neither rendered nor pickable before radar/sonar detection. Nuclear origin alerts do not reveal the launcher icon or manufacture a ghost. Previously observed ghost contacts may remain as memory; unverified legacy ghosts are discarded. Hidden impact-status markers and hidden selected-unit inspectors are suppressed.


## Aftermath timing and territorial screen effects

Confirmed destroyed units lose their cached contact and trail immediately. Unconfirmed last-known contacts fade over 12 simulation seconds; nuclear destruction markers fade over 6 simulation seconds. Both follow 1×/5×/10×/20× playback, including cosmetic cleanup after the result is final. Old saves discard expired or undated contacts. The nuclear blast itself keeps its existing long decay.

Full-screen nuclear flash and map shake require the blast footprint to touch the controller faction's land territory (or an owned coastal city). Foreign territory, other allied territories and open ocean retain only the local blast. Reduced effects still suppress flash/shake. Territory attribution uses the current controller, regardless of who launched the missile.

## Radar coverage relief

Coverage uses a uniform low-opacity cyan area. Overlapping sensor discs form one filled union, with no individual circle strokes or internal edges. The silhouette of the filled union marks the outer coverage boundary without center bloom or a wide gradient. All enabled sensors fill one combined path, so fleet overlaps do not accumulate brightness. Selected-unit coverage uses the same treatment. Unit icons draw afterward at 85% opacity inside an active field; selection and nuclear-lit units retain full opacity. Slow blurred scan sweeps remain separate from the coverage field.

## Commands, intelligence and escalation follow-up

Map selection persists across empty clicks, movement, and successful or rejected actions. Esc clears it; Space cancels coordinate targeting while retaining selection. Airfield/carrier fighter and bomber states accept direct left-click launch coordinates; each click remains one FIFO launch. Nuclear coordinates retain the explicit Target nuclear strike step. Full six-ship fleet drafts can be placed immediately, with all existing stock, land and maritime-border checks.

Fighters can intercept radar-detected descending nuclear missiles with their existing range, turn, reload and travelling projectiles. The 15% per-shot chance is a user-requested extension to the native combat table. Warhead glyphs can be clicked for fighter targeting. They never provide guidance to hidden hostile destinations.

AI ground strikes require current radar/sonar visibility or a previously observed installation; no omniscient installation fallback. A silo launch exposes that fixed launch installation to every faction. Known sites and launch exposure persist in unit snapshots. Nuclear Battle Lab exercises include actual finite-fuel recon patrols to reveal installations through the same sensor logic, keeping the automated exercise active without a visibility bypass.

Phase durations in simulation seconds: DEFCON 5 = 360, 4 = 600, 3 = 1800, 2 = 3600. Each transition starts a fresh deadline; the deadline and phase start persist across reloads. Legacy saves receive one full current-phase countdown on migration. Existing DEFCON 1 games remain at 1. Playback accelerates both movement and countdown together.

## Exhausted silo fallback

After a silo fires its last warhead and its FIFO launch queue drains, it automatically enters air-defense mode with the existing 340-second preparation time. Missiles already in flight continue unchanged. A partially expended silo remains in launch mode so further one-shot commands can still be chained. The same rule covers AI, Battle Lab, direct launch calls and queued commands. Loading an older exhausted launch-mode silo starts the same transition once; already preparing/defensive saves keep their remaining countdown.

## Strategic doctrines and player handover

Faction AI uses persisted utility plans with seeded doctrine diversity, first-use policy, retaliation, limited waves, target commitments and reserves. It uses observed contacts and known static installations, while preserving player alliances and unit mechanics. See research/STRATEGY.md for balance rules and validation.

The existing command menu contains Hand over to AI. While automated, the header becomes Take command; reclaiming control preserves accepted orders. The menu reports only the player's doctrine and current reason. Opponent strategic intent stays out of the player UI. Handover state persists in game saves; new/legacy manual sessions do not silently enable it. Execution follows the active browser simulation.

## Ten-faction and balance follow-up

The current operation setup offers ten factions; old six-faction sessions retain their original ownership/masks. See research/WORLD_EXPANSION.md for country grouping, data provenance, migration and the current numeric balance. Fleets use physical circular formations with buffered coast routes and repeatable deployment drafts. Ground placement remains active until canceled or exhausted.

Mobile controls now share a single header row with the brand; speed uses a compact native selector. Unit HP presentation is removed. Population is shown through size and life illumination, with selected-city context and casualty-sensitive local/territory lighting. Fuel circles at hosts and two-focus airborne fuel ellipses describe return capacity; manually leaving that envelope can cause fuel exhaustion. Short preparation states show explicit readiness/locks and honor manual command ownership.

Defense/fighter/warhead balance now follows research/BALANCE.md and public/balance.js, superseding WORLD_EXPANSION numeric values for those rules. Sensor illumination and weapon rings remain separate.

Current fleet/air rules and persistent Radar/Full map intelligence follow research/LOCAL_ENGAGEMENTS.md. Full view changes presentation and inspection only; AI and weapon acquisition keep real sensor limits.

All AI factions and player handover now use the unified controller in research/STRATEGY.md. Battleship range is 3°. The old personality/difficulty variants are disabled, with legacy-save migration retaining accepted manual orders.

Current pressure policy: research/STRATEGY.md now documents independent overlapping packages and counterattacks during existing strikes. Submarine torpedo and nuclear reach is 3°. Missile fleets may physically rotate their compact circle to place submarines toward the coast while retaining navigation margins.

## Zoom and airborne fuel update

City symbols and labels progressively reveal lower population cities as the player zooms in. Population layer follows the same filtering. Larger cities and the selected city take priority; measured label rectangles choose a free side of the marker and omit labels that still collide. Unit glyphs scale linearly with map scale, including fleet members and selection rings. Fleet formation remains at its existing world spacing, so zoom cannot make fixed screen glyphs overlap the fleet.

Airborne fuel uses a circular remaining-distance envelope centered on the moving aircraft, replacing the earlier two-focus return ellipse. Host launch rings still show nominal round-trip reach. Fuel zero collapses the circle and destroys the aircraft. Return-to-host status remains a separate explicit inspection value.

## Readable zoom correction

This correction supersedes the world-scaled glyph paragraph above. Unit glyphs retain an 18 CSS-pixel visible extent across zoom levels, compensated for each original bitmap's transparent padding. City marker size depends on population (5–18 CSS pixels), not map zoom. All city markers and population glows render at every zoom; only names/population text use zoom thresholds and collision rejection. Unlabelled cities remain pickable.

At low zoom, a fleet's visible contacts are separated onto a compact minimum screen-radius circle with faint stems to their real positions. Display offsets never change simulation positions, weapon reach, navigation, visibility, or save state. Picking and planned target markers share the display coordinates. Selected ships remain at their true position so range overlays stay centered. Hidden enemies never participate in the visible layout. As geographic spacing becomes sufficient at higher zoom, glyphs return to their actual projected locations.

## Control pacing and save responsiveness

Small cities have a minimum 5-pixel marker and 10-pixel picking radius; large cities retain population-based size up to 18 pixels. Airborne fuel scopes use 4/6-pixel dashes and 25% opacity.

Fleet members follow the center route immediately, including waypoint direction changes, without first turning through their old heading. Island avoidance and physical formation offsets remain authoritative. Airfield fighter/bomber launch intervals are 5/10 simulation seconds; carrier deck intervals are 8/15. State preparation, finite inventory and FIFO orders still apply.

Periodic save work is based on real time, independent of playback: 8 seconds normally and 15 at 10×/20×. Input-triggered saves debounce 1.5 seconds with minimum 3/5-second spacing. Manual saves remain immediate and show SAVING before encoding. Snapshot encoding, gzip and IndexedDB recovery writes run in a Worker, while the simulation/render loop captures only a shallow descriptor and posts an immutable structured copy. Autosave skips pending work rather than accumulating more captures behind a slow request.

## Combat revision 7 visual follow-up

City marker sizes now use a continuous logarithmic 6–25px scale, giving medium populations a distinct intermediate size. Population influence extends farther and renders through cached irregular multi-lobed textures instead of circular radial halos. Selected-city life light uses the same organic footprint. Population casualties still dim and contract it. Unit symbols use gentle optical compensation from 18px at zoom-out to about 22.65px at maximum zoom, without altering unit geography.

Aircraft inspection shows conventional bomber bombs remaining independently of nuclear stock. Fighter weapon scopes label missiles (5°) and guns (2°) separately; battleship scopes label anti-ship (9°) and anti-air (7°). Passive submarine torpedoes use 5° on confirmed contacts; active sonar and torpedoes use 9°. Carrier AA gun reach is 3°. Aircraft engagement paths move continuously around the enemy rather than pausing at short steering waypoints.

## Per-city light catchments

Selecting a city no longer triggers country/faction fill or a faction border stroke. Territory and maritime overlays are controlled only by their own layer/deployment state. City life color applies to that city's local light patch.

Every city receives a bounded local catchment (maximum 8 map degrees) clipped against nearby cities using wrapped-longitude perpendicular bisectors. The catchment shapes the cached irregular light texture, then a second blur softens its edges. No district border is stroked. The footprint follows map scale, while city marker pixel sizes retain their existing population scale. Surviving population dims and shrinks only that city's light; destroyed neighboring catchments remain dark rather than being absorbed into a faction-wide glow.

## Conventional bomb identity

Conventional bombs have a solid finned capsule, subtle tumbling, and a short visual drop toward the impact plane. They do not use a missile exhaust streak or guidance trail. Their impact has a larger warm flash and nine outward fragments, below the unit drawing layer. A bomber carries six conventional bombs and releases one per completed moving pass. Each successful hit deals three damage; missile, gun and torpedo hits retain one damage.

## Fleet engagement and laboratory controls

An attack on a visible contact outside the selected naval unit's effective weapon range commands the entire formation to a safe standoff position. The selected unit retains its individual target; other ships keep their own modes. Pursuit follows only current sensor contacts, preserves coastal clearance, and stops after entering range. A movement order cancels pursuit. An individual attack on an already reachable target preserves existing fleet movement.

Battle Lab has a Fleet vs Fleet preset with six ship selectors per side, reusable across one or two formations. AI vs AI is the default; Manual vs AI leaves the allied side stationary until commanded. A mixed fleet normally starts with two battleships, two carriers and two submarines; every second carrier starts in ASW duty while the other operates its finite aircraft deck. All combat, pursuit, sensors and damage use the existing shared engine. Control mode and composition persist with the session. Composition fieldsets stack on narrow screens.

## Friendly formation collision avoidance

The minimum fleet gap is 1 map degree of free water between formation envelopes, rather than between their centers. Ships inside one six-ship fleet retain their normal close spacing. Only friendly/allied formations interact; hostile fleets can cross through each other.

A sixty-second forecast checks whether current routes would violate the gap. Steering blends over eight simulation seconds and remembers a passing side until the encounter clears. The same translation applies to every ship in the formation, capped at the existing fleet speed. Stationary fleets stay anchored when approaching traffic can pass around them. The original route/destination remains intact, including attack pursuit.

Every avoidance translation respects each hull's coastal clearance. Closing velocity is removed at the safety boundary while tangential movement remains; a coastal stop propagates safely to following formations. Existing overlapping formations separate gradually without teleportation. Steering and passing-side state live on the normal saved fleet record; invalid steering values are rejected during restore.

## DEFCON 5 sea permissions and revised short-range weapons

Fighter missiles and ASW depth charges use 3° reach; fighter guns retain 2°. Carrier AA guns and ASW depth charges use 5° reach. The 1.5° firing limit against passive submarines remains the tighter cap.

At DEFCON 5 in Global Conflict, naval movement is restricted to the union of active own/allied maritime zones. Navigation checks the full route against this live permission predicate, including every hull's formation offset. It can route around unauthorized corridors rather than merely checking endpoints. Permission checks are independent from cached coast geometry, so alliance changes take effect immediately. Per-tick movement and collision-avoidance checks prevent old paths or avoidance steering from crossing a newly forbidden sea boundary. At DEFCON 4 the maritime permission restriction is removed; ordinary water routing and coastal clearance remain. Lab scenarios keep their normal unrestricted exercise routing.


## Nuclear launch warnings

Launch warnings use a bold, three-blade radiation trefoil, 64–70 screen pixels across, in warm warning yellow for hostile launches and muted green for own/allied launches. The large symbol replaces the old thin expanding ring. Uppercase bold launch text stays on screen beside or below it. Offscreen launch origins get a filled directional arrow and a smaller radiation badge inside the HUD/dock safe area. Nearby edge markers are consolidated. Projection uses the nearest wrapped globe copy. Alerts fade after eight real seconds and do not restart while paused; reduced-motion mode keeps a static symbol radius. Combat visibility and launch-detection mechanics are unchanged.


## Narrow sea passages and local population light

Fleet routes retain their normal circle and coastal margin in open water. Malacca, Taiwan, and Korea–Japan passages use a local 0.1-degree navigation grid when the coarse route misses a channel or makes an avoidable detour. A fleet contracts only as far as required, validates every hull segment, and follows those waypoints independently through narrow water. At a roomy destination the circle spreads out again. Route planning, per-frame coast checks, recovery, and checkpoints share the same clearance. Land and unauthorized DEFCON 5 sea remain forbidden. An embedded formation can accept a new sea destination and resume after escaping.

City lighting spreads over larger local catchments with soft overlap between neighboring cities and an irregular diffuse field. A cached coastline clip applies after light blending, keeping all population illumination on land. Centers use surviving population divided by initial population; surrounding light uses survivors divided by the population remaining after direct impact. Impact therefore dims the center immediately, while subsequent radiation progressively darkens the local outskirts. The footprint stays fixed while fading, so light does not collapse into a shrinking circle or paint an entire faction. City icons and hitboxes are unchanged.
