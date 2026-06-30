# Construction Log - Lab Wiring Default Save Folder And Direct Line Editing

Time: 2026-06-30 17:56:21 +08:00

## Files Changed

- `linker/Lab_Wiring_Connector/projects/User_Projects/README.md`
  - Added the default user project folder for current `.labwire.json` project files.
- `Speaker/Lab_Wiring_Editor/server.py`
  - Added `DEFAULT_PROJECT_ROOT`.
  - Added `/api/lab-wiring/projects/default` for default project saves.
  - Existing target files are backed up before overwrite.
  - Added robust URL path parsing with `urlparse`.
- `Speaker/Lab_Wiring_Editor/web/app.js`
  - Added default-save endpoint integration.
  - `Save` now writes unsaved projects to the default folder when the local server is available.
  - `Save As` still uses the browser picker/download behavior.
  - Added selected-connection quick action state.
  - Clicking a connection can now show a canvas quick-action panel for line type and delete.
- `Speaker/Lab_Wiring_Editor/web/index.html`
  - Added `connectionQuickActions` panel container.
- `Speaker/Lab_Wiring_Editor/web/styles.css`
  - Added quick-action panel styling.
  - Fixed line hit testing by letting `deviceLayer` pass through empty-area pointer events and by making SVG connection hit paths receive pointer events.
- `Speaker/Lab_Wiring_Editor/README.md`
  - Documented current default save behavior and direct connection editing.
- `Teacher/Subprojects/Lab_Wiring_Connector.md`
  - Documented the default project folder and direct line-editing behavior.
- `linker/Lab_Wiring_Connector/README.md`
  - Documented the user project folder.

## Verification

Commands:

```text
node --check Speaker/Lab_Wiring_Editor/web/app.js
python -m py_compile Speaker/Lab_Wiring_Editor/server.py
```

Runtime:

- Restarted the local editor server on `127.0.0.1:8765`.
- Verified `/api/lab-wiring/projects/default` with a temporary project file.
- Removed the temporary default-save verification project and index afterward.
- Opened the editor in the browser.
- Loaded the example wiring project.
- Confirmed a connection line is now hit-testable.
- Confirmed clicking the line selects the connection, shows the right-side inspector delete control, and displays the canvas quick-action panel with line type and delete controls.
- Browser console reported no errors during this verification.

## Important Notes

- Some `ZZLab` auto-save draft backups already existed in `History/Tool_History/Lab_Wiring_Connector_Backups`; these appear to be runtime user/project backup records and were not deleted or modified.
- Temporary API smoke-test artifacts created during verification were removed.
- Main implementation commit: `d873db6` (`Add default wiring project saves and line quick edit`).
- Pushed to `origin/main` on GitHub:

```text
https://github.com/ustcredapple-dotcom/HKU-Ultracold-Atom-MCP
```
