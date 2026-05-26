"""
Storage utilities — reads/writes files from the .uploads directory.
Same key convention as Next.js storage.ts:
  key = "userId/jobId/filename"  →  disk path = UPLOADS_DIR/userId_jobId_filename
"""
import os
import pathlib

UPLOADS_DIR = pathlib.Path(os.environ.get("UPLOADS_DIR", ".uploads"))


def key_to_path(key: str) -> pathlib.Path:
    """Convert a storage key to a local file path."""
    filename = key.replace("/", "_")
    return UPLOADS_DIR / filename


def read_input(input_key: str) -> bytes:
    path = key_to_path(input_key)
    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")
    return path.read_bytes()


def write_output(output_key: str, data: bytes) -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    path = key_to_path(output_key)
    path.write_bytes(data)


def build_output_key(user_id: str, job_id: str, filename: str) -> str:
    return f"{user_id}/{job_id}/{filename}"
