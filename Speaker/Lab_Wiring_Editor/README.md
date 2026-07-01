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

The local server is used so the browser can read linker modules, use modern file save features, and write backup files into `History/Tool_History`.

## Language

The editor supports Chinese and English UI modes. Use the `中文 / EN` switch in the top bar.

The language choice affects:

- UI labels and buttons.
- Dialog text and status messages.
- Default names for new devices and ports.
- Validation headers and the AI summary.

Existing project data is not translated automatically, because device names and port names are laboratory records.

## Port Types

Each port can carry a `portType`, such as:

- TTL
- DAC
- ADC
- RF
- Analog
- Digital
- Laser
- Camera image / photo
- Optical
- Ethernet
- USB
- Power
- Custom

Use the device inspector to edit a port's type. Use `Add Type` to add a project-specific custom port type. Custom port types are saved inside the `.labwire.json` project file.

Port chips are color-coded by `portType`. Empty port circles mean the port is unused; solid port circles mean the port already appears in at least one connection.

## AI View And Code View

The lower-right panel has two modes:

- `Summary`: a bilingual, AI-readable wiring summary.
- `Code`: the editable `.labwire.json` project code.

In `Code` mode, edit the JSON and click `Apply` to regenerate the graph from the code. The editor validates and normalizes the project through the linker engine before redrawing.

## Auto Save And Backups

Auto save is on by default.

- When a project is opened, the opened version is backed up first.
- Before a normal `Save` or auto-save writes a newer version, the previous version is backed up.
- Every minute, changed projects are auto-saved. If the browser cannot write directly to the current file, a draft backup is written instead.

Backups are written by the local editor server to:

```text
History/Tool_History/Lab_Wiring_Connector_Backups
```

The backup folder is organized by date and also maintains `backup_index.jsonl`.

## Layout

Use `Arrange` in the top toolbar to automatically organize devices. The editor places connected devices into left-to-right layers and gives large devices more vertical room.

Connections are drawn as clean rounded orthogonal lines with a subtle white backing stroke for readability. When a device sits under a bottom-facing port, the router steps sideways before entering the main line path so arranged diagrams do not put a block directly on top of a wire.

Connection endpoints are anchored to the actual visible port circle, not just to the device block. The long route stays outside the device card, while a short same-color terminal stub is drawn above the card from the port circle to the outside route. This is important for dense instruments such as ARTIQ where adjacent ports can be easy to confuse.

Use the mouse wheel over the canvas to zoom around the cursor position. The `-` and `+` buttons still provide fixed-step zoom controls.

## Project Files

Recommended extension:

```text
.labwire.json
```

Use:

- `Open`: load an existing project file.
- `Save`: write back to the currently opened file when the browser supports File System Access API. If the project has no current file handle, it is saved to the default project folder.
- `Save As`: choose a new project file.

If the local editor server and the browser file save APIs are both unavailable, the editor falls back to downloading the JSON file.

## Default Save Folder

The default project folder is:

```text
linker/Lab_Wiring_Connector/projects/User_Projects
```

This folder is the best default location because `.labwire.json` files are AI-readable lab topology knowledge owned by the linker engine. `Speaker` is only the web editor, and `History/Tool_History` is for backups and older versions.

Before this default-save feature, the editor did not have a fixed default folder. The location was controlled by the browser: either the file picker location, the current browser file handle, or the browser downloads folder.

## Actual Lab Wiring Folder

The trusted record of the physical lab wiring is stored separately from drafts:

```text
linker/Lab_Wiring_Connector/projects/Actual_Lab_Wiring
```

Use the top toolbar controls:

- `Read Lab` / `读取现状`: load the current actual lab wiring file from `Actual_Lab_Wiring/current`.
- `Update Lab` / `更新现状`: publish the current editor project into the actual lab folder. This writes the current file and appends an immutable version snapshot.
- Version dropdown + `Rollback` / `回滚`: restore a selected version. The rollback itself is also recorded as a new version.

The version library is append-only:

```text
linker/Lab_Wiring_Connector/projects/Actual_Lab_Wiring/version_index.jsonl
linker/Lab_Wiring_Connector/projects/Actual_Lab_Wiring/versions
```

`ZZLab.labwire.json` was initialized as the first actual lab wiring version from the user-saved project in `User_Projects`.

## Connection Editing

Click an existing line to select it. The right inspector lets you edit its name, label, line type, signal type, notes, or delete it.

After selection, a small quick-action panel also appears near the clicked line so you can directly change the line type or delete the connection from the canvas.

Connections are displayed as undirected physical links. The project JSON still stores two endpoint fields named `from` and `to` for compatibility, but the editor labels them as Port A and Port B and summaries use `--` instead of an arrow.
