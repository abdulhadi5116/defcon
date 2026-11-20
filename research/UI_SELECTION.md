# Unit-button selection regression

`updateUI()` runs every .2 seconds. Deployment buttons were assigned via `innerHTML` on every refresh; inspector and contact buttons were also replaced when countdown values changed. Native pointerdown and pointerup could consequently land on different DOM nodes, dropping the click and restarting hover state. The failure reproduced twice with a 450 ms press even while the simulation was paused: `buttonRetainedDuringPointerPress:false`, empty fleet draft.

`public/ui.js` now updates those interactive regions in place, retaining keyed controls by unit/contact/mode/type ID. Unchanged markup is skipped. Only changed text/attributes and actual additions/removals are applied. Combat timing, inventory validation and event delegation remain in the existing code.

Regression command: `node qa/selection-browser.mjs` against `npm start`. It asserts that the first deployment click survives live refresh, repeated clicks fill the draft immediately, the focused mode button remains connected through a 20x preparation countdown, and contact selection works while another unit changes state. The same reproduction is green after the fix. The diagnostic DOM handles are confined to the browser test.

## 2026-11-20 selection, aircraft modes, and fleet impacts

Selecting a unit leaves the map unobstructed; Info opens explicitly. Right-click or touch-hold opens the selected aircraft's compact mode menu. Dragging cancels hold. Fighter patrol/Anti Submarine and bomber conventional/nuclear modes are configured on the aircraft, not the host.

Discovered buildings remain displayed and targetable after sensor coverage leaves, including after save/load. Actual radar visibility remains separate from remembered building locations.

Fleet layout is visual only. Projectile paths interpolate source/target visual offsets; impact flashes and destruction markers use the ship icon's displayed position, retaining its last position after death. Picking uses the same icon layout. Combat ranges and simulation coordinates are unchanged.
