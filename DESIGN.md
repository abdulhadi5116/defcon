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

Selected scopes show the current action: silo air defense, nuclear strike reach, or the chosen aircraft's flight range. Radar coverage belongs to the explicit Radar layer, or radar-station selection, so airbases and launch-ready silos do not display a second short sensor ring. Scope sweeps are cached soft angular/radial gradients, with no needle or wedge edge and an approximately 84-second revolution. Reduced effects suppresses motion. Silo ICBM reach remains global with broad illumination; submarine/bomber strike scopes retain their shorter actual launch radii.

Empty-map primary clicks deselect; deliberate coordinate targeting is a one-shot Info command, cancelled by Space, Esc, right click, selection/state change or session reload. Enemy unit/city icons remain contextual targets.

Nuclear glare draws below living unit symbols. Impacted survivors retain their icon and normal HP bar above the glare, with only a subtle shadow on the icon strokes. No opaque circular backing or operational-status banner. Confirmed destroyed contacts receive a cross and destroyed label rather than a living ghost. The hottest white core is compact (18% radius overlay), blending continuously into cream, amber and the retained outer haze. Unknown installations are not revealed by these annotations.

Population-layer city light grows in radius and intensity with surviving population, and contracts/dims after losses. The Population Strike Lab preset enables that layer and stages real named cities. Its Info panel separates immediate impact losses, delayed radiation deaths and surviving population. Clicking a city row focuses the map without arming a weapon. The same city damage and fallout update runs in campaign and Lab and is included in saved city state.

Launch commands are discrete FIFO orders. One accepted nuclear order spends one warhead when executed; additional target clicks append during preparation/reload and never modify in-flight missiles. Queue length reserves available launch stock. Info shows ordered targets and a clear-pending control; map previews number waiting targets. Space/Esc deselects or cancels coordinate targeting without discarding accepted orders. State changes clear pending launches. Pending orders and manual ownership persist in unit save state. Selecting/commanding a player unit in Lab takes that unit out of strategic AI control; unselected units continue the automated scenario, and tactical conventional combat remains automatic.

## Aircraft and sensor refinement

Bomber payload is configured at the airbase/carrier. Nuclear and conventional loadouts are fixed at launch; queued launches snapshot the host choice. Aircraft selection shows weapon reach and a blue return-fuel envelope centered on its host, with explicit home-reachability status. Bomber attacks close to the target before release, use a direct short-range payload profile, and begin RTB immediately; aircraft cannot replenish inventory unless they actually land before fuel runs out.

Guidance endpoints, planned orders and trails are displayed only for own/allied units, including in observer Lab scenes. Aircraft/ship trails carry simulation timestamps, expire after 35 game seconds and fade by age. Small weapon traces expire after 8 seconds. Enemy nuclear launches announce the launch origin with an animated warning symbol without revealing the destination. The warning honors reduced effects.

Fighter intercepts vary seeded lead/lag/crossing choices and reactive evasive breaks within the existing normal turn limit. Firing passes include a short gun-burst visual and small luminous missile streaks. Air-defense Lab stages aircraft that cross the silo's real radar/SAM radius. Air-defense silos use the original SAM state symbol in map and inspector. Radar coverage lifts local color with a soft radial glow and no hard perimeter stroke.
