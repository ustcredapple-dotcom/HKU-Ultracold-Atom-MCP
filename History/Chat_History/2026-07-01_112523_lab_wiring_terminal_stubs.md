# Chat History - Lab Wiring Terminal Stubs

Date: 2026-07-01

## User Request

The user pointed out that the red RF connection was still visually covered by device cards. Even after anchoring the mathematical endpoint to the port circle, the line segment from the port circle to the card edge was hidden because the SVG connection layer sits below the device layer.

## Implemented Decision

- The long connection route now starts and ends just outside the device card.
- The route still uses the real visible port-dot center to determine the correct channel row/height.
- A new `terminalLayer` SVG sits above the device layer and draws short same-color terminal stubs from the actual port-dot center to the outside route point.
- The terminal layer has `pointer-events: none`, so it does not interfere with clicking ports or devices.

## Result

The user should now see the red RF connection visibly touch the correct port via a short red terminal stub, while the long red route no longer disappears under the card body.
