# User Lab Wiring Projects

This is the default save folder for user-created `.labwire.json` laboratory wiring projects.

Path:

```text
linker/Lab_Wiring_Connector/projects/User_Projects
```

Reason:

- The files describe real laboratory topology.
- The linker engine owns this AI-readable project format.
- Speaker is only the human-facing editor.
- History/Tool_History stores backups and previous versions, not the current working project files.

When the Lab Wiring Editor is opened through `Speaker/Lab_Wiring_Editor/launch_lab_wiring_editor.bat`, pressing `Save` on a project without a browser file handle writes the current `.labwire.json` here. `Save As` still lets the user choose any external path through the browser.

The editor server may create `project_index.jsonl` in this folder to record default-save events.
