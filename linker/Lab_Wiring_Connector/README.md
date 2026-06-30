# Lab Wiring Connector

`Lab_Wiring_Connector` is the linker engine for laboratory wiring knowledge.

It defines an AI-readable project file format and a small JavaScript engine for:

- creating device blocks,
- defining named ports,
- connecting ports with typed cables,
- validating project files,
- summarizing wiring for AI consumption.

The interactive editor lives in:

```text
Speaker/Lab_Wiring_Editor
```

The editor calls this linker engine and reads/writes `.labwire.json` project files.

User-created projects are saved by default in:

```text
linker/Lab_Wiring_Connector/projects/User_Projects
```

The trusted record of the real laboratory wiring is stored in:

```text
linker/Lab_Wiring_Connector/projects/Actual_Lab_Wiring
```

`Actual_Lab_Wiring/current` contains the current physical lab wiring file(s). `Actual_Lab_Wiring/versions` and `version_index.jsonl` form an append-only version library for updates and rollbacks made through the editor.

## Project File

Recommended extension:

```text
.labwire.json
```

The format is plain JSON. Devices, ports, and connections are explicit and stable so another AI can read the file without interpreting the drawing.

Core sections:

- `metadata`: title, description, author, timestamps.
- `devices`: physical instruments or optical/electrical components.
- `portTypes`: available port categories, including built-in and project-specific custom types.
- `ports`: named interfaces on each device, with direction, port type, and optional physical details.
- `connections`: wires, fibers, triggers, RF cables, BNC, SMA, TTL, optical paths, etc.
- `canvas`: layout information for the human editor. AI may ignore this if only reasoning about wiring.

Built-in port types include TTL, DAC, ADC, RF, Analog, Digital, Laser, Camera image/photo, Optical, Ethernet, USB, Power, and Custom. Users may add custom types, which are stored in the project file.

## Actual Lab State

`Speaker/Lab_Wiring_Editor` exposes three actual-lab operations backed by the local server:

- Read the current actual lab wiring state.
- Update the actual lab wiring state from the current project.
- Roll back to a selected historical version while recording the rollback as a new version.

The first actual-lab version is `ZZLab.labwire.json`, imported from `projects/User_Projects/ZZLab.labwire.json`.

## Safety Note

This linker describes wiring. It does not control hardware. Any future tool that turns these project files into actions must pass through `Safer` and explicit user confirmation.
