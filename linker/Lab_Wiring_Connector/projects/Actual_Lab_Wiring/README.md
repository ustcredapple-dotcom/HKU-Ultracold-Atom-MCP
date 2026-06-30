# Actual Lab Wiring

This folder stores the wiring files that are treated as the current physical lab state.

## Directory Contract

- `current/` contains the active `.labwire.json` file(s) that describe the lab's current wiring.
- `versions/` contains immutable snapshots created when the editor updates or rolls back the actual lab state.
- `version_index.jsonl` is an append-only version library. Each line records the version id, source file, reason, content hash, previous entry hash, and snapshot path.
- `manifest.json` summarizes the current files and latest version ids for quick AI inspection.

## Update Rule

Do not manually overwrite files in `current/` when the goal is to change the actual lab state. Use the Lab Wiring Editor buttons:

- `Read Lab` / `读取现状`: load the current actual lab wiring.
- `Update Lab` / `更新现状`: publish the current project as a new actual lab version.
- `Rollback` / `回滚`: restore a selected version and record that rollback as a new version.

Manual edits can break the version chain and make it harder for another AI to audit how the real lab wiring changed.

## Relationship To Drafts

Draft and working project files live in `../User_Projects/`. This folder is narrower: it is the trusted record of the real experimental wiring topology.
