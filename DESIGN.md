# Design system

## Physical scene
A commander at a dimly lit radar terminal watches a widening Atlantic conflict. Dark ocean and low luminance panels keep the map and moving contacts legible without overwhelming their surroundings.

## Composition
Dense product interface: 80px terminal header, 61px playback/navigation bar, flexible three-column tactical workspace, event teletype and assessment strip, terminal footer. At tablet widths inspector yields space to map; on mobile map comes first and readiness/deployment appear underneath.

## Palette
Restrained operational neutrals, rose primary based on the supplied 350-degree brand seed, cyan allied contacts, coral hostile contacts. CSS tokens are OKLCH; canvas uses equivalent sRGB colors for predictable native rendering.

## Typography
System monospace for tactical data and labels; Arial for wordmark, DEFCON numeral and dialog headings. Operational labels are small by intent, body and guidance use mixed case and readable muted tones.

## Motion and sound
Canvas animation communicates movement, radar sweeps, projectiles, missile arcs and expanding blast radii. Phase alert overlays pause no gameplay. Reduced motion disables decorative radar, flash and shake. Audio is explicitly enabled by the user, generated with Web Audio, with optional native speech.

## Controls
Semantic buttons, native dialogs/selects/ranges, visible focus rings, keyboard speed/pause/audio/pan/zoom, clickable allied contact list, pointer capture for map panning.
