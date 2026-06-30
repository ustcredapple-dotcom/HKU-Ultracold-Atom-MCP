# Lab Wiring Editor

This is the interactive web editor for laboratory wiring projects.

It belongs in `Speaker` because it is the human-facing interface. The actual project format and validation engine live in:

```text
linker/Lab_Wiring_Connector
```

## Open the Editor

Double-click:

```text
launch_lab_wiring_editor.bat
```

It starts a local web server and opens:

```text
http://127.0.0.1:8765/Speaker/Lab_Wiring_Editor/web/index.html
```

The local server is used so the browser can read linker modules and use modern file save features.

## Project Files

Recommended extension:

```text
.labwire.json
```

Use:

- `Open`: load an existing project file.
- `Save`: write back to the currently opened file when the browser supports File System Access API.
- `Save As`: choose a new project file.

If the browser does not support direct save, the editor falls back to downloading the JSON file.
