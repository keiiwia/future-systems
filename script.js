let port;
let reader;

const NUM_SENSORS = 11;
let sensorStates = new Array(NUM_SENSORS).fill(0);

const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connect-btn");

// Collect popup elements
const popups = [];
for (let i = 0; i < NUM_SENSORS; i++) {
  const popup = document.getElementById(`popup-${i}`);
  if (popup) popups.push(popup);
  else console.warn(`Popup missing: popup-${i}`);
}

connectBtn.addEventListener("click", async () => {
  if (!("serial" in navigator)) {
    alert("Web Serial API not supported in this browser. Use Chrome/Edge.");
    return;
  }

  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    statusEl.textContent = "Connected. Waiting for data…";

    const textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    const readableStream = textDecoder.readable;
    reader = readableStream.getReader();

    readLoop();
  } catch (err) {
    console.error("Serial error:", err);
    statusEl.textContent = "Connection failed.";
  }
});

async function readLoop() {
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

function handleLine(line) {
  // LOG RAW SERIAL INPUT
  console.log("%cRAW from Arduino:", "color: cyan; font-weight: bold;", line);

  const parts = line.split(",");
  console.log("Parsed parts:", parts);

  if (parts.length < NUM_SENSORS) {
    console.warn("Unexpected line:", line);
    return;
  }

  // Parse 0/1 values
  for (let i = 0; i < NUM_SENSORS; i++) {
    const val = Number(parts[i]);
    if (val === 0 || val === 1) {
      sensorStates[i] = val;
    } else {
      console.warn(`Invalid sensor value at index ${i}:`, parts[i]);
    }
  }

  // LOG UPDATED SENSOR STATES
  console.log(
    "%cSensor States:",
    "color: magenta; font-weight: bold;",
    sensorStates
  );

  updateVisuals();
}

function updateVisuals() {
  statusEl.textContent = `Sensors: ${sensorStates.join(", ")}`;

  for (let i = 0; i < NUM_SENSORS; i++) {
    const popup = popups[i];
    if (!popup) continue;

    const curr = sensorStates[i];

    // LOG DECISIONS
    console.log(
      `Sensor ${i}: ${curr === 1 ? "COVERED (SHOW)" : "UNCOVERED (HIDE)"}`
    );

    if (curr === 1) {
      popup.style.display = "flex";
    } else {
      popup.style.display = "none";
    }
  }
}
