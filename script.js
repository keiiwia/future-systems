// 3 screen states: landing (hero/title), hardware (arduino), simulation (digital bc my fuckass is NOT bringing that board home)
document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const connectBtn = document.getElementById("connect-btn");
  const modeToggle = document.getElementById("mode-toggle");
  const hardwareControls = document.getElementById("hardware-controls");
  const simulationControls = document.getElementById("simulation-controls");
  const heroGif = document.getElementById("hero-gif");
  const titleImg = document.getElementById("title-img");

  const numSensors = window.NUM_SENSORS;
  let currentState = "landing"; //start at title screen/landing page

  // popup manager (NUM_SENSORS in hardware.js)
  initPopupManager(numSensors, statusEl);

  // hardware connection
  initHardware(connectBtn, statusEl);

  // simulation init
  initSimulation(numSensors, simulationControls);

  function setState(next) {
    currentState = next;

    const isLanding = next === "landing";
    const isHardware = next === "hardware";
    const isSimulation = next === "simulation";
    const showHeroTitle = !isSimulation;
    heroGif.style.display = showHeroTitle ? "block" : "none";
    titleImg.style.display = showHeroTitle ? "block" : "none";
    hardwareControls.style.display = isSimulation ? "none" : "block";
    simulationControls.style.display = isSimulation ? "block" : "none";
    modeToggle.checked = isSimulation;

    // status
    if (isLanding) statusEl.textContent = "Not connected";
    if (isHardware) statusEl.textContent = "Hardware Mode Active";
    if (isSimulation) statusEl.textContent = "Simulation Mode Active";
  }

  //hardware callback
  onSensorUpdate((sensorStates) => {
    if (currentState === "hardware") {
      updatePopups(sensorStates);
    }
  });

  //simulation callback
  onSimulationUpdate((sensorStates) => {
    if (currentState === "simulation") {
      updatePopups(sensorStates);
      statusEl.textContent = `Simulation: ${sensorStates.join(", ")}`;
    }
  });

  // mode toggle handler (landing + simulation/hardware switch)
  modeToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      setState("simulation");
      const simStates = getSimulatedStates();
      updatePopups(simStates);
      statusEl.textContent = `Simulation: ${simStates.join(", ")}`;
    } else {
      setState("hardware");
    }
  });

  connectBtn.addEventListener("click", () => {
    setState("hardware");
  });
  setState("landing");
});
