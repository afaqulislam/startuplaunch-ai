"""Server-side professional PDF generation for validation reports.

Generating the PDF here (instead of a browser print-to-PDF on the client)
guarantees a consistent, professional document on every device and removes
the dependency on the user's print dialog.
"""
import io
import os
import re
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from models import Project, Report


def _register_fonts() -> None:
    """Replace reportlab's built-in Helvetica with DejaVu Sans so any character
    the LLM writes (Urdu, Hindi, Cyrillic, arrows, symbols) renders instead of
    printing as empty boxes.

    DejaVu covers Latin, Cyrillic, Greek, Devanagari, Arabic and most symbols.
    The font files are bundled next to this module so it works in serverless
    too; if they are missing we fall back to the built-in Latin-only fonts.
    """
    FONT_SRC = {
        "DejaVuSans": "DejaVuSans.ttf",
        "DejaVuSans-Bold": "DejaVuSans-Bold.ttf",
        "DejaVuSans-Oblique": "DejaVuSans-Oblique.ttf",
    }
    font_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
    if not all(os.path.exists(os.path.join(font_dir, fn)) for fn in FONT_SRC.values()):
        return
    try:
        for name, fn in FONT_SRC.items():
            pdfmetrics.registerFont(TTFont(name, os.path.join(font_dir, fn)))
    except Exception:  # pragma: no cover - only when a bundled font is corrupt
        return
    # Keep <b>/<i> inline markup working inside Paragraphs.
    addMapping("DejaVuSans", 0, 0, "DejaVuSans")
    addMapping("DejaVuSans", 1, 0, "DejaVuSans-Bold")
    addMapping("DejaVuSans", 0, 1, "DejaVuSans-Oblique")
    addMapping("DejaVuSans", 1, 1, "DejaVuSans-Bold")
    registerFontFamily(
        "DejaVuSans",
        normal="DejaVuSans",
        bold="DejaVuSans-Bold",
        italic="DejaVuSans-Oblique",
        boldItalic="DejaVuSans-Bold",
    )
    # reportlab's Paragraph resolver (ps2tt) maps a font name to family/bold/
    # italic through a fixed table of built-ins. Register our DejaVu family in
    # that table so styles using "DejaVuSans*" parse correctly.
    from reportlab.lib import fonts as _rl_fonts

    _rl_fonts._ps2tt_map.update(
        {
            "dejavusans": ("DejaVuSans", 0, 0),
            "dejavusans-bold": ("DejaVuSans", 1, 0),
            "dejavusans-oblique": ("DejaVuSans", 0, 1),
        }
    )


_register_fonts()

# Characters the bundled DejaVu font cannot draw or that are colour emoji.
# Stripping them keeps the report clean instead of printing empty boxes.
_EMOJI_RE = re.compile(
    "["
    "\U0001F000-\U0001FAFF"  # Mahjong tiles ... Symbols & pictographs extended-A
    "\U0001FB00-\U0001FBFF"  # Symbols for legacy computing
    "\u20E3"                 # combining enclosing keycap
    "\u200D"                 # zero-width joiner
    "\uFE00-\uFE0F"          # variation selectors (emoji presentation)
    "\uE000-\uF8FF"          # private-use area (icon fonts)
    "\u2B50"                 # white medium star (colour emoji, not in DejaVu)
    "]+"
)

# Glyph coverage of the bundled DejaVu font, for stripping any character that
# would otherwise render as an empty box. Tested lazily against the TTFont so
# we don't hard-code hundreds of code points.
_dejavu_cmap = None


def _missing_glyph_re() -> "re.Pattern":
    """Return a regex matching chars missing from the bundled DejaVu font.

    Only characters from the ranges commonly emitted by LLMs (arrows, symbols,
    dingbats, currency, CJK punctuation) are examined, so the regex stays compact
    and the cache is bounded.
    """
    global _dejavu_cmap
    if _dejavu_cmap is None:
        try:
            from reportlab.pdfbase.ttfonts import TTFont

            _dejavu_cmap = TTFont(
                "_Probe", os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "DejaVuSans.ttf")
            ).face.charToGlyph
        except Exception:
            _dejavu_cmap = {}
    ranges = (
        "\u2000-\u2BFF"  # general punctuation... misc symbols (≈, →, ✓, ✅ …)
        "\u20A0-\u20CF"  # currency symbols (₹, ₽ …)
        "\u2600-\u27BF"  # misc symbols + dingbats
        "\u2C00-\u2DFF"  # glagolitic + coptic
        "\u2E00-\u2E7F"  # supplemental punctuation
        "\u2E80-\u2FFF"  # CJK radicals
    )
    missing = "".join(
        ch
        for cp in range(0x2000, 0x3001)
        if (ch := chr(cp)).isprintable() and not _dejavu_cmap.get(cp)
    )
    if not missing:
        return re.compile(r"(?!)")  # never matches
    return re.compile("[" + re.escape(missing) + "]")


def _sanitize_text(value) -> str:
    """Return a string safe for PDF rendering (no emoji / unusable glyphs)."""
    if value is None:
        return " "
    text = str(value)
    text = _EMOJI_RE.sub(" ", text)
    text = _missing_glyph_re().sub(" ", text)
    # Fold repeated spaces left after stripping.
    return re.sub(r" {2,}", " ", text)


# Brand palette (matches the web UI).
INDIGO = colors.HexColor("#4f46e5")
CYAN = colors.HexColor("#0891b2")
EMERALD = colors.HexColor("#059669")
RED = colors.HexColor("#dc2626")
AMBER = colors.HexColor("#d97706")
DARK = colors.HexColor("#111827")
GRAY = colors.HexColor("#6b7280")
LIGHT_GRAY = colors.HexColor("#f3f4f6")

APP_NAME = "StartupLaunch AI"


def _s(value, default: str = "N/A") -> str:
    if value is None:
        return default
    return _sanitize_text(value).strip() or default


def _list(value) -> list:
    if isinstance(value, list):
        return [_sanitize_text(x).strip() for x in value if _sanitize_text(x).strip()]
    if isinstance(value, str):
        return [s.strip() for s in re.split(r"[\n•,]", value) if s.strip()]
    return []


def _normalize_recommendation(value):
    if not value:
        return None
    v = str(value).strip().lower()
    if v == "go":
        return "Go"
    if v in ("no-go", "no go", "nogo"):
        return "No-Go"
    if v == "pivot":
        return "Pivot"
    return str(value).strip()


def _extract_sections(content: dict) -> dict:
    """Mirror the frontend's legacy/new data-shape normalization so the PDF
    shows exactly what the dashboard renders."""
    legacy = content.get("specialized_reports") or {}
    market = (
        content.get("market_analysis")
        or legacy.get("market_research")
        or content.get("market_research")
    )
    competitor = content.get("competitor_analysis") or legacy.get("competitor_analysis")
    risk = (
        content.get("risk_analysis")
        or legacy.get("risk_assessment")
        or content.get("risk_assessment")
    )
    executive = content.get("executive_decision") or content.get("executive_summary")
    return {
        "market": market if isinstance(market, dict) else {},
        "competitor": competitor if isinstance(competitor, dict) else {},
        "risk": risk if isinstance(risk, dict) else {},
        "executive": executive if isinstance(executive, dict) else {},
        "recommendation": _normalize_recommendation(
            executive.get("recommendation") if isinstance(executive, dict) else None
        )
        or _normalize_recommendation(content.get("recommendation")),
        "executive_summary": (
            executive.get("executive_summary") if isinstance(executive, dict) else None
        )
        or content.get("executive_summary"),
        "key_takeaways": _list(
            executive.get("key_takeaways") if isinstance(executive, dict) else None
        )
        or _list(content.get("key_takeaways")),
        "partial": bool(content.get("_partial")),
    }


def _section_title(text: str) -> Paragraph:
    style = ParagraphStyle(
        name="SectionTitle",
        fontName="DejaVuSans-Bold",
        fontSize=13,
        leading=16,
        textColor=INDIGO,
        spaceBefore=14,
        spaceAfter=6,
    )
    return Paragraph(_sanitize_text(text).upper(), style)


def _label(text: str) -> Paragraph:
    style = ParagraphStyle(
        name="FieldLabel",
        fontName="DejaVuSans-Bold",
        fontSize=9.5,
        leading=12,
        textColor=GRAY,
        spaceBefore=6,
        spaceAfter=1,
    )
    return Paragraph(_sanitize_text(text).upper(), style)


def _body(text: str) -> Paragraph:
    style = ParagraphStyle(
        name="Body",
        fontName="DejaVuSans",
        fontSize=10,
        leading=15,
        textColor=DARK,
        alignment=TA_JUSTIFY,
        spaceAfter=4,
    )
    return Paragraph(_sanitize_text(text) or "N/A", style)


def _bullet(text: str) -> Paragraph:
    style = ParagraphStyle(
        name="Bullet",
        fontName="DejaVuSans",
        fontSize=10,
        leading=14,
        textColor=DARK,
        leftIndent=10,
        bulletIndent=0,
        spaceAfter=3,
    )
    return Paragraph(_sanitize_text(text), style, bulletText="•")


def _tag_table(items: list, tag_color=INDIGO) -> Flowable:
    """Row of rounded-pill style tags, wrapped in an invisible table."""
    if not items:
        return Paragraph("No data available.", ParagraphStyle(
            name="Empty", fontName="DejaVuSans-Oblique", fontSize=9.5,
            leading=13, textColor=GRAY,
        ))
    cell_style = ParagraphStyle(
        name="Tag",
        fontName="DejaVuSans-Bold",
        fontSize=9,
        leading=11,
        textColor=tag_color,
        alignment=TA_CENTER,
    )
    rows = []
    row = []
    col = 0
    for item in items:
        # ~6 tags per line keeps the row from overflowing the page width.
        row.append(Paragraph(_s(item), cell_style))
        col += 1
        if col >= 4:
            rows.append(row)
            row = []
            col = 0
    if row:
        rows.append(row)

    table = Table(rows, colWidths=[42 * mm] * max(len(r) for r in rows))
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def _verdict_banner(recommendation: str) -> Flowable:
    if recommendation == "Go":
        color, label = EMERALD, "High Strategic Viability"
    elif recommendation == "No-Go":
        color, label = RED, "High Risk / Pivot Recommended"
    elif recommendation == "Pivot":
        color, label = AMBER, "Conditional Fit"
    else:
        color, label = GRAY, "Analysis Complete"

    text_style = ParagraphStyle(
        name="VerdictText",
        fontName="DejaVuSans-Bold",
        fontSize=16,
        leading=20,
        textColor=colors.white,
    )
    label_style = ParagraphStyle(
        name="VerdictLabel",
        fontName="DejaVuSans",
        fontSize=9,
        leading=12,
        textColor=colors.white,
        alignment=TA_LEFT,
    )
    table = Table(
        [[
            Paragraph(f"AI VERDICT — {recommendation}", text_style),
            Paragraph(label, label_style),
        ]],
        colWidths=[95 * mm, 79 * mm],
    )
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (0, 0), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))
    return table


WATERMARK_TEXT = "Afaq Ul Islam · Founder of StartupLaunch AI"


class _FooterCanvas:
    """Draws a diagonal semi-transparent watermark plus a page footer (app
    name, page number) on every page."""

    def __init__(self, title: str):
        self._title = title

    def __call__(self, canvas, doc):
        canvas.saveState()

        # Diagonal watermark, repeated twice so it stays visible no matter how
        # the page flows. Semi-transparent so the report text stays readable.
        for x, y in ((A4[0] * 0.30, A4[1] * 0.30), (A4[0] * 0.72, A4[1] * 0.68)):
            canvas.saveState()
            canvas.translate(x, y)
            canvas.rotate(28)
            canvas.setFont("DejaVuSans-Bold", 26)
            canvas.setFillColor(INDIGO)
            canvas.setFillAlpha(0.10)
            canvas.drawCentredString(0, 0, WATERMARK_TEXT)
            canvas.restoreState()

        # Footer rule + app name + page number.
        canvas.setStrokeColor(colors.HexColor("#e5e7eb"))
        canvas.setLineWidth(0.6)
        canvas.line(18 * mm, 14 * mm, A4[0] - 18 * mm, 14 * mm)
        canvas.setFont("DejaVuSans", 8)
        canvas.setFillColor(GRAY)
        canvas.drawString(18 * mm, 10 * mm, f"{APP_NAME} · {self._title}")
        canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"Page {doc.page}")
        canvas.restoreState()


def build_report_pdf(project: Project, report: Report) -> bytes:
    content = report.content if isinstance(report.content, dict) else {}
    sections = _extract_sections(content)
    market = sections["market"]
    competitor = sections["competitor"]
    risk = sections["risk"]

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=20 * mm,
        title=f"{project.title} — Validation Report",
        author=APP_NAME,
        subject="Startup validation report",
    )

    heading = ParagraphStyle(
        name="Title",
        fontName="DejaVuSans-Bold",
        fontSize=24,
        leading=28,
        textColor=DARK,
    )
    subtitle = ParagraphStyle(
        name="Subtitle",
        fontName="DejaVuSans",
        fontSize=11,
        leading=16,
        textColor=GRAY,
        spaceAfter=4,
    )
    meta = ParagraphStyle(
        name="Meta",
        fontName="DejaVuSans-Bold",
        fontSize=9.5,
        leading=14,
        textColor=DARK,
    )
    small = ParagraphStyle(
        name="Small",
        fontName="DejaVuSans",
        fontSize=9,
        leading=13,
        textColor=GRAY,
    )

    story = []

    # ── Cover / header block ──────────────────────────────────────────────
    story.append(Paragraph(_sanitize_text(project.title), heading))
    story.append(Spacer(1, 4))
    story.append(Paragraph(_s(project.description, ""), subtitle))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        f"<b>Target Audience:</b> {_s(project.target_audience)}"
        f"&nbsp;&nbsp;|&nbsp;&nbsp;<b>Industry:</b> {_s(project.industry)}",
        meta,
    ))
    story.append(Paragraph(
        f"Prepared by {APP_NAME} · "
        f"{datetime.now().strftime('%d %B %Y')}",
        small,
    ))
    story.append(Spacer(1, 12))
    story.append(_verdict_banner(sections["recommendation"] or "Completed"))
    story.append(HRFlowable(width="100%", thickness=1.5, color=INDIGO, spaceBefore=14, spaceAfter=4))

    # ── Executive summary ─────────────────────────────────────────────────
    story.append(_section_title("Executive Summary"))
    story.append(_body(sections["executive_summary"] or "No summary generated."))

    if sections["key_takeaways"]:
        story.append(_label("Key Strategic Takeaways"))
        for takeaway in sections["key_takeaways"]:
            story.append(_bullet(takeaway))

    if sections["partial"]:
        story.append(Paragraph(
            "This report is partial — one or more analysis agents could not "
            "complete. Missing sections are shown as 'No data available'.",
            ParagraphStyle(
                name="PartialNote",
                fontName="DejaVuSans-Oblique",
                fontSize=9.5,
                leading=13,
                textColor=AMBER,
                spaceBefore=6,
            ),
        ))

    # ── Market research ───────────────────────────────────────────────────
    story.append(KeepTogether([
        _section_title("Market Research"),
        _label("Target Market"),
        _body(market.get("target_market")),
    ]))

    market_size = market.get("market_size") if isinstance(market.get("market_size"), dict) else {}
    tam_cell = ParagraphStyle(
        name="TamLabel", fontName="DejaVuSans-Bold", fontSize=9.5, leading=13,
        alignment=TA_CENTER,
    )
    tam_value = ParagraphStyle(
        name="TamValue", fontName="DejaVuSans-Bold", fontSize=14, leading=17,
        textColor=DARK, alignment=TA_CENTER,
    )
    tam_table = Table(
        [
            [
                Paragraph(f"TAM<br/>{_s(market_size.get('tam'))}", tam_cell),
                Paragraph(f"SAM<br/>{_s(market_size.get('sam'))}", tam_cell),
                Paragraph(f"SOM<br/>{_s(market_size.get('som'))}", tam_cell),
            ],
        ],
        colWidths=[58 * mm] * 3,
    )
    tam_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#d1d5db")),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#d1d5db")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(KeepTogether([
        _label("Market Size (TAM / SAM / SOM)"),
        tam_table,
    ]))

    if market.get("trends"):
        story.append(_label("Industry Growth Trends"))
        for trend in _list(market.get("trends")):
            story.append(_bullet(trend))

    # ── Competitor analysis ───────────────────────────────────────────────
    story.append(KeepTogether([
        _section_title("Competitor Analysis"),
        _label("Direct Incumbents"),
        _tag_table(_list(competitor.get("direct_competitors")), tag_color=RED),
        _label("Indirect Alternatives"),
        _tag_table(_list(competitor.get("indirect_competitors")), tag_color=AMBER),
        _label("Unfair Differentiators & Moat"),
        _tag_table(_list(competitor.get("differentiators")), tag_color=EMERALD),
    ]))

    # ── Risk assessment ───────────────────────────────────────────────────
    story.append(_section_title("Risk Assessment"))
    story.append(_label("Technical Feasibility Risks"))
    story.append(_tag_table(_list(risk.get("technical_risks")), tag_color=RED))
    story.append(_label("Market Adoption Risks"))
    story.append(_tag_table(_list(risk.get("market_risks")), tag_color=AMBER))
    story.append(_label("Execution & Regulatory Risks"))
    story.append(_tag_table(_list(risk.get("execution_risks")), tag_color=INDIGO))
    if risk.get("mitigation_strategies"):
        story.append(_label("Mitigation Strategy Roadmap"))
        for strat in _list(risk.get("mitigation_strategies")):
            story.append(_bullet(strat))

    doc.build(
        story,
        onFirstPage=_FooterCanvas(project.title),
        onLaterPages=_FooterCanvas(project.title),
    )
    return buffer.getvalue()
