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

## Project File

Recommended extension:

```text
.labwire.json
```

The format is plain JSON. Devices, ports, and connections are explicit and stable so another AI can read the file without interpreting the drawing.

Core sections:

- `metadata`: title, description, author, timestamps.
- `devices`: physical instruments or optical/electrical components.
- `ports`: named interfaces on each device, with direction and optional physical details.
- `connections`: wires, fibers, triggers, RF cables, BNC, SMA, TTL, optical paths, etc.
- `canvas`: layout information for the human editor. AI may ignore this if only reasoning about wiring.

## Safety Note

This linker describes wiring. It does not control hardware. Any future tool that turns these project files into actions must pass through `Safer` and explicit user confirmation.
