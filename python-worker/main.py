"""
FileAI Python Worker
--------------------
Polls Next.js for pending jobs, processes files, writes output back to shared
storage, then notifies Next.js via API callback.

Usage:
  uvicorn main:app --host 0.0.0.0 --port 8000
"""
# Load .env FIRST so env vars are available when modules read them at import time
import asyncio
import logging
import os
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from processors.pdf_processor import PDF_PROCESSORS
from processors.image_processor import IMAGE_PROCESSORS
from utils.api import claim_job, mark_complete, mark_failed
from utils.storage import read_input, write_output, build_output_key

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

try:
    from processors.audio_processor import AUDIO_PROCESSORS
except Exception as _audio_err:
    log.warning(f"Audio processor unavailable: {_audio_err}")
    AUDIO_PROCESSORS = {}

try:
    from processors.media_processor import MEDIA_PROCESSORS
except Exception as _media_err:
    log.warning(f"Media processor unavailable: {_media_err}")
    MEDIA_PROCESSORS = {}

try:
    from processors.document_processor import DOCUMENT_PROCESSORS
except Exception as _doc_err:
    log.warning(f"Document processor unavailable: {_doc_err}")
    DOCUMENT_PROCESSORS = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(polling_loop())
    yield

app = FastAPI(title="FileAI Worker", version="1.0.0", lifespan=lifespan)

ALL_PROCESSORS = {
    **PDF_PROCESSORS,
    **IMAGE_PROCESSORS,
    **AUDIO_PROCESSORS,
    **MEDIA_PROCESSORS,
    **DOCUMENT_PROCESSORS,
}

POLL_INTERVAL = float(os.environ.get("POLL_INTERVAL_SECONDS", "2"))


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "tools": list(ALL_PROCESSORS.keys())}


# ─── Job processing ───────────────────────────────────────────────────────────

async def process_one_job() -> bool:
    """Claim and process one job. Returns True if a job was processed."""
    job = await claim_job()
    if not job:
        return False

    job_id = job["jobId"]
    job_type = job["type"]
    input_key = job["inputKey"]
    metadata = job.get("metadata") or {}
    user_id = job["userId"]

    log.info(f"Processing job {job_id} — type={job_type}")

    processor = ALL_PROCESSORS.get(job_type)
    if not processor:
        msg = f"No processor found for tool '{job_type}'"
        log.warning(msg)
        await mark_failed(job_id, msg)
        return True

    try:
        input_bytes = read_input(input_key)
        output_bytes, output_filename = processor(input_bytes, metadata)
        output_key = build_output_key(user_id, job_id, output_filename)
        write_output(output_key, output_bytes)
        await mark_complete(job_id, output_key, len(output_bytes))
        log.info(f"Job {job_id} completed — output={output_filename} ({len(output_bytes):,} bytes)")
    except Exception as exc:
        log.error(f"Job {job_id} failed: {exc}", exc_info=True)
        await mark_failed(job_id, str(exc))

    return True


# ─── Polling loop ─────────────────────────────────────────────────────────────

async def polling_loop():
    log.info(f"Worker started — polling every {POLL_INTERVAL}s")
    while True:
        try:
            had_work = await process_one_job()
            # If we processed a job, immediately check for more
            # If queue was empty, wait before checking again
            if not had_work:
                await asyncio.sleep(POLL_INTERVAL)
        except Exception as exc:
            log.error(f"Polling error: {exc}", exc_info=True)
            await asyncio.sleep(POLL_INTERVAL)



# ─── Run directly ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
