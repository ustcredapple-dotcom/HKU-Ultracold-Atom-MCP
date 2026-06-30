from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


REPO_ROOT = Path(__file__).resolve().parents[2]
BACKUP_ROOT = REPO_ROOT / "History" / "Tool_History" / "Lab_Wiring_Connector_Backups"
BACKUP_INDEX = BACKUP_ROOT / "backup_index.jsonl"
DEFAULT_PROJECT_ROOT = REPO_ROOT / "linker" / "Lab_Wiring_Connector" / "projects" / "User_Projects"
DEFAULT_PROJECT_INDEX = DEFAULT_PROJECT_ROOT / "project_index.jsonl"
ACTUAL_LAB_ROOT = REPO_ROOT / "linker" / "Lab_Wiring_Connector" / "projects" / "Actual_Lab_Wiring"
ACTUAL_LAB_CURRENT = ACTUAL_LAB_ROOT / "current"
ACTUAL_LAB_VERSIONS = ACTUAL_LAB_ROOT / "versions"
ACTUAL_LAB_INDEX = ACTUAL_LAB_ROOT / "version_index.jsonl"
ACTUAL_LAB_MANIFEST = ACTUAL_LAB_ROOT / "manifest.json"


def safe_name(value: str, fallback: str) -> str:
  cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]+', "_", value or "").strip(" ._-")
  return (cleaned or fallback)[:96]


def labwire_file_name(value: str) -> str:
  name = safe_name(Path(value or "lab_wiring.labwire.json").name, "lab_wiring.labwire.json")
  lowered = name.lower()
  if lowered.endswith(".labwire.json"):
    return name
  if lowered.endswith(".json"):
    return f"{name[:-5]}.labwire.json"
  return f"{name}.labwire.json"


def sha256_text(content: str) -> str:
  return hashlib.sha256(content.encode("utf-8")).hexdigest()


def read_json_body(handler: SimpleHTTPRequestHandler) -> dict:
  length = int(handler.headers.get("Content-Length", "0"))
  if length <= 0:
    raise ValueError("Empty request body")
  if length > 50 * 1024 * 1024:
    raise ValueError("Request is too large")
  return json.loads(handler.rfile.read(length).decode("utf-8"))


def normalize_text(content: str) -> str:
  return content.replace("\r\n", "\n").replace("\r", "\n").rstrip() + "\n"


def write_text_lf(path: Path, content: str) -> None:
  with path.open("w", encoding="utf-8", newline="\n") as output:
    output.write(content)


def read_actual_records() -> list[dict]:
  if not ACTUAL_LAB_INDEX.exists():
    return []
  records = []
  for line in ACTUAL_LAB_INDEX.read_text(encoding="utf-8").splitlines():
    if line.strip():
      records.append(json.loads(line))
  return records


def write_actual_manifest() -> None:
  ACTUAL_LAB_ROOT.mkdir(parents=True, exist_ok=True)
  records = read_actual_records()
  latest_by_file = {}
  for record in records:
    latest_by_file[record["fileName"]] = record
  current_files = []
  for path in sorted(ACTUAL_LAB_CURRENT.glob("*.labwire.json")):
    latest = latest_by_file.get(path.name, {})
    current_files.append({
      "fileName": path.name,
      "relativePath": str(path.relative_to(REPO_ROOT)),
      "latestVersionId": latest.get("versionId", ""),
      "contentSha256": sha256_text(path.read_text(encoding="utf-8")),
      "updatedAt": latest.get("timestamp", "")
    })
  manifest = {
    "kind": "hku.ultracold.actual_lab_wiring_manifest",
    "updatedAt": datetime.now().isoformat(timespec="seconds"),
    "currentFiles": current_files,
    "latestEntryHash": records[-1].get("entryHash", "") if records else "",
    "versionIndex": str(ACTUAL_LAB_INDEX.relative_to(REPO_ROOT))
  }
  write_text_lf(ACTUAL_LAB_MANIFEST, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


def append_actual_version(file_name: str, content: str, reason: str, note: str = "", source_version_id: str = "") -> dict:
  json.loads(content)
  file_name = labwire_file_name(file_name)
  now = datetime.now()
  version_id = f"{now:%Y%m%dT%H%M%S_%f}_{safe_name(file_name[:-13] if file_name.endswith('.labwire.json') else file_name, 'lab_wiring')}"
  version_dir = ACTUAL_LAB_VERSIONS / safe_name(file_name, "lab_wiring.labwire.json")
  version_dir.mkdir(parents=True, exist_ok=True)
  version_path = version_dir / f"{version_id}.labwire.json"
  normalized_content = normalize_text(content)
  write_text_lf(version_path, normalized_content)

  records = read_actual_records()
  record = {
    "timestamp": now.isoformat(timespec="seconds"),
    "versionId": version_id,
    "fileName": file_name,
    "reason": safe_name(reason or "update", "update"),
    "note": note,
    "sourceVersionId": source_version_id,
    "contentSha256": sha256_text(normalized_content),
    "relativePath": str(version_path.relative_to(REPO_ROOT)),
    "previousEntryHash": records[-1].get("entryHash", "") if records else ""
  }
  record_for_hash = dict(record)
  record["entryHash"] = sha256_text(json.dumps(record_for_hash, ensure_ascii=False, sort_keys=True))
  ACTUAL_LAB_ROOT.mkdir(parents=True, exist_ok=True)
  with ACTUAL_LAB_INDEX.open("a", encoding="utf-8", newline="\n") as index_file:
    index_file.write(json.dumps(record, ensure_ascii=False) + "\n")
  return record


def write_actual_current(file_name: str, content: str, reason: str, note: str = "", source_version_id: str = "") -> dict:
  file_name = labwire_file_name(file_name)
  record = append_actual_version(file_name, content, reason, note, source_version_id)
  ACTUAL_LAB_CURRENT.mkdir(parents=True, exist_ok=True)
  current_path = ACTUAL_LAB_CURRENT / file_name
  write_text_lf(current_path, normalize_text(content))
  write_actual_manifest()
  return {
    **record,
    "currentRelativePath": str(current_path.relative_to(REPO_ROOT)),
    "currentPath": str(current_path)
  }


def write_backup(original_name: str, reason: str, content: str) -> dict:
  reason = safe_name(reason or "backup", "backup")
  base_name = safe_name(Path(original_name or "lab_wiring.labwire.json").name, "lab_wiring.labwire.json")
  if base_name.lower().endswith(".json"):
    base_name = base_name[:-5]

  now = datetime.now()
  day_dir = BACKUP_ROOT / now.strftime("%Y-%m-%d")
  day_dir.mkdir(parents=True, exist_ok=True)
  backup_name = f"{now:%H%M%S_%f}_{base_name}_{reason}.labwire.json"
  backup_path = day_dir / backup_name
  write_text_lf(backup_path, normalize_text(content))

  BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
  index_entry = {
    "timestamp": now.isoformat(timespec="seconds"),
    "reason": reason,
    "originalFileName": original_name,
    "backupFileName": backup_name,
    "backupPath": str(backup_path),
    "relativePath": str(backup_path.relative_to(REPO_ROOT))
  }
  with BACKUP_INDEX.open("a", encoding="utf-8", newline="\n") as index_file:
    index_file.write(json.dumps(index_entry, ensure_ascii=False) + "\n")
  return index_entry


class LabWiringEditorHandler(SimpleHTTPRequestHandler):
  server_version = "LabWiringEditor/1.0"

  def end_headers(self) -> None:
    self.send_header("Cache-Control", "no-store")
    super().end_headers()

  def do_POST(self) -> None:
    path = unquote(urlparse(self.path).path).rstrip("/")
    if path == "/api/lab-wiring/backups":
      self.handle_backup()
      return
    if path == "/api/lab-wiring/projects/default":
      self.handle_default_project_save()
      return
    if path == "/api/lab-wiring/actual/update":
      self.handle_actual_update()
      return
    if path == "/api/lab-wiring/actual/rollback":
      self.handle_actual_rollback()
      return
    self.send_error(HTTPStatus.NOT_FOUND, "Unknown API endpoint")

  def do_GET(self) -> None:
    path = unquote(urlparse(self.path).path).rstrip("/")
    if path == "/api/lab-wiring/actual/list":
      self.handle_actual_list()
      return
    if path == "/api/lab-wiring/actual/current":
      self.handle_actual_current()
      return
    if path == "/api/lab-wiring/actual/versions":
      self.handle_actual_versions()
      return
    super().do_GET()

  def do_OPTIONS(self) -> None:
    self.send_response(HTTPStatus.NO_CONTENT)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Headers", "Content-Type")
    self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    self.end_headers()

  def handle_backup(self) -> None:
    try:
      payload = read_json_body(self)
      content = payload.get("content")
      if not isinstance(content, str) or not content.strip():
        raise ValueError("Backup content must be a non-empty string")

      original_name = str(payload.get("fileName") or "lab_wiring.labwire.json")
      index_entry = write_backup(original_name, str(payload.get("reason") or "backup"), content)

      self.send_json({
        "ok": True,
        "fileName": index_entry["backupFileName"],
        "path": index_entry["backupPath"],
        "relativePath": index_entry["relativePath"]
      })
    except Exception as exc:
      self.send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

  def handle_default_project_save(self) -> None:
    try:
      payload = read_json_body(self)
      content = payload.get("content")
      if not isinstance(content, str) or not content.strip():
        raise ValueError("Project content must be a non-empty string")

      json.loads(content)
      file_name = labwire_file_name(str(payload.get("fileName") or "lab_wiring.labwire.json"))
      DEFAULT_PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
      target_path = DEFAULT_PROJECT_ROOT / file_name

      backed_up_existing = None
      if target_path.exists():
        previous = target_path.read_text(encoding="utf-8")
        if previous != content:
          backed_up_existing = write_backup(file_name, "before-default-project-save", previous)

      write_text_lf(target_path, normalize_text(content))
      now = datetime.now().isoformat(timespec="seconds")
      index_entry = {
        "timestamp": now,
        "reason": safe_name(str(payload.get("reason") or "manual"), "manual"),
        "fileName": file_name,
        "path": str(target_path),
        "relativePath": str(target_path.relative_to(REPO_ROOT)),
        "backedUpExisting": backed_up_existing["relativePath"] if backed_up_existing else ""
      }
      with DEFAULT_PROJECT_INDEX.open("a", encoding="utf-8", newline="\n") as index_file:
        index_file.write(json.dumps(index_entry, ensure_ascii=False) + "\n")

      self.send_json({
        "ok": True,
        "fileName": file_name,
        "path": str(target_path),
        "relativePath": index_entry["relativePath"],
        "backedUpExisting": index_entry["backedUpExisting"]
      })
    except Exception as exc:
      self.send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

  def actual_query_file_name(self) -> str:
    query = parse_qs(urlparse(self.path).query)
    return labwire_file_name(query.get("fileName", [""])[0]) if query.get("fileName", [""])[0] else ""

  def handle_actual_list(self) -> None:
    records = read_actual_records()
    versions_by_file = {}
    for record in records:
      versions_by_file.setdefault(record["fileName"], []).append(record)
    files = []
    for path in sorted(ACTUAL_LAB_CURRENT.glob("*.labwire.json")) if ACTUAL_LAB_CURRENT.exists() else []:
      versions = versions_by_file.get(path.name, [])
      files.append({
        "fileName": path.name,
        "relativePath": str(path.relative_to(REPO_ROOT)),
        "contentSha256": sha256_text(path.read_text(encoding="utf-8")),
        "latestVersionId": versions[-1]["versionId"] if versions else "",
        "versionCount": len(versions)
      })
    self.send_json({
      "ok": True,
      "root": str(ACTUAL_LAB_ROOT),
      "relativeRoot": str(ACTUAL_LAB_ROOT.relative_to(REPO_ROOT)),
      "files": files,
      "versions": records
    })

  def handle_actual_current(self) -> None:
    file_name = self.actual_query_file_name()
    if not file_name:
      candidates = sorted(ACTUAL_LAB_CURRENT.glob("*.labwire.json")) if ACTUAL_LAB_CURRENT.exists() else []
      if not candidates:
        self.send_json({"ok": False, "error": "No actual lab wiring files exist yet."}, status=HTTPStatus.NOT_FOUND)
        return
      current_path = candidates[0]
      file_name = current_path.name
    else:
      current_path = ACTUAL_LAB_CURRENT / file_name
    if not current_path.exists():
      self.send_json({"ok": False, "error": f"Actual lab wiring file not found: {file_name}"}, status=HTTPStatus.NOT_FOUND)
      return
    content = current_path.read_text(encoding="utf-8")
    records = [record for record in read_actual_records() if record["fileName"] == file_name]
    self.send_json({
      "ok": True,
      "fileName": file_name,
      "content": content,
      "relativePath": str(current_path.relative_to(REPO_ROOT)),
      "latestVersionId": records[-1]["versionId"] if records else "",
      "versions": records
    })

  def handle_actual_versions(self) -> None:
    file_name = self.actual_query_file_name()
    records = read_actual_records()
    if file_name:
      records = [record for record in records if record["fileName"] == file_name]
    self.send_json({"ok": True, "fileName": file_name, "versions": records})

  def handle_actual_update(self) -> None:
    try:
      payload = read_json_body(self)
      content = payload.get("content")
      if not isinstance(content, str) or not content.strip():
        raise ValueError("Actual lab wiring content must be a non-empty string")
      file_name = labwire_file_name(str(payload.get("fileName") or "ZZLab.labwire.json"))
      record = write_actual_current(
        file_name,
        content,
        str(payload.get("reason") or "editor-update"),
        str(payload.get("note") or "")
      )
      self.send_json({
        "ok": True,
        "fileName": file_name,
        "version": record,
        "currentRelativePath": record["currentRelativePath"]
      })
    except Exception as exc:
      self.send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

  def handle_actual_rollback(self) -> None:
    try:
      payload = read_json_body(self)
      file_name = labwire_file_name(str(payload.get("fileName") or "ZZLab.labwire.json"))
      version_id = str(payload.get("versionId") or "")
      records = [record for record in read_actual_records() if record["fileName"] == file_name]
      source = next((record for record in records if record["versionId"] == version_id), None)
      if not source:
        raise ValueError(f"Version not found: {version_id}")
      version_path = REPO_ROOT / source["relativePath"]
      content = version_path.read_text(encoding="utf-8")
      record = write_actual_current(
        file_name,
        content,
        "rollback",
        str(payload.get("note") or f"Rollback to {version_id}"),
        source_version_id=version_id
      )
      self.send_json({
        "ok": True,
        "fileName": file_name,
        "content": content,
        "version": record,
        "rolledBackTo": version_id,
        "currentRelativePath": record["currentRelativePath"]
      })
    except Exception as exc:
      self.send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

  def send_json(self, data: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
    body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)


def main() -> None:
  parser = argparse.ArgumentParser(description="Local server for the Lab Wiring Editor.")
  parser.add_argument("--port", type=int, default=8765)
  parser.add_argument("--host", default="127.0.0.1")
  args = parser.parse_args()

  handler = partial(LabWiringEditorHandler, directory=str(REPO_ROOT))
  server = ThreadingHTTPServer((args.host, args.port), handler)
  print(f"Lab Wiring Editor server: http://{args.host}:{args.port}/Speaker/Lab_Wiring_Editor/web/index.html")
  print(f"Backups: {BACKUP_ROOT}")
  print(f"Default projects: {DEFAULT_PROJECT_ROOT}")
  print(f"Actual lab wiring: {ACTUAL_LAB_ROOT}")
  server.serve_forever()


if __name__ == "__main__":
  main()
