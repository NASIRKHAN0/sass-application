"""
Audio and video processing using ffmpeg and pydub.
"""
import io
import os
import subprocess
import tempfile

from pydub import AudioSegment


def _run_ffmpeg(*args: str) -> None:
    subprocess.run(["ffmpeg", "-y", *args], check=True, capture_output=True)


def _tmp(suffix: str) -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    return path


def _cleanup(*paths: str) -> None:
    for p in paths:
        try:
            os.unlink(p)
        except OSError:
            pass


# ─── Audio tools ─────────────────────────────────────────────────────────────

def mp4_to_mp3(data: bytes, meta: dict) -> tuple[bytes, str]:
    tmp_in = _tmp(".mp4")
    tmp_out = _tmp(".mp3")
    try:
        with open(tmp_in, "wb") as f:
            f.write(data)
        _run_ffmpeg("-i", tmp_in, "-vn", "-acodec", "libmp3lame", "-ab", "192k", tmp_out)
        with open(tmp_out, "rb") as f:
            return f.read(), "output.mp3"
    finally:
        _cleanup(tmp_in, tmp_out)


def audio_to_mp3(data: bytes, meta: dict) -> tuple[bytes, str]:
    tmp_in = _tmp(".audio")
    tmp_out = _tmp(".mp3")
    try:
        with open(tmp_in, "wb") as f:
            f.write(data)
        _run_ffmpeg("-i", tmp_in, "-acodec", "libmp3lame", "-ab", "192k", tmp_out)
        with open(tmp_out, "rb") as f:
            return f.read(), "output.mp3"
    finally:
        _cleanup(tmp_in, tmp_out)


def trim_audio(data: bytes, meta: dict) -> tuple[bytes, str]:
    start = float(meta.get("start", 0))
    end = float(meta.get("end", 30))
    audio = AudioSegment.from_file(io.BytesIO(data))
    trimmed = audio[int(start * 1000):int(end * 1000)]
    buf = io.BytesIO()
    trimmed.export(buf, format="mp3", bitrate="192k")
    return buf.getvalue(), "trimmed.mp3"


def compress_audio(data: bytes, meta: dict) -> tuple[bytes, str]:
    bitrate = str(meta.get("bitrate", "128k"))
    tmp_in = _tmp(".audio")
    tmp_out = _tmp(".mp3")
    try:
        with open(tmp_in, "wb") as f:
            f.write(data)
        _run_ffmpeg("-i", tmp_in, "-acodec", "libmp3lame", "-ab", bitrate, tmp_out)
        with open(tmp_out, "rb") as f:
            return f.read(), "compressed.mp3"
    finally:
        _cleanup(tmp_in, tmp_out)


def merge_audio(data: bytes, meta: dict) -> tuple[bytes, str]:
    # Single-file passthrough — multi-file merge handled via separate mechanism
    audio = AudioSegment.from_file(io.BytesIO(data))
    buf = io.BytesIO()
    audio.export(buf, format="mp3", bitrate="192k")
    return buf.getvalue(), "merged.mp3"


# ─── Video tools ─────────────────────────────────────────────────────────────

def mp4_to_gif(data: bytes, meta: dict) -> tuple[bytes, str]:
    fps = int(meta.get("fps", 10))
    width = int(meta.get("width", 480))
    start = float(meta.get("start", 0))
    duration = float(meta.get("duration", 5))

    tmp_in = _tmp(".mp4")
    tmp_out = _tmp(".gif")
    try:
        with open(tmp_in, "wb") as f:
            f.write(data)
        vf = (
            f"fps={fps},scale={width}:-1:flags=lanczos,"
            f"split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
        )
        _run_ffmpeg(
            "-ss", str(start), "-t", str(duration), "-i", tmp_in,
            "-vf", vf, "-loop", "0", tmp_out,
        )
        with open(tmp_out, "rb") as f:
            return f.read(), "output.gif"
    finally:
        _cleanup(tmp_in, tmp_out)


def trim_video(data: bytes, meta: dict) -> tuple[bytes, str]:
    start = float(meta.get("start", 0))
    end = float(meta.get("end", 30))
    duration = end - start

    tmp_in = _tmp(".mp4")
    tmp_out = _tmp(".mp4")
    try:
        with open(tmp_in, "wb") as f:
            f.write(data)
        _run_ffmpeg("-ss", str(start), "-t", str(duration), "-i", tmp_in, "-c", "copy", tmp_out)
        with open(tmp_out, "rb") as f:
            return f.read(), "trimmed.mp4"
    finally:
        _cleanup(tmp_in, tmp_out)


def compress_video(data: bytes, meta: dict) -> tuple[bytes, str]:
    crf = int(meta.get("crf", 28))

    tmp_in = _tmp(".mp4")
    tmp_out = _tmp(".mp4")
    try:
        with open(tmp_in, "wb") as f:
            f.write(data)
        _run_ffmpeg(
            "-i", tmp_in,
            "-vcodec", "libx264", "-crf", str(crf),
            "-acodec", "aac", "-preset", "fast",
            tmp_out,
        )
        with open(tmp_out, "rb") as f:
            return f.read(), "compressed.mp4"
    finally:
        _cleanup(tmp_in, tmp_out)


def video_to_mp4(data: bytes, meta: dict) -> tuple[bytes, str]:
    tmp_in = _tmp(".video")
    tmp_out = _tmp(".mp4")
    try:
        with open(tmp_in, "wb") as f:
            f.write(data)
        _run_ffmpeg(
            "-i", tmp_in,
            "-vcodec", "libx264", "-acodec", "aac",
            "-preset", "fast",
            tmp_out,
        )
        with open(tmp_out, "rb") as f:
            return f.read(), "output.mp4"
    finally:
        _cleanup(tmp_in, tmp_out)


# ─── Dispatcher ───────────────────────────────────────────────────────────────

MEDIA_PROCESSORS = {
    "mp4-to-mp3":      mp4_to_mp3,
    "audio-to-mp3":    audio_to_mp3,
    "trim-audio":      trim_audio,
    "compress-audio":  compress_audio,
    "merge-audio":     merge_audio,
    "mp4-to-gif":      mp4_to_gif,
    "trim-video":      trim_video,
    "compress-video":  compress_video,
    "video-to-mp4":    video_to_mp4,
}
