# Chat History - Lab Wiring Default Save Folder And Direct Line Editing

Time: 2026-06-30 17:56:21 +08:00

## User Request

The user asked:

1. Can Codex organize a folder and provide a default save location for lab wiring project files? Where is the best place according to the architecture, and where did the editor save by default before this change?
2. Can the user click an existing connected line and directly adjust the line type or delete the line?

## Answer And Design

Default save location chosen:

```text
linker/Lab_Wiring_Connector/projects/User_Projects
```

Reason:

- `.labwire.json` files are AI-readable laboratory topology knowledge.
- The linker engine owns this project format.
- Speaker is the human-facing editor and should not own the project data.
- History/Tool_History should store backups and old versions, not current working project files.

Before this change, there was no fixed default project folder. Saving depended on browser behavior:

- Current browser file handle if the file was opened through File System Access API.
- Browser Save As picker location.
- Browser downloads folder as fallback.

For line editing, the existing architecture already had connection selection and a right-side inspector, but line clicks were not reliable because the device layer covered the SVG line layer and the transparent SVG hit path did not receive pointer events consistently. This turn made line clicking reliable and added a direct canvas quick-action panel.
