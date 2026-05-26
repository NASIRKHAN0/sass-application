"""
PDF processing — LibreOffice conversions, PyMuPDF, pikepdf.
Requires: LibreOffice installed at /usr/bin/libreoffice (or soffice on Windows)
"""
import io
import os
import shutil
import subprocess
import tempfile
import zipfile
import pathlib

import fitz          # PyMuPDF
import pikepdf
import pdfplumber


# ─── LibreOffice path ─────────────────────────────────────────────────────────

def _libreoffice() -> str:
    candidates = [
        "libreoffice", "soffice",
        "/usr/bin/libreoffice", "/usr/bin/soffice",
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    ]
    for candidate in candidates:
        if shutil.which(candidate) or (os.path.isfile(candidate)):
            return candidate
    raise RuntimeError(
        "LibreOffice not found. "
        "Windows: install from libreoffice.org. "
        "Linux: apt install libreoffice"
    )


def _convert_with_libreoffice(input_bytes: bytes, input_ext: str, output_format: str) -> bytes:
    """Run LibreOffice headless conversion and return output bytes."""
    with tempfile.TemporaryDirectory() as tmp:
        input_path = os.path.join(tmp, f"input{input_ext}")
        with open(input_path, "wb") as f:
            f.write(input_bytes)

        subprocess.run(
            [_libreoffice(), "--headless", "--convert-to", output_format,
             "--outdir", tmp, input_path],
            check=True, capture_output=True, timeout=120,
        )

        output_files = [
            f for f in os.listdir(tmp)
            if f != f"input{input_ext}" and f.endswith(f".{output_format}")
        ]
        if not output_files:
            raise RuntimeError(f"LibreOffice produced no output for {output_format}")

        return open(os.path.join(tmp, output_files[0]), "rb").read()


# ─── PDF → Office formats ─────────────────────────────────────────────────────

def pdf_to_word(data: bytes, _meta: dict) -> tuple[bytes, str]:
    return _convert_with_libreoffice(data, ".pdf", "docx"), "output.docx"


def pdf_to_excel(data: bytes, _meta: dict) -> tuple[bytes, str]:
    """Extract tables with pdfplumber → CSV → LibreOffice → xlsx."""
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        rows = []
        for page in pdf.pages:
            for table in page.extract_tables():
                rows.extend(table)
                rows.append([])   # blank row between tables

    if not rows:
        raise ValueError("No tables found in PDF.")

    csv_content = "\n".join(
        ",".join(f'"{str(cell or "")}"' for cell in row)
        for row in rows
    ).encode()

    xlsx_bytes = _convert_with_libreoffice(csv_content, ".csv", "xlsx")
    return xlsx_bytes, "output.xlsx"


def pdf_to_powerpoint(data: bytes, _meta: dict) -> tuple[bytes, str]:
    return _convert_with_libreoffice(data, ".pdf", "pptx"), "output.pptx"


# ─── PDF → Images ─────────────────────────────────────────────────────────────

def pdf_to_jpg(data: bytes, meta: dict) -> tuple[bytes, str]:
    dpi = int(meta.get("dpi", 150))
    doc = fitz.open(stream=data, filetype="pdf")

    if len(doc) == 1:
        page = doc[0]
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat)
        return pix.tobytes("jpeg"), "output.jpg"

    # Multiple pages → zip of JPEGs
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, page in enumerate(doc):
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            zf.writestr(f"page-{i+1}.jpg", pix.tobytes("jpeg"))
    return buf.getvalue(), "pages.zip"


def pdf_to_png(data: bytes, meta: dict) -> tuple[bytes, str]:
    dpi = int(meta.get("dpi", 150))
    doc = fitz.open(stream=data, filetype="pdf")

    if len(doc) == 1:
        pix = doc[0].get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72))
        return pix.tobytes("png"), "output.png"

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, page in enumerate(doc):
            pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72))
            zf.writestr(f"page-{i+1}.png", pix.tobytes("png"))
    return buf.getvalue(), "pages.zip"


def pdf_to_txt(data: bytes, _meta: dict) -> tuple[bytes, str]:
    doc = fitz.open(stream=data, filetype="pdf")
    text = "\n\n".join(page.get_text() for page in doc)
    return text.encode("utf-8"), "output.txt"


# ─── Office → PDF ─────────────────────────────────────────────────────────────

def word_to_pdf(data: bytes, _meta: dict) -> tuple[bytes, str]:
    return _convert_with_libreoffice(data, ".docx", "pdf"), "output.pdf"


def excel_to_pdf(data: bytes, _meta: dict) -> tuple[bytes, str]:
    return _convert_with_libreoffice(data, ".xlsx", "pdf"), "output.pdf"


def ppt_to_pdf(data: bytes, _meta: dict) -> tuple[bytes, str]:
    return _convert_with_libreoffice(data, ".pptx", "pdf"), "output.pdf"


# ─── PDF Management ───────────────────────────────────────────────────────────

def compress_pdf(data: bytes, meta: dict) -> tuple[bytes, str]:
    """Compress using PyMuPDF — reduces image quality and removes redundancy."""
    doc = fitz.open(stream=data, filetype="pdf")
    buf = io.BytesIO()
    doc.save(
        buf,
        garbage=4,
        deflate=True,
        deflate_images=True,
        deflate_fonts=True,
        clean=True,
    )
    return buf.getvalue(), "compressed.pdf"


def unlock_pdf(data: bytes, meta: dict) -> tuple[bytes, str]:
    password = str(meta.get("password", ""))
    pdf = pikepdf.open(io.BytesIO(data), password=password)
    buf = io.BytesIO()
    pdf.save(buf)
    return buf.getvalue(), "unlocked.pdf"


def protect_pdf(data: bytes, meta: dict) -> tuple[bytes, str]:
    password = str(meta.get("password", "1234"))
    pdf = pikepdf.open(io.BytesIO(data))
    buf = io.BytesIO()
    pdf.save(buf, encryption=pikepdf.Encryption(user=password, owner=password))
    return buf.getvalue(), "protected.pdf"


def merge_pdf(data: bytes, meta: dict) -> tuple[bytes, str]:
    """Merge the uploaded PDF with additional PDFs passed as base64 in meta."""
    import base64
    merger = pikepdf.Pdf.new()
    for src_bytes in [data] + [base64.b64decode(b) for b in meta.get("extra", [])]:
        src = pikepdf.open(io.BytesIO(src_bytes))
        merger.pages.extend(src.pages)
    buf = io.BytesIO()
    merger.save(buf)
    return buf.getvalue(), "merged.pdf"


def split_pdf(data: bytes, meta: dict) -> tuple[bytes, str]:
    """Extract a single page (1-indexed) or range."""
    pdf = pikepdf.open(io.BytesIO(data))
    start = int(meta.get("start", 1)) - 1
    end = int(meta.get("end", start + 1))

    out = pikepdf.Pdf.new()
    for page in pdf.pages[start:end]:
        out.pages.append(page)

    buf = io.BytesIO()
    out.save(buf)
    return buf.getvalue(), f"pages-{start+1}-{end}.pdf"


def rotate_pdf(data: bytes, meta: dict) -> tuple[bytes, str]:
    angle = int(meta.get("angle", 90))
    pdf = pikepdf.open(io.BytesIO(data))
    for page in pdf.pages:
        page.Rotate = (int(page.get("/Rotate", 0)) + angle) % 360
    buf = io.BytesIO()
    pdf.save(buf)
    return buf.getvalue(), "rotated.pdf"


def repair_pdf(data: bytes, _meta: dict) -> tuple[bytes, str]:
    pdf = pikepdf.open(io.BytesIO(data), suppress_warnings=True)
    buf = io.BytesIO()
    pdf.save(buf)
    return buf.getvalue(), "repaired.pdf"


# ─── Dispatcher ───────────────────────────────────────────────────────────────

PDF_PROCESSORS = {
    "pdf-to-word":       pdf_to_word,
    "pdf-to-excel":      pdf_to_excel,
    "pdf-to-powerpoint": pdf_to_powerpoint,
    "pdf-to-jpg":        pdf_to_jpg,
    "pdf-to-png":        pdf_to_png,
    "pdf-to-txt":        pdf_to_txt,
    "word-to-pdf":       word_to_pdf,
    "excel-to-pdf":      excel_to_pdf,
    "ppt-to-pdf":        ppt_to_pdf,
    "compress-pdf":      compress_pdf,
    "unlock-pdf":        unlock_pdf,
    "protect-pdf":       protect_pdf,
    "merge-pdf":         merge_pdf,
    "split-pdf":         split_pdf,
    "rotate-pdf":        rotate_pdf,
    "repair-pdf":        repair_pdf,
}
