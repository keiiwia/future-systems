let port, reader;
let sensorState = 0;

document.getElementById("connect").addEventListener("click", async () => {
  if (!("serial" in navigator)) {
    alert("Web Serial not supported.");
    return;
  }

  //select port 
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });

  const decoder = new TextDecoderStream();
  port.readable.pipeTo(decoder.writable);
  reader = decoder.readable.getReader();

  readLoop();
});

async function readLoop() {
  let status = document.getElementById("status");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    if (value) {
      const lines = value.trim().split("\n");
      for (let line of lines) {
        line = line.trim();
        if (line === "0" || line === "1") {
          sensorState = Number(line);

          // update DOM 
          if (sensorState === 1) {
            status.textContent = "LIGHT ON";
            status.style.color = "yellow";
            document.body.style.background = "#333";
          } else {
            status.textContent = "LIGHT OFF";
            status.style.color = "white";
            document.body.style.background = "#111";
          }
        }
      }
    }
  }
}
