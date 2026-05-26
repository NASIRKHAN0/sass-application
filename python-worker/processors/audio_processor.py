"""
Audio / video transcription — OpenAI Whisper API + FFmpeg for video extraction.
"""
import io
import os
import tempfile

from openai import OpenAI

try:
    from pydub import AudioSegment
    _PYDUB_AVAILABLE = True
except Exception:
    _PYDUB_AVAILABLE = False

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

# Whisper API limit: 25 MB per request
CHUNK_MB = 24
CHUNK_BYTES = CHUNK_MB * 1024 * 1024


def _extract_audio_from_video(video_bytes: bytes, input_ext: str) -> bytes:
    """Extract audio track from video using ffmpeg-python."""
    import ffmpeg
    with tempfile.NamedTemporaryFile(suffix=input_ext, delete=False) as tmp_in:
        tmp_in.write(video_bytes)
        tmp_in_path = tmp_in.name

    tmp_out_path = tmp_in_path.replace(input_ext, ".mp3")
    try:
        ffmpeg.input(tmp_in_path).audio.output(tmp_out_path, format="mp3").run(
            quiet=True, overwrite_output=True
        )
        with open(tmp_out_path, "rb") as f:
            return f.read()
    finally:
        os.unlink(tmp_in_path)
        if os.path.exists(tmp_out_path):
            os.unlink(tmp_out_path)


def _transcribe_audio_bytes(audio_bytes: bytes, filename: str, language: str | None) -> str:
    """Send audio to Whisper API, handling chunking for large files."""
    if len(audio_bytes) <= CHUNK_BYTES:
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language=language,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )
        return _format_transcript(result)

    # Large file — split into chunks using pydub
    if not _PYDUB_AVAILABLE:
        raise RuntimeError("pydub not available on this Python version; file too large to process without chunking")
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
    chunk_ms = 10 * 60 * 1000  # 10 min chunks
    chunks = [audio[i : i + chunk_ms] for i in range(0, len(audio), chunk_ms)]

    full_text = []
    for i, chunk in enumerate(chunks):
        buf = io.BytesIO()
        chunk.export(buf, format="mp3")
        buf.name = f"chunk_{i}.mp3"
        buf.seek(0)
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=buf,
            language=language,
            response_format="text",
        )
        full_text.append(result)

    return "\n\n".join(full_text)


def _format_transcript(result) -> str:
    """Format Whisper verbose_json result with timestamps."""
    lines = []
    for seg in result.segments or []:
        start = _fmt_time(seg.start)
        end = _fmt_time(seg.end)
        lines.append(f"[{start} → {end}] {seg.text.strip()}")
    return "\n".join(lines) if lines else result.text


def _fmt_time(seconds: float) -> str:
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def _export_srt(result) -> str:
    lines = []
    for i, seg in enumerate(result.segments or [], 1):
        lines.append(str(i))
        lines.append(f"{_srt_time(seg.start)} --> {_srt_time(seg.end)}")
        lines.append(seg.text.strip())
        lines.append("")
    return "\n".join(lines)


def _srt_time(seconds: float) -> str:
    ms = int((seconds % 1) * 1000)
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# ─── Public processors ────────────────────────────────────────────────────────

def transcribe_audio(data: bytes, meta: dict) -> tuple[bytes, str]:
    language = meta.get("language") or None
    fmt = meta.get("format", "txt")
    text = _transcribe_audio_bytes(data, "audio.mp3", language)
    if fmt == "docx":
        return _to_docx(text), "transcript.docx"
    return text.encode("utf-8"), "transcript.txt"


def transcribe_video(data: bytes, meta: dict) -> tuple[bytes, str]:
    audio_bytes = _extract_audio_from_video(data, ".mp4")
    language = meta.get("language") or None
    text = _transcribe_audio_bytes(audio_bytes, "audio.mp3", language)
    fmt = meta.get("format", "txt")
    if fmt == "docx":
        return _to_docx(text), "transcript.docx"
    return text.encode("utf-8"), "transcript.txt"


def export_srt(data: bytes, meta: dict) -> tuple[bytes, str]:
    language = meta.get("language") or None
    audio_file = io.BytesIO(data)
    audio_file.name = "audio.mp3"
    result = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language=language,
        response_format="verbose_json",
        timestamp_granularities=["segment"],
    )
    fmt = meta.get("format", "srt")
    content = _export_srt(result)
    return content.encode("utf-8"), f"subtitles.{fmt}"


def _to_docx(text: str) -> bytes:
    from docx import Document
    doc = Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ─── Dispatcher ───────────────────────────────────────────────────────────────

AUDIO_PROCESSORS = {
    "transcribe-mp3":    transcribe_audio,
    "transcribe-audio":  transcribe_audio,
    "transcribe-video":  transcribe_video,
    "transcribe-50lang": transcribe_audio,
    "export-srt":        export_srt,
}
