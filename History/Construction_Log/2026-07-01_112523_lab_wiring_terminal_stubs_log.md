# Construction Log - Lab Wiring Terminal Stubs

Date: 2026-07-01

## Scope

- Added an over-device `terminalLayer` SVG to the Lab Wiring Editor.
- Moved long connection route endpoints to just outside device cards.
- Drew short same-color terminal stubs from actual port-dot centers to the outside route endpoints.
- Updated Speaker and Teacher documentation.

## Files Changed

- `Speaker/Lab_Wiring_Editor/web/app.js`
- `Speaker/Lab_Wiring_Editor/web/index.html`
- `Speaker/Lab_Wiring_Editor/web/styles.css`
- `Speaker/Lab_Wiring_Editor/README.md`
- `Teacher/Subprojects/Lab_Wiring_Connector.md`

## Verification

- Ran `node --check` on `Speaker/Lab_Wiring_Editor/web/app.js`.
- Browser-loaded the actual lab wiring file.
- Verified the red RF main path has both endpoints outside all device cards.
- Verified two red terminal stubs are rendered: one from `Moku_Go_2` and one from `Artiq.DDS_ch0`.
- Verified the terminal layer is after the device layer in DOM order and has no pointer events.

## Pending Commit

Main commit: `0fcd473` (`Show lab wiring terminal stubs above devices`)

Push status: pushed to `main` on `https://github.com/ustcredapple-dotcom/HKU-Ultracold-Atom-MCP.git`.
