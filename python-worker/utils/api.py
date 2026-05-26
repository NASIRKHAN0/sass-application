"""
HTTP helpers for talking to the Next.js API.
"""
import os
import httpx

def _base_url() -> str:
    return os.environ.get("NEXT_API_URL", "http://localhost:3000")

def _headers() -> dict:
    return {"x-worker-secret": os.environ.get("WORKER_API_SECRET", "")}


async def claim_job() -> dict | None:
    """Ask Next.js for the next pending job. Returns None if queue is empty."""
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(f"{_base_url()}/api/internal/jobs/claim", headers=_headers())
        if res.status_code == 204:
            return None
        res.raise_for_status()
        return res.json()


async def mark_complete(job_id: str, output_key: str, output_size: int) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.patch(
            f"{_base_url()}/api/jobs/{job_id}/complete",
            headers=_headers(),
            json={"outputKey": output_key, "outputSize": output_size},
        )
        res.raise_for_status()


async def mark_failed(job_id: str, error: str) -> None:
    async with httpx.AsyncClient(timeout=30) as client:
        await client.patch(
            f"{_base_url()}/api/jobs/{job_id}/failed",
            headers=_headers(),
            json={"error": error},
        )
