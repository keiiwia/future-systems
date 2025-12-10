//handles popup positions + visibility
const POPUP_PADDING = 20; // min distance between popups (collision)

let popups = [];
let popupPositions = new Map(); // map of popup index to {x, y, width, height, cellKey}
let statusEl = null;
const allowedCells = [];

//allowed grid cells (1-based)
for (let col = 3; col <= 4; col++) {
  for (let row = 2; row <= 3; row++) {
    allowedCells.push({ col, row });
  }
}

/**
 * @param {number} numSensors - num of sensors/popups
 * @param {HTMLElement} statusElement - status display element
 */
function initPopupManager(numSensors, statusElement) {
  statusEl = statusElement;
  popups = [];
  for (let i = 0; i < numSensors; i++) {
    const popup = document.getElementById(`popup-${i}`);
    if (popup) popups.push(popup);
    else console.warn(`Popup missing: popup-${i}`);
  }
  window.addEventListener("resize", recalcPopupPositions);
}
/**
 * calculate a centered position for a popup 
 * @param {HTMLElement} popupElement - dom element
 * @param {number} popupIndex - index of the popup correlated to specific screen/popup
 * @param {Set<string>} usedCells - set of occupied cell keys for this update pass
 * @returns {Object|null} fallback
 */
function getRandomPosition(popupElement, popupIndex, usedCells) {
  const popupContent = popupElement.querySelector('.popup-content');
  if (!popupContent) return null;
  
  //temp
  const wasVisible = popupElement.style.display !== 'none';
  if (!wasVisible) {
    popupElement.style.visibility = 'hidden';
    popupElement.style.display = 'block';
    popupElement.style.left = '-9999px';
    popupElement.style.top = '-9999px';
  }
  
  const popupRect = popupContent.getBoundingClientRect();
  const popupWidth = popupRect.width;
  const popupHeight = popupRect.height;
  
  if (!wasVisible) {
    popupElement.style.display = 'none';
    popupElement.style.visibility = '';
    popupElement.style.left = '';
    popupElement.style.top = '';
  }
  
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  //body-grid-template-columns: repeat(8, 1fr);
  const cols = 8;
  const rows = 8;
  const colWidth = windowWidth / cols;
  const rowHeight = windowHeight / rows;

  // restricted to 1-based indexing (col 3-7, row 2-6)
  const available = allowedCells.filter(
    ({ col, row }) => !usedCells.has(`${col},${row}`)
  );
  const choice = available.length
    ? available[Math.floor(Math.random() * available.length)]
    : allowedCells[Math.floor(Math.random() * allowedCells.length)];

  const randCol = choice.col;
  const randRow = choice.row;

  //center the popup within the chosen cell
  let x = (randCol - 1) * colWidth + (colWidth - popupWidth) / 2;
  let y = (randRow - 1) * rowHeight + (rowHeight - popupHeight) / 2;

  //avoid overflow
  x = Math.max(0, Math.min(x, windowWidth - popupWidth));
  y = Math.max(0, Math.min(y, windowHeight - popupHeight));
  return { x, y, width: popupWidth, height: popupHeight, cellKey: `${randCol},${randRow}` };
}

function recalcPopupPositions() { //CHECK NECESSITY
  if (!popups.length) return;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const cols = 8;
  const rows = 8;
  const colWidth = windowWidth / cols;
  const rowHeight = windowHeight / rows;

  popupPositions.forEach((pos, idx) => {
    const popup = popups[idx];
    if (!popup || !pos || !pos.cellKey) return;
    if (popup.style.display === "none") return;

    const [col, row] = pos.cellKey.split(",").map(Number);
    const popupContent = popup.querySelector(".popup-content");
    const rect = popupContent ? popupContent.getBoundingClientRect() : { width: pos.width, height: pos.height };
    const popupWidth = rect.width || pos.width || 0;
    const popupHeight = rect.height || pos.height || 0;

    let x = (col - 1) * colWidth + (colWidth - popupWidth) / 2;
    let y = (row - 1) * rowHeight + (rowHeight - popupHeight) / 2;

    x = Math.max(0, Math.min(x, windowWidth - popupWidth));
    y = Math.max(0, Math.min(y, windowHeight - popupHeight));

    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    popupPositions.set(idx, { ...pos, x, y, width: popupWidth, height: popupHeight });
  });
}

/**
 * update states
 * @param {Array<number>} sensorStates - array of sensor states (0 or 1)
 */
function updatePopups(sensorStates) {
  if (!statusEl) return;
  
  statusEl.textContent = `Sensors: ${sensorStates.join(", ")}`;

  // track used cells per render pass to avoid overlaps
  const usedCells = new Set();
  popupPositions.forEach((pos) => {
    if (pos && pos.cellKey) usedCells.add(pos.cellKey);
  });

  for (let i = 0; i < sensorStates.length && i < popups.length; i++) {
    const popup = popups[i];
    if (!popup) continue;

    const curr = sensorStates[i];
    console.log(
      `Sensor ${i}: ${curr === 1 ? "COVERED (HIDE)" : "UNCOVERED (SHOW)"}`
    );

    if (curr === 1) {
      popup.style.display = "none"; 
      popupPositions.delete(i); // remove from position tracking
    } else {
      const wasHidden = popup.style.display === 'none' || !popupPositions.has(i); // if uncovered
      
      if (wasHidden) {
        const position = getRandomPosition(popup, i, usedCells);
        if (position) {
          popup.style.left = `${position.x}px`;
          popup.style.top = `${position.y}px`;
          popup.style.display = "block";
          popupPositions.set(i, position);
          if (position.cellKey) usedCells.add(position.cellKey);
        } else {
          popup.style.display = "block";
        }
      } else {
        popup.style.display = "block"; //!imp
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initPopupManager,
    updatePopups
  };
}

