"""
Pre-processing script: converts PDF and PPTX files in the Knowledge base
into clean Markdown files suitable for RAG ingestion.
"""

import os
import re
import pymupdf4llm
from pptx import Presentation
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

KB_DIR = "Knowledge base"


def pdf_to_markdown(pdf_path: str, out_path: str) -> None:
    """Convert a PDF to Markdown using pymupdf4llm."""
    print(f"  Converting PDF: {pdf_path}")
    md = pymupdf4llm.to_markdown(pdf_path)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  → Written: {out_path}")


def shape_text(shape) -> str:
    """Extract formatted text from a PPTX shape's text frame."""
    if not shape.has_text_frame:
        return ""

    lines = []
    for para in shape.text_frame.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        level = para.level  # 0 = top level, 1+ = indented bullets
        indent = "  " * level

        # Detect title-like paragraphs (large font or bold on level 0)
        is_title = False
        if para.runs:
            run = para.runs[0]
            font_size = run.font.size
            is_bold = run.font.bold
            if font_size and font_size >= Pt(20) and level == 0:
                is_title = True
            elif is_bold and level == 0 and len(text) < 120:
                is_title = True

        if is_title:
            lines.append(f"### {text}")
        elif level == 0:
            lines.append(f"{indent}{text}")
        else:
            lines.append(f"{indent}- {text}")

    return "\n".join(lines)


def pptx_to_markdown(pptx_path: str, out_path: str) -> None:
    """Convert a PPTX to Markdown, one section per slide."""
    print(f"  Converting PPTX: {pptx_path}")
    prs = Presentation(pptx_path)
    sections = []

    for i, slide in enumerate(prs.slides, start=1):
        slide_lines = [f"## Slide {i}"]

        # Collect placeholder title first
        title_text = ""
        for ph in slide.placeholders:
            if ph.placeholder_format.idx == 0:  # title placeholder
                title_text = ph.text.strip()
                break

        if title_text:
            slide_lines.append(f"# {title_text}")

        # Process all shapes (skip title placeholder if already captured)
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            # Skip the title placeholder we already handled
            try:
                if shape.placeholder_format and shape.placeholder_format.idx == 0:
                    continue
            except ValueError:
                pass  # shape.placeholder_format raises if not a placeholder
            text = shape_text(shape)
            if text:
                slide_lines.append(text)

        # Only include slides that have actual content
        content = "\n".join(slide_lines)
        if len(content.strip()) > len(f"## Slide {i}"):
            sections.append(content)

    md = "\n\n---\n\n".join(sections)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  → Written: {out_path}")


def process_directory(root: str) -> None:
    """Walk the knowledge base and convert PDF/PPTX files to Markdown."""
    for dirpath, _, filenames in os.walk(root):
        for filename in filenames:
            if filename.startswith("."):
                continue

            base, ext = os.path.splitext(filename)
            ext = ext.lower()
            src = os.path.join(dirpath, filename)

            if ext == ".pdf":
                pdf_to_markdown(src, os.path.join(dirpath, base + "_pdf.md"))
            elif ext == ".pptx":
                pptx_to_markdown(src, os.path.join(dirpath, base + "_pptx.md"))


if __name__ == "__main__":
    print(f"Starting pre-processing under: {KB_DIR}\n")
    process_directory(KB_DIR)
    print("\nDone.")
