"""Derive the Spanish BDD page and front covers from the released V2 package."""
import hashlib
import json
from pathlib import Path
import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = Path('C:/AETERNUS/01_SAEULE_I_ANTHRAZIT_WELTLITERATUR/BDD_BERNAL_DIAZ_DEL_CASTILLO/BDD_001_BERNAL_DIAZ')
PACKAGES = WORK / '07_EXPORT/BDD001_ES_INGRAM_HC_UPLOAD_PAKET_V2_20261008'
EVIDENCE = WORK / '00_ADMIN/EVIDENZ_CODEX_INGRAM_20261008'
ASSETS = ROOT / 'src/assets/images/es'
ASSETS.mkdir(parents=True, exist_ok=True)
records = []
tomos = []
for tomo in ('I', 'II', 'III'):
    package = PACKAGES / f'BDD001_ES_TOMO_{tomo}_INGRAM_HC_V2_20261008'
    metadata_path = package / 'METADATEN/ingram_hardcover.json'
    meta = json.loads(metadata_path.read_text(encoding='utf-8'))
    pdf = package / meta['product']['cover_file']
    digest = hashlib.sha256(pdf.read_bytes()).hexdigest()
    assert digest == meta['cover_sha256']
    pages = meta['product']['pages']
    template = WORK / f'07_EXPORT/INGRAM_HC_20261008/VORLAGEN/records_compiled/records/INGRAMSPARK.HC.6X9.{pages}.BW.CREME.PDFX1A.20261008.json'
    geometry = json.loads(template.read_text(encoding='utf-8'))['measurements']
    x, y, width, height = geometry['front_rect_in']
    document = pymupdf.open(pdf)
    page = document[0]
    # The compiled template record uses the same top-left coordinates as PyMuPDF.
    clip = pymupdf.Rect(x * 72, y * 72, (x + width) * 72, (y + height) * 72)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(3, 3), clip=clip, alpha=False,
                         colorspace=pymupdf.csRGB)
    image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    target = ASSETS / f'bdd001-tomo-{tomo.lower()}-ingram-v2-20261008.webp'
    image.save(target, 'WEBP', quality=92)
    if tomo == 'I':
        image.save(EVIDENCE / 'INSTAGRAM_BDD001_ES_PORTADA_V2.jpg', quality=95)
    records.append({'tomo': tomo, 'source': str(pdf), 'source_sha256': digest,
                    'template': str(template), 'clip_pdf_points': list(clip),
                    'target': str(target), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                    'pixels': list(image.size)})
    tomos.append(meta)

portrait_pdf = PACKAGES / 'BDD001_ES_TOMO_III_INGRAM_HC_V2_20261008/INGRAM/9783676051149_txt.pdf'
assert hashlib.sha256(portrait_pdf.read_bytes()).hexdigest() == tomos[2]['interior_sha256']
portrait_document = pymupdf.open(portrait_pdf)
portrait_page = portrait_document[354]
assert 'El cronista' in portrait_page.get_text()
portrait_images = portrait_page.get_images()
assert len(portrait_images) == 1
portrait_xref = portrait_images[0][0]
portrait_data = portrait_document.extract_image(portrait_xref)
assert (portrait_data['width'], portrait_data['height']) == (978, 1307)
portrait_target = ASSETS / 'bdd001-bernal-viejo-tomo-iii-20261008.webp'
portrait_pix = pymupdf.Pixmap(portrait_document, portrait_xref)
portrait_pix = pymupdf.Pixmap(pymupdf.csRGB, portrait_pix)
Image.frombytes('RGB', (portrait_pix.width, portrait_pix.height), portrait_pix.samples).save(portrait_target, 'WEBP', quality=92)
portrait_record = {'source': str(portrait_pdf),
                   'source_sha256': tomos[2]['interior_sha256'], 'pdf_page': 355,
                   'image_xref': portrait_xref, 'pixels': [978, 1307],
                   'target': str(portrait_target),
                   'sha256': hashlib.sha256(portrait_target.read_bytes()).hexdigest()}
(EVIDENCE / 'PORTRAET_BERNAL_VIEJO_WEB_20261008.json').write_text(json.dumps(portrait_record, ensure_ascii=False, indent=2), encoding='utf-8')

lines = ['---', 'layout: layout-bdd-es.njk', 'permalink: "/es/bernal-diaz/index.html"',
         'lang: es', 'ogLocale: es_ES',
         'title: "Bernal Díaz del Castillo · Historia verdadera de la conquista de la Nueva España"',
         'description: "La Historia verdadera de la conquista de la Nueva España de Bernal Díaz del Castillo en la edición de AETERNUS: tres tomos en tapa dura, Línea Roja."', 'tomos:']
for meta in tomos:
    lines += [f'  - n: "{meta["tomo"]}"', f'    titulo: {json.dumps(meta["title"], ensure_ascii=False)}',
              f'    subtitulo: {json.dumps(meta["subtitle"], ensure_ascii=False)}',
              f'    paginas: {meta["product"]["pages"]}', f'    isbn: "{meta["product"]["isbn"]}"',
              f'    img: "/assets/images/es/bdd001-tomo-{meta["tomo"].lower()}-ingram-v2-20261008.webp"',
              '    description_html: |', '      ' + meta['description_html']]
lines += ['---', '''<section class="shell author-note author-hero" lang="es"><div><p class="kicker">AETERNUS · Línea Roja · Edición en español</p><h1>Bernal Díaz del Castillo</h1><p class="detail-subtitle"><em>Historia verdadera de la conquista de la Nueva España</em></p><p>Muchos años después, en Santiago de los Caballeros de Guatemala, volvió a formar aquella hueste con palabras. No escribió como archivero de hazañas ajenas. Había estado allí.</p><p><em>«… me he hallado en ciento y diez y nueve batallas y reencuentros de guerra …»</em><br><small>Bernal Díaz del Castillo, cap. CCXII</small></p></div><img src="/assets/images/es/bdd001-bernal-viejo-tomo-iii-20261008.webp" alt="Bernal Díaz del Castillo anciano, retrato del cronista incluido en el Tomo III" width="210" height="281"></section>

<section class="shell international-section" lang="es"><div class="section-heading"><div><p class="kicker">Tres tomos · Tapa dura</p><h2>La edición</h2></div></div><div class="books-grid">{% for t in tomos %}<article class="book-tile"><span class="book-art"><img src="{{ t.img }}" alt="Vorderdeckel" width="1296" height="1944" loading="lazy"></span><div class="book-caption"><p class="kicker"><span class="series-dot" style="--series-color:#7c1c1c"></span>Línea Roja</p><h3 class="book-card-title">{{ t.titulo }}</h3><p class="book-author">{{ t.subtitulo }} · Tapa dura · {{ t.paginas }} páginas</p><p class="book-description">ISBN {{ t.isbn }} · 34,99 €</p><div class="book-description">{{ t.description_html | safe }}</div><p class="book-description"><strong>Próximamente.</strong></p></div></article>{% endfor %}</div></section>

<section class="shell international-section prose biography-copy" lang="es"><p class="kicker">Sobre esta edición</p><h2>El texto</h2><p>Primera edición: Madrid, Imprenta del Reyno, 1632. Texto base de esta edición: <em>Verdadera historia de los sucesos de la conquista de la Nueva-España</em>, por el capitán Bernal Díaz del Castillo, tres tomos, Madrid: Imprenta de Tejado, 1862.</p><p>La presente edición reproduce íntegramente el corpus de la obra, sin supresiones deliberadas de su contenido. La intervención editorial se limita a una actualización prudente de la ortografía, la puntuación y aquellas estructuras sintácticas cuya forma antigua pudiera interponerse innecesariamente entre la voz de Bernal Díaz y el lector contemporáneo.</p><h2>Los tres tomos</h2><p>Prólogo general, nota sobre el texto, semblanza del autor y guía cronológica en el primer tomo; un umbral al comienzo del segundo y del tercero; glosario breve y epílogo al final de la obra. Láminas propias de AETERNUS acompañan los capítulos.</p><h2>Contacto</h2><p>Comentarios, correcciones y preguntas: <a href="mailto:{{ site.email }}">{{ site.email }}</a>. Programa en inglés: <a href="/">aeternuspublishing.com</a>.</p></section>'''.replace('alt="Vorderdeckel"', 'alt="Cubierta de Historia verdadera de la conquista de la Nueva España, Tomo {{ t.n }}"')]
(ROOT / 'international/es-bernal-diaz.njk').write_text('\n'.join(lines) + '\n', encoding='utf-8')
(EVIDENCE / 'PORTADAS_V2_DERIVADOS.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(records, ensure_ascii=False))
