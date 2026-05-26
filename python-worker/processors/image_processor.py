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


def tiff_to_jpg(data: bytes, meta: dict) -> tuple[bytes, str]:
    quality = int(meta.get("quality", 90))
    img = Image.open(io.BytesIO(data)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue(), "output.jpg"


def bmp_to_jpg(data: bytes, meta: dict) -> tuple[bytes, str]:
    quality = int(meta.get("quality", 90))
    img = Image.open(io.BytesIO(data)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue(), "output.jpg"


def image_to_avif(data: bytes, meta: dict) -> tuple[bytes, str]:
    quality = int(meta.get("quality", 80))
    img = Image.open(io.BytesIO(data))
    buf = io.BytesIO()
    img.save(buf, format="AVIF", quality=quality)
    return buf.getvalue(), "output.avif"


def flip_image(data: bytes, meta: dict) -> tuple[bytes, str]:
    direction = meta.get("direction", "horizontal")
    img = Image.open(io.BytesIO(data))
    if direction == "vertical":
        flipped = img.transpose(Image.FLIP_TOP_BOTTOM)
    else:
        flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
    buf = io.BytesIO()
    fmt = img.format or "JPEG"
    flipped.save(buf, format=fmt)
    return buf.getvalue(), f"flipped.{fmt.lower()}"


def add_text_image(data: bytes, meta: dict) -> tuple[bytes, str]:
    from PIL import ImageDraw, ImageFont

    text = str(meta.get("text", "FileAI"))
    position = meta.get("position", "bottom")
    font_size = int(meta.get("fontSize", 48))
    color = meta.get("color", "#ffffff")

    img = Image.open(io.BytesIO(data)).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    padding = 20

    if position == "top":
        x = (img.width - text_w) // 2
        y = padding
    elif position == "center":
        x = (img.width - text_w) // 2
        y = (img.height - text_h) // 2
    else:  # bottom
        x = (img.width - text_w) // 2
        y = img.height - text_h - padding

    # Shadow for readability
    draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 160))
    draw.text((x, y), text, font=font, fill=color)

    result = Image.alpha_composite(img, overlay).convert("RGB")
    buf = io.BytesIO()
    result.save(buf, format="JPEG", quality=92)
    return buf.getvalue(), "output.jpg"


def photo_enhancer(data: bytes, meta: dict) -> tuple[bytes, str]:
    from PIL import ImageEnhance

    brightness = float(meta.get("brightness", 1.0))
    contrast = float(meta.get("contrast", 1.0))
    sharpness = float(meta.get("sharpness", 1.0))
    saturation = float(meta.get("saturation", 1.0))

    img = Image.open(io.BytesIO(data)).convert("RGB")
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Sharpness(img).enhance(sharpness)
    img = ImageEnhance.Color(img).enhance(saturation)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return buf.getvalue(), "enhanced.jpg"


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
    "tiff-to-jpg":        tiff_to_jpg,
    "bmp-to-jpg":         bmp_to_jpg,
    "image-to-avif":      image_to_avif,
    "flip-image":         flip_image,
    "add-text-image":     add_text_image,
    "photo-enhancer":     photo_enhancer,
}
