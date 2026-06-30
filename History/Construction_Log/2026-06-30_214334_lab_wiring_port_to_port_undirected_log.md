# Construction Log - Lab Wiring Port-To-Port Undirected Connections

Date: 2026-06-30

## Scope

- Changed connection endpoint rendering from estimated device-edge positions to actual visible port-dot centers.
- Reordered rendering so devices are drawn before connections.
- Updated drag handling so connection paths recompute after the dragged device DOM position moves.
- Changed connection labels from directional `From` / `To` to neutral Port A / Port B wording.
- Changed AI summaries from `->` to `--`.
- Updated Speaker, linker, and Teacher documentation.

## Files Changed

- `Speaker/Lab_Wiring_Editor/web/app.js`
- `linker/Lab_Wiring_Connector/src/wiring_engine.js`
- `Speaker/Lab_Wiring_Editor/README.md`
- `linker/Lab_Wiring_Connector/README.md`
- `Teacher/Subprojects/Lab_Wiring_Connector.md`

## Verification

- Ran `node --check` on `Speaker/Lab_Wiring_Editor/web/app.js`.
- Ran `node --check` on `linker/Lab_Wiring_Connector/src/wiring_engine.js`.
- Browser-loaded the actual lab wiring file.
- Verified the RF path from `Moku_Go_2` to `Artiq.DDS_ch0` ended at the visible `DDS_ch0` port-dot center, with measured endpoint distance about `0.00035` canvas units.
- Verified AI summary no longer contains `->` and uses `--` for connections.

## Pending Commit

Commit hash and push status will be appended after the final git push.
