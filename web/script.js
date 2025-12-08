//init hardware comm + popup manager + simulation
//register callback to update popups when sensor states change
//handle mode switching between hardware and simulation

//dom
document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById("status");
  const connectBtn = document.getElementById("connect-btn");
  const modeToggle = document.getElementById("mode-toggle");
  const hardwareControls = document.getElementById("hardware-controls");
  const simulationControls = document.getElementById("simulation-controls");

  const numSensors = window.NUM_SENSORS;
  let currentMode = 'hardware'; // 'hardware' or 'simulation'

  //popup manager (NUM_SENSORS in hardware.js)
  initPopupManager(numSensors, statusEl);

  //hardware connection
  initHardware(connectBtn, statusEl);

  //simulation init
  initSimulation(numSensors, simulationControls);

  //register hardware callback
  onSensorUpdate((sensorStates) => {
    if (currentMode === 'hardware') {
      updatePopups(sensorStates);
    }
  });

  //register simulation callback
  onSimulationUpdate((sensorStates) => {
    if (currentMode === 'simulation') {
      updatePopups(sensorStates);
      statusEl.textContent = `Simulation: ${sensorStates.join(", ")}`;
    }
  });

  //mode toggle handler
  modeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      // switch to simulation mode
      currentMode = 'simulation';
      hardwareControls.style.display = 'none';
      simulationControls.style.display = 'block';
      statusEl.textContent = 'Simulation Mode Active';
      
      // trigger initial simulation update
      const simStates = getSimulatedStates();
      updatePopups(simStates);
      statusEl.textContent = `Simulation: ${simStates.join(", ")}`;
    } else {
      // switch to hardware mode
      currentMode = 'hardware';
      hardwareControls.style.display = 'block';
      simulationControls.style.display = 'none';
      statusEl.textContent = 'Hardware Mode Active';
    }
  });
});
