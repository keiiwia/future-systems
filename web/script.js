//init hardware comm + popup manager
//register callback to update popups when sensor states change

//dom
document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById("status");
  const connectBtn = document.getElementById("connect-btn");

  //popup manager (NUM_SENSORS in hardware.js)
  initPopupManager(window.NUM_SENSORS, statusEl);

  //hardware connection
  initHardware(connectBtn, statusEl);

  //register callback to update popups when sensor states change
  onSensorUpdate((sensorStates) => {
    updatePopups(sensorStates);
  });
});
