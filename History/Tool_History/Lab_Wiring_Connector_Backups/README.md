# Lab Wiring Connector Backups

This folder stores automatic backups created by the Lab Wiring Editor.

Path:

```text
History/Tool_History/Lab_Wiring_Connector_Backups
```

Backup behavior:

- Opening a `.labwire.json` project writes an `opened` backup first.
- Before a normal save writes the current project file, the previous saved version is backed up as `before-manual-save`.
- Before an automatic save writes the current project file, the previous saved version is backed up as `before-autosave`.
- If the browser cannot write directly to a project file, auto-save writes an `autosave-draft` backup instead.
- Before JSON code is applied back to the graph, the previous graph state is backed up as `before-code-apply`.

Backups are grouped by date. The file `backup_index.jsonl` records the timestamp, reason, original file name, and backup path for each backup.
