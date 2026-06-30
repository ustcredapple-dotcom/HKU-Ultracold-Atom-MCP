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
- Optical
- Ethernet
- USB
- Power
- Custom

Use the device inspector to edit a port's type. Use `Add Type` to add a project-specific custom port type. Custom port types are saved inside the `.labwire.json` project file.

## Layout

Use `Arrange` in the top toolbar to automatically organize devices. The editor places connected devices into left-to-right layers and gives large devices more vertical room.

Connections are drawn as clean rounded orthogonal lines with a subtle white backing stroke for readability.

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
