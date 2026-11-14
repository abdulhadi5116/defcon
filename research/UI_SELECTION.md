# Unit-button selection regression

`updateUI()` runs every .2 seconds. Deployment buttons were assigned via `innerHTML` on every refresh; inspector and contact buttons were also replaced when countdown values changed. Native pointerdown and pointerup could consequently land on different DOM nodes, dropping the click and restarting hover state. The failure reproduced twice with a 450 ms press even while the simulation was paused: `buttonRetainedDuringPointerPress:false`, empty fleet draft.

`public/ui.js` now updates those interactive regions in place, retaining keyed controls by unit/contact/mode/type ID. Unchanged markup is skipped. Only changed text/attributes and actual additions/removals are applied. Combat timing, inventory validation and event delegation remain in the existing code.

Regression command: `node qa/selection-browser.mjs` against `npm start`. It asserts that the first deployment click survives live refresh, repeated clicks fill the draft immediately, the focused mode button remains connected through a 20x preparation countdown, and contact selection works while another unit changes state. The same reproduction is green after the fix. The diagnostic DOM handles are confined to the browser test.
