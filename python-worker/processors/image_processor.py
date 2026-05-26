"""
Image processing — Pillow, pillow-heif, cairosvg, rembg.
"""
import io

from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()  # enables Image.open() for HEIC/HEIF


# ─── Format conversions ───────────────────────────────────────────────────────

def jpg_to_png(data: bytes, _meta: dict) -> tuple[bytes, str]:
    img = Image.open(io.BytesIO(data)).convert("RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue(), "output.png"


def png_to_jpg(data: bytes, meta: dict) -> tuple[bytes, str]:
    quality = int(meta.get("quality", 90))
    img = Image.open(io.BytesIO(data)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue(), "output.jpg"


def image_to_webp(data: bytes, meta: dict) -> tuple[bytes, str]:
    quality = int(meta.get("quality", 85))
    img = Image.open(io.BytesIO(data)).convert("RGBA")
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality)
    return buf.getvalue(), "output.webp"


def heic_to_jpg(data: bytes, meta: dict) -> tuple[bytes, str]:
    quality = int(meta.get("quality", 90))
    img = Image.open(io.BytesIO(data)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue(), "output.jpg"


def svg_to_png(data: bytes, meta: dict) -> tuple[bytes, str]:
    import cairosvg
    width = int(meta.get("width", 1024))
    png_bytes = cairosvg.svg2png(bytestring=data, output_width=width)
    return png_bytes, "output.png"


# ─── Image editing ────────────────────────────────────────────────────────────

def compress_image(data: bytes, meta: dict) -> tuple[bytes, str]:
    quality = int(meta.get("quality", 70))
    img = Image.open(io.BytesIO(data)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue(), "compressed.jpg"


def resize_image(data: bytes, meta: dict) -> tuple[bytes, str]:
    width = int(meta.get("width", 800))
    img = Image.open(io.BytesIO(data))
    ratio = width / img.width
    height = int(img.height * ratio)
    resized = img.resize((width, height), Image.LANCZOS)
    buf = io.BytesIO()
    fmt = img.format or "JPEG"
    resized.save(buf, format=fmt)
    return buf.getvalue(), f"resized.{fmt.lower()}"


def grayscale_image(data: bytes, _meta: dict) -> tuple[bytes, str]:
    img = Image.open(io.BytesIO(data)).convert("L")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue(), "grayscale.jpg"


def remove_background(data: bytes, _meta: dict) -> tuple[bytes, str]:
    from rembg import remove
    output = remove(data)
    return output, "no-background.png"


# ─── Dispatcher ───────────────────────────────────────────────────────────────

IMAGE_PROCESSORS = {
    "jpg-to-png":         jpg_to_png,
    "png-to-jpg":         png_to_jpg,
    "image-to-webp":      image_to_webp,
    "to-webp":            image_to_webp,
    "heic-to-jpg":        heic_to_jpg,
    "svg-to-png":         svg_to_png,
    "compress-image":     compress_image,
    "resize-image":       resize_image,
    "grayscale-image":    grayscale_image,
    "grayscale":          grayscale_image,
    "remove-background":  remove_background,
}
