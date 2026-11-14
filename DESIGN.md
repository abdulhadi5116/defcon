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

Nuclear effects keep a brief flash/shake, followed by a larger soft annulus that gradually contracts and fades with simulation time. No hard boundary stroke or Ground Zero label. Small conventional homing missiles use the original SAM texture; torpedoes/depth charges have compact traces.

Selection ranges use red for active weapons, blue for fuel/flight range, cyan for radar and green for sonar. Global ICBM reach marks the entire viewport with a subtle red outline and GLOBAL label, avoiding a misleading small circle. Deselecting clears selection overlays.

X-axis coordinate labels remain pinned to the bottom viewport edge in both Degree and MGRS modes. Interaction instructions live inside the Info popup and are not a permanent map overlay.

Live deployment, fleet, contact and inspector controls preserve their DOM identity across updates. Keyed controls update text/attributes in place instead of replacing buttons between pointerdown and pointerup. This also retains keyboard focus during preparation/reload countdowns.
