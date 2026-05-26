"""
HTTP helpers for talking to the Next.js API.
All write operations (mark_complete / mark_failed) retry with exponential backoff
so a transient network blip doesn't orphan a successfully processed job.
"""
import asyncio
import logging
import os

import httpx

log = logging.getLogger(__name__)

MAX_RETRIES = 4
BASE_BACKOFF_S = 1.0  # doubles each attempt: 1, 2, 4, 8 seconds


def _base_url() -> str:
    return os.environ.get("NEXT_API_URL", "http://localhost:3000")


def _headers() -> dict:
    return {"x-worker-secret": os.environ.get("WORKER_API_SECRET", "")}


async def claim_job() -> dict | None:
    """Ask Next.js for the next pending job. Returns None if queue is empty."""
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(
            f"{_base_url()}/api/internal/jobs/claim",
            headers=_headers(),
        )
        if res.status_code == 204:
            return None
        res.raise_for_status()
        return res.json()


async def _patch_with_retry(url: str, payload: dict, operation: str) -> None:
    """PATCH with exponential backoff. Raises after MAX_RETRIES failures."""
    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                res = await client.patch(url, headers=_headers(), json=payload)
                if res.status_code == 409:
                    # Job already in terminal state — idempotent, not an error
                    log.warning(f"{operation} returned 409 (already terminal) — skipping")
                    return
                res.raise_for_status()
                return
        except Exception as exc:
            last_exc = exc
            if attempt < MAX_RETRIES:
                wait = BASE_BACKOFF_S * (2 ** (attempt - 1))
                log.warning(f"{operation} attempt {attempt}/{MAX_RETRIES} failed: {exc} — retrying in {wait:.0f}s")
                await asyncio.sleep(wait)
            else:
                log.error(f"{operation} failed after {MAX_RETRIES} attempts: {exc}")

    raise last_exc  # type: ignore[misc]


async def mark_complete(job_id: str, output_key: str, output_size: int) -> None:
    await _patch_with_retry(
        url=f"{_base_url()}/api/jobs/{job_id}/complete",
        payload={"outputKey": output_key, "outputSize": output_size},
        operation=f"mark_complete({job_id})",
    )


async def mark_failed(job_id: str, error: str) -> None:
    await _patch_with_retry(
        url=f"{_base_url()}/api/jobs/{job_id}/failed",
        payload={"error": error},
        operation=f"mark_failed({job_id})",
    )
