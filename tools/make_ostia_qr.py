from reportlab.graphics import renderSVG
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib.colors import HexColor
from PIL import Image, ImageDraw, ImageFont


URL = "https://miljenka-prompt.github.io/Rimski-termopolij/ostia.html?lang=it"
OUT = "assets/ostia-antica-qr-card.svg"

width, height = 900, 1120
drawing = Drawing(width, height)
drawing.add(Rect(0, 0, width, height, rx=42, ry=42, fillColor=HexColor("#170d08"), strokeColor=None))
drawing.add(String(450, 1022, "OSTIA ANTICA · STRATO VIVO", textAnchor="middle",
                   fontName="Helvetica-Bold", fontSize=29, fillColor=HexColor("#f2bb7c")))
drawing.add(String(450, 968, "UN THERMOPOLIUM VIVO NELLO SPAZIO REALE", textAnchor="middle",
                   fontName="Helvetica-Bold", fontSize=24, fillColor=HexColor("#f8ecdf")))

widget = qr.QrCodeWidget(URL)
size = 610
widget.barFillColor = HexColor("#1b100b")
widget.barLevel = "H"
widget.barWidth = size
widget.barHeight = size
widget.x = 145
widget.y = 300
drawing.add(Rect(115, 270, 670, 670, rx=28, ry=28, fillColor=HexColor("#fffaf3"), strokeColor=None))
drawing.add(widget)

drawing.add(String(450, 218, "Scansiona il codice oppure apri il link:", textAnchor="middle",
                   fontName="Helvetica", fontSize=22, fillColor=HexColor("#d9c6b3")))
drawing.add(String(450, 174, "miljenka-prompt.github.io/Rimski-termopolij/ostia.html", textAnchor="middle",
                   fontName="Helvetica-Bold", fontSize=19, fillColor=HexColor("#f8ecdf")))
drawing.add(String(450, 94, "Concept, authorship & creative direction: Miljenka Ćurković", textAnchor="middle",
                   fontName="Helvetica", fontSize=18, fillColor=HexColor("#d9c6b3")))
drawing.add(String(450, 61, "AI architecture & development collaborator: ChatGPT — OpenAI", textAnchor="middle",
                   fontName="Helvetica", fontSize=16, fillColor=HexColor("#a99582")))

renderSVG.drawToFile(drawing, OUT)

# Raster card for email attachments and messaging apps.
canvas = Image.new("RGB", (width, height), "#170d08")
pen = ImageDraw.Draw(canvas)
regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def centered(text, y, font_path, font_size, color):
    font = ImageFont.truetype(font_path, font_size)
    box = pen.textbbox((0, 0), text, font=font)
    pen.text(((width - (box[2] - box[0])) / 2, y), text, font=font, fill=color)

centered("OSTIA ANTICA · STRATO VIVO", 72, bold, 29, "#f2bb7c")
centered("UN THERMOPOLIUM VIVO NELLO SPAZIO REALE", 125, bold, 24, "#f8ecdf")

matrix_qr = qr.QrCodeWidget(URL)
matrix_qr.qr.errorCorrectLevel = 2  # H
matrix_qr.qr.make()
modules = matrix_qr.qr.modules
count = matrix_qr.qr.moduleCount
quiet = 4
box_size = 10
qr_size = (count + quiet * 2) * box_size
qr_image = Image.new("RGB", (qr_size, qr_size), "#fffaf3")
qr_pen = ImageDraw.Draw(qr_image)
for row, values in enumerate(modules):
    for col, dark in enumerate(values):
        if dark:
            x = (col + quiet) * box_size
            y = (row + quiet) * box_size
            qr_pen.rectangle((x, y, x + box_size - 1, y + box_size - 1), fill="#1b100b")
canvas.paste(qr_image, ((width - qr_size) // 2, 235))

centered("Scansiona il codice oppure apri il link:", 835, regular, 22, "#d9c6b3")
centered("miljenka-prompt.github.io/Rimski-termopolij/ostia.html", 880, bold, 19, "#f8ecdf")
centered("Concept, authorship & creative direction: Miljenka Ćurković", 1005, regular, 18, "#d9c6b3")
centered("AI architecture & development collaborator: ChatGPT — OpenAI", 1043, regular, 16, "#a99582")
canvas.save(OUT.replace(".svg", ".png"), optimize=True)