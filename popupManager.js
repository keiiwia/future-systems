//handles popup positions + visibility
const POPUP_PADDING = 20; // min distance between popups (collision) – retained for future use

let popups = [];
let popupPositions = new Map(); // map of popup index to {x, y, width, height}
let statusEl = null;

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
}

/**
 * calculate a centered position for a popup 
 * @param {HTMLElement} popupElement - dom element
 * @param {number} popupIndex - index of the popup correlated to specific screen/popup
 * @returns {Object|null} fallback
 */
function getRandomPosition(popupElement, popupIndex) {
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

  // center the popup within the visible CRT area (entire viewport)
  const x = Math.max(0, (windowWidth - popupWidth) / 2);
  const y = Math.max(0, (windowHeight - popupHeight) / 2);
  return { x, y, width: popupWidth, height: popupHeight };
}

/**
 * update states
 * @param {Array<number>} sensorStates - Array of sensor states (0 or 1)
 */
function updatePopups(sensorStates) {
  if (!statusEl) return;
  
  statusEl.textContent = `Sensors: ${sensorStates.join(", ")}`;

  for (let i = 0; i < sensorStates.length && i < popups.length; i++) {
    const popup = popups[i];
    if (!popup) continue;

    const curr = sensorStates[i];
    console.log(
      `Sensor ${i}: ${curr === 1 ? "COVERED (HIDE)" : "UNCOVERED (SHOW)"}`
    );

    if (curr === 1) {
      popup.style.display = "none";  // Hide when covered
      popupPositions.delete(i); // Remove from position tracking
    } else {
      const wasHidden = popup.style.display === 'none' || !popupPositions.has(i); // if uncovered
      
      if (wasHidden) {
        const position = getRandomPosition(popup, i);
        if (position) {
          popup.style.left = `${position.x}px`;
          popup.style.top = `${position.y}px`;
          popup.style.display = "block";
          popupPositions.set(i, position);
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

