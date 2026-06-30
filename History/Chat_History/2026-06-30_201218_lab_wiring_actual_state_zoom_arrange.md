# Chat History - Lab Wiring Actual State, Zoom, And Arrange

Date: 2026-06-30

## User Requests

The user continued work on the Lab Wiring Editor and asked for:

1. Mouse wheel zoom on the canvas.
2. A fix for the auto-arrange feature placing device blocks on top of connection lines.
3. A dedicated folder for real laboratory wiring files, separate from drafts.
4. Editor functions to read the current real lab state and update the real lab state.
5. A protected version library inside that real-lab folder for every update made through this channel.
6. Version rollback support in the editor.
7. The user-saved `ZZLab.labwire.json` project should become the first real-lab wiring version.

## Implemented Decisions

- Draft project files remain in `linker/Lab_Wiring_Connector/projects/User_Projects`.
- The trusted physical lab wiring record is now in `linker/Lab_Wiring_Connector/projects/Actual_Lab_Wiring`.
- `Actual_Lab_Wiring/current` stores current active lab wiring files.
- `Actual_Lab_Wiring/versions` stores immutable version snapshots.
- `Actual_Lab_Wiring/version_index.jsonl` stores an append-only hash-chain style index.
- `Actual_Lab_Wiring/manifest.json` summarizes the current real-lab files.
- The editor toolbar now includes `读取现状 / Read Lab`, `更新现状 / Update Lab`, a version dropdown, and `回滚 / Rollback`.
- The first real-lab version was imported from `User_Projects/ZZLab.labwire.json`.
- Mouse wheel zoom now zooms around the cursor position.
- Connection routing now steps sideways from bottom-facing ports when needed so arranged diagrams avoid placing lines under unrelated device blocks.

## Notes For Future AI

Do not manually overwrite `Actual_Lab_Wiring/current` when changing the real laboratory wiring state. Use the editor/server actual-lab API so the version index, content hashes, and manifest stay consistent.
