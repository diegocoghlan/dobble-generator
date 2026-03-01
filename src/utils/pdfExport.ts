import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { Placement } from '../context/AppContext'

// ─── Print-safe constants (A4 standard) ─────────────────────────────────────
/** Page size: A4 (210 × 297 mm). */
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297

/** Safe zone on all four sides: no content here (hardware margins). ~0.6 inch. */
const SAFE_MARGIN_MM = 15

/** Gap between cards so the user doesn't cut into a neighboring card. */
const GUTTER_MM = 2

/** Diameter of each circular card (mm). Used to compute grid capacity. */
const CARD_DIAMETER_MM = 87

const DPI = 300
const MM_TO_PX = DPI / 25.4

/** Available area inside safe margins. */
const AVAILABLE_WIDTH_MM = PAGE_WIDTH_MM - SAFE_MARGIN_MM * 2
const AVAILABLE_HEIGHT_MM = PAGE_HEIGHT_MM - SAFE_MARGIN_MM * 2

/** Dynamic grid: how many cards fit per row/column. */
const COLS = Math.floor(AVAILABLE_WIDTH_MM / (CARD_DIAMETER_MM + GUTTER_MM))
const ROWS = Math.floor(AVAILABLE_HEIGHT_MM / (CARD_DIAMETER_MM + GUTTER_MM))
const CARDS_PER_PAGE = COLS * ROWS

/** Auto-centering: grid total size and offsets so the grid is centered on the page. */
const GRID_CELL_MM = CARD_DIAMETER_MM + GUTTER_MM
const GRID_TOTAL_WIDTH_MM = COLS * GRID_CELL_MM
const GRID_TOTAL_HEIGHT_MM = ROWS * GRID_CELL_MM
const X_OFFSET_MM = (PAGE_WIDTH_MM - GRID_TOTAL_WIDTH_MM) / 2
const Y_OFFSET_MM = (PAGE_HEIGHT_MM - GRID_TOTAL_HEIGHT_MM) / 2

/** Pixel equivalents for DOM rendering (A4 at 300 dpi). */
const PAGE_WIDTH_PX = Math.round(PAGE_WIDTH_MM * MM_TO_PX)
const PAGE_HEIGHT_PX = Math.round(PAGE_HEIGHT_MM * MM_TO_PX)
const SAFE_MARGIN_PX = SAFE_MARGIN_MM * MM_TO_PX
const CARD_DIAMETER_PX = CARD_DIAMETER_MM * MM_TO_PX
const CARD_RADIUS_PX = CARD_DIAMETER_PX / 2
const GUTTER_PX = GUTTER_MM * MM_TO_PX
const GRID_CELL_PX = CARD_DIAMETER_PX + GUTTER_PX
const X_OFFSET_PX = X_OFFSET_MM * MM_TO_PX
const Y_OFFSET_PX = Y_OFFSET_MM * MM_TO_PX

const PREVIEW_RADIUS = 100
/** Padding interior de la carta para que las imágenes no toquen el borde */
const CARD_INNER_PADDING_MM = 2
const CARD_INNER_PADDING_PX = CARD_INNER_PADDING_MM * MM_TO_PX
const CARD_INNER_DIAMETER_PX = CARD_DIAMETER_PX - 2 * CARD_INNER_PADDING_PX

/** Content area (inside safe margins): used for white background only. */
const CONTENT_LEFT_PX = SAFE_MARGIN_PX
const CONTENT_TOP_PX = SAFE_MARGIN_PX
const CONTENT_WIDTH_PX = PAGE_WIDTH_PX - SAFE_MARGIN_PX * 2
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - SAFE_MARGIN_PX * 2

function getCardPositionOnPage(
  cardIndex: number
): { pageIndex: number; col: number; row: number } {
  const indexOnPage = cardIndex % CARDS_PER_PAGE
  const col = indexOnPage % COLS
  const row = Math.floor(indexOnPage / COLS)
  const pageIndex = Math.floor(cardIndex / CARDS_PER_PAGE)
  return { pageIndex, col, row }
}

function createPrintStage(): HTMLDivElement {
  const stage = document.createElement('div')
  stage.setAttribute('data-pdf-print-stage', 'true')
  Object.assign(stage.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    width: `${PAGE_WIDTH_PX}px`,
    height: `${PAGE_HEIGHT_PX}px`,
    backgroundColor: 'transparent',
    color: '#000000',
    overflow: 'hidden',
  })
  document.body.appendChild(stage)
  return stage
}

/** Card center in px using the centered grid (col/row in grid cells). */
function getCardCenterPx(cardIndex: number): { centerX: number; centerY: number } {
  const { col, row } = getCardPositionOnPage(cardIndex)
  const centerX = X_OFFSET_PX + GRID_CELL_PX * (col + 0.5)
  const centerY = Y_OFFSET_PX + GRID_CELL_PX * (row + 0.5)
  return { centerX, centerY }
}

/**
 * Render one page (6 cards) into the fixed-size stage using the same wrapper+img
 * pattern as CardPreview: wrapper has border-radius:50%, overflow:hidden, white background;
 * img uses object-fit:contain so the full image is visible and readable inside each token.
 */
function renderPageToStage(
  stage: HTMLDivElement,
  pageIndex: number,
  images: string[],
  layoutByCard: Placement[][],
  cardData: number[][]
): void {
  stage.innerHTML = ''
  const contentArea = document.createElement('div')
  contentArea.setAttribute('data-pdf-content-area', 'true')
  Object.assign(contentArea.style, {
    position: 'absolute',
    left: `${CONTENT_LEFT_PX}px`,
    top: `${CONTENT_TOP_PX}px`,
    width: `${CONTENT_WIDTH_PX}px`,
    height: `${CONTENT_HEIGHT_PX}px`,
    backgroundColor: '#ffffff',
  })
  stage.appendChild(contentArea)
  const scale = CARD_INNER_DIAMETER_PX / (PREVIEW_RADIUS * 2)

  for (let i = 0; i < CARDS_PER_PAGE; i++) {
    const cardIndex = pageIndex * CARDS_PER_PAGE + i
    if (cardIndex >= cardData.length) break

    const { centerX, centerY } = getCardCenterPx(cardIndex)
    const placements = layoutByCard[cardIndex] ?? []

    const cardEl = document.createElement('div')
    Object.assign(cardEl.style, {
      position: 'absolute',
      left: `${centerX - CARD_RADIUS_PX}px`,
      top: `${centerY - CARD_RADIUS_PX}px`,
      width: `${CARD_DIAMETER_PX}px`,
      height: `${CARD_DIAMETER_PX}px`,
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      border: '1px dashed #333',
      boxSizing: 'border-box',
    })
    stage.appendChild(cardEl)

    for (let j = 0; j < placements.length; j++) {
      const p = placements[j]
      const src = images[p.imageIndex]
      if (!src) continue

      const size = Math.max(p.width, p.height) * scale
      const left = centerX + p.x * scale - size / 2 - (centerX - CARD_RADIUS_PX)
      const top = centerY + p.y * scale - size / 2 - (centerY - CARD_RADIUS_PX)

      const wrapper = document.createElement('div')
      Object.assign(wrapper.style, {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${p.rotation}deg)`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        border: '1px solid #eee',
        ...(p.zIndex != null && { zIndex: String(p.zIndex) }),
      })
      const img = document.createElement('img')
      img.src = src
      img.alt = ''
      Object.assign(img.style, {
        width: '85%',
        height: '85%',
        objectFit: 'contain',
        display: 'block',
        imageRendering: 'crisp-edges',
      })
      wrapper.appendChild(img)
      cardEl.appendChild(wrapper)
    }
  }
}

function waitForImagesInStage(stage: HTMLDivElement): Promise<void> {
  const imgs = stage.querySelectorAll('img')
  if (imgs.length === 0) return Promise.resolve()
  return Promise.all(
    Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve()
          else {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }
        })
    )
  ).then(() => {})
}

/**
 * Generates the deck PDF and returns a Blob URL for preview (does not download).
 * Caller is responsible for revoking the URL when done (e.g. when closing the modal).
 */
export async function exportDeckToPdf(
  images: string[],
  layoutByCard: Placement[][],
  cardData: number[][]
): Promise<string> {
  const totalPages = Math.ceil(cardData.length / CARDS_PER_PAGE)
  const stage = createPrintStage()

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      renderPageToStage(stage, pageIndex, images, layoutByCard, cardData)
      await waitForImagesInStage(stage)

      const canvas = await html2canvas(stage, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: PAGE_WIDTH_PX,
        height: PAGE_HEIGHT_PX,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      if (pageIndex > 0) doc.addPage()
      doc.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM)
    }

    const url = doc.output('bloburl')
    return typeof url === 'string' ? url : url.toString()
  } finally {
    stage.remove()
  }
}
