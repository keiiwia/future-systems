//digital simulation mode - manual sensor state control
let simulatedSensorStates = [];
let onSimulationUpdateCallback = null;
let simulationContainer = null;

/**
 * init simulation mode
 * @param {number} numSensors - number of sensors
 * @param {HTMLElement} container - container element for simulation UI
 */
function initSimulation(numSensors, container) {
  simulationContainer = container;
  simulatedSensorStates = new Array(numSensors).fill(1); // start all sensors at 1 (covered/hidden)
  
  // create simulation UI
  createSimulationUI(numSensors);
  
  // initial update
  if (onSimulationUpdateCallback) {
    onSimulationUpdateCallback(simulatedSensorStates);
  }
}

/**
 * create simulation UI with toggle buttons for each sensor
 * @param {number} numSensors - number of sensors
 */
function createSimulationUI(numSensors) {
  if (!simulationContainer) return;
  
  simulationContainer.innerHTML = '';
  
  const title = document.createElement('h3');
  title.textContent = 'Simulation Mode';
  title.style.margin = '0 0 16px 0';
  title.style.color = '#eee';
  simulationContainer.appendChild(title);
  
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  grid.style.gap = '12px';
  grid.style.width = '100%';
  grid.style.maxWidth = '400px';
  
  for (let i = 0; i < numSensors; i++) {
    const button = document.createElement('button');
    button.textContent = `Sensor ${i + 1}`;
    button.dataset.sensorIndex = i;
    button.className = 'sim-sensor-btn';
    button.style.padding = '12px 16px';
    button.style.border = '2px solid #444';
    button.style.background = '#222';
    button.style.color = '#eee';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.transition = 'all 0.2s';
    
    // update button appearance based on state
    updateButtonStyle(button, simulatedSensorStates[i]);
    
    button.addEventListener('click', () => {
      toggleSensor(i);
    });
    
    grid.appendChild(button);
  }
  
  simulationContainer.appendChild(grid);
}

/**
 * toggle a sensor state (0 <-> 1)
 * @param {number} sensorIndex - index of sensor to toggle
 */
function toggleSensor(sensorIndex) {
  simulatedSensorStates[sensorIndex] = simulatedSensorStates[sensorIndex] === 0 ? 1 : 0;
  
  // update button style
  const button = simulationContainer.querySelector(`[data-sensor-index="${sensorIndex}"]`);
  if (button) {
    updateButtonStyle(button, simulatedSensorStates[sensorIndex]);
  }
  
  // notify callback
  if (onSimulationUpdateCallback) {
    onSimulationUpdateCallback([...simulatedSensorStates]);
  }
}

/**
 * update button visual style based on sensor state
 * @param {HTMLElement} button - button element
 * @param {number} state - sensor state (0 or 1)
 */
function updateButtonStyle(button, state) {
  if (state === 1) {
    // covered (popup hidden)
    button.style.background = '#444';
    button.style.borderColor = '#666';
    button.style.opacity = '0.6';
  } else {
    // uncovered (popup shown)
    button.style.background = '#333';
    button.style.borderColor = '#555';
    button.style.opacity = '1';
  }
}

/**
 * register callback for simulation updates
 * @param {Function} callback - callback function that receives sensorStates array
 */
function onSimulationUpdate(callback) {
  onSimulationUpdateCallback = callback;
}

/**
 * get current simulated sensor states
 * @returns {Array<number>} array of sensor states (0 or 1)
 */
function getSimulatedStates() {
  return [...simulatedSensorStates];
}

/**
 * reset all sensors to 1 (covered/hidden)
 */
function resetSimulation() {
  simulatedSensorStates.fill(1);
  createSimulationUI(simulatedSensorStates.length);
  if (onSimulationUpdateCallback) {
    onSimulationUpdateCallback([...simulatedSensorStates]);
  }
}

// export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initSimulation,
    onSimulationUpdate,
    getSimulatedStates,
    resetSimulation
  };
}

