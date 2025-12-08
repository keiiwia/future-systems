//serial communication w arduino/sensors
const BAUD_RATE = 9600;

// NUM_SENSORS global
const NUM_SENSORS = 9;
window.NUM_SENSORS = NUM_SENSORS;

let port;
let reader;
let sensorStates = new Array(NUM_SENSORS).fill(0);
let onSensorUpdateCallback = null;

/**
 * init hardware connection
 * @param {HTMLElement} connectBtn
 * @param {HTMLElement} statusEl
 */
function initHardware(connectBtn, statusEl) { //connect to serial port 
  connectBtn.addEventListener("click", async () => {
    if (!("serial" in navigator)) {
      alert("Web Serial API not supported in this browser. Use Chrome/Edge.");
      return;
    }

    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: BAUD_RATE });

      statusEl.textContent = "Connected. Waiting for data…";

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const readableStream = textDecoder.readable;
      reader = readableStream.getReader();

      readLoop(statusEl);
    } catch (err) {
      console.error("Serial error:", err);
      statusEl.textContent = "Connection failed.";
    }
  });
}

/**
 * read loop for serial data
 * @param {HTMLElement} statusEl
 */
async function readLoop(statusEl) { //keep reading until disconnected
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;

      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop(); // leftover partial chunk

      for (let line of lines) {
        line = line.trim();
        if (line) handleLine(line);
      }
    }
  } catch (err) {
    console.error("Read error:", err);
    statusEl.textContent = "Disconnected.";
  }
}

/**
 * parse/process per line of sensor data
 * @param {string} line -via csv
 */
function handleLine(line) {
  //raw serial input
  console.log("%cRAW from Arduino:", "color: cyan; font-weight: bold;", line);
  const parts = line.split(",");
  console.log("Parsed parts:", parts);

  if (parts.length < NUM_SENSORS) {
    console.warn("Unexpected line:", line);
    return;
  }

  // 0/1 values
  for (let i = 0; i < NUM_SENSORS; i++) {
    const val = Number(parts[i]);
    if (val === 0 || val === 1) {
      sensorStates[i] = val;
    } else {
      console.warn(`Invalid sensor value at index ${i}:`, parts[i]);
    }
  }
  console.log(
    "%cSensor States:",
    "color: magenta; font-weight: bold;",
    sensorStates
  );

  // Notify callback of sensor state update
  if (onSensorUpdateCallback) {
    onSensorUpdateCallback(sensorStates);
  }
}

/**
 * register callback for sensor state updates
 * @param {Function} callback - callback function that receives sensorStates array
 */
function onSensorUpdate(callback) {
  onSensorUpdateCallback = callback;
}

/**
 * current sensor states
 * @returns {Array<number>} array of sensor states (0/1) 
 */
function getSensorStates() {
  return [...sensorStates]; // return copy to prevent external mutation; avoid direct mutation
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initHardware,
    onSensorUpdate,
    getSensorStates,
    NUM_SENSORS
  };
}

