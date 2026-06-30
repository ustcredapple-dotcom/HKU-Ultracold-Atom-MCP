from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
BACKUP_ROOT = REPO_ROOT / "History" / "Tool_History" / "Lab_Wiring_Connector_Backups"
BACKUP_INDEX = BACKUP_ROOT / "backup_index.jsonl"


def safe_name(value: str, fallback: str) -> str:
  cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", value or "").strip("._-")
  return (cleaned or fallback)[:96]


class LabWiringEditorHandler(SimpleHTTPRequestHandler):
  server_version = "LabWiringEditor/1.0"

  def end_headers(self) -> None:
    self.send_header("Cache-Control", "no-store")
    super().end_headers()

  def do_POST(self) -> None:
    if self.path.rstrip("/") != "/api/lab-wiring/backups":
      self.send_error(HTTPStatus.NOT_FOUND, "Unknown API endpoint")
      return
    self.handle_backup()

  def do_OPTIONS(self) -> None:
    self.send_response(HTTPStatus.NO_CONTENT)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Headers", "Content-Type")
    self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    self.end_headers()

  def handle_backup(self) -> None:
    try:
      length = int(self.headers.get("Content-Length", "0"))
      if length <= 0:
        raise ValueError("Empty request body")
      if length > 50 * 1024 * 1024:
        raise ValueError("Backup request is too large")

      payload = json.loads(self.rfile.read(length).decode("utf-8"))
      content = payload.get("content")
      if not isinstance(content, str) or not content.strip():
        raise ValueError("Backup content must be a non-empty string")

      original_name = str(payload.get("fileName") or "lab_wiring.labwire.json")
      reason = safe_name(str(payload.get("reason") or "backup"), "backup")
      base_name = safe_name(Path(original_name).name, "lab_wiring.labwire.json")
      if base_name.lower().endswith(".json"):
        base_name = base_name[:-5]

      now = datetime.now()
      day_dir = BACKUP_ROOT / now.strftime("%Y-%m-%d")
      day_dir.mkdir(parents=True, exist_ok=True)
      backup_name = f"{now:%H%M%S_%f}_{base_name}_{reason}.labwire.json"
      backup_path = day_dir / backup_name
      backup_path.write_text(content.rstrip() + "\n", encoding="utf-8")

      BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
      index_entry = {
        "timestamp": now.isoformat(timespec="seconds"),
        "reason": reason,
        "originalFileName": original_name,
        "backupFileName": backup_name,
        "backupPath": str(backup_path),
        "relativePath": str(backup_path.relative_to(REPO_ROOT))
      }
      with BACKUP_INDEX.open("a", encoding="utf-8") as index_file:
        index_file.write(json.dumps(index_entry, ensure_ascii=False) + "\n")

      self.send_json({
        "ok": True,
        "fileName": backup_name,
        "path": str(backup_path),
        "relativePath": index_entry["relativePath"]
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
  server.serve_forever()


if __name__ == "__main__":
  main()
