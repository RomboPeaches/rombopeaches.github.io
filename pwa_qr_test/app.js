// Elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const resultDiv = document.getElementById("result");
const historyList = document.getElementById("history");
const statusDiv = document.getElementById("status");
const overlay = document.getElementById("overlay");

// Hide result initially
resultDiv.style.display = "none";

// Load history from localStorage
let history = JSON.parse(localStorage.getItem("qr-history") || "[]");

// Migration for old string entries
history = history.map(item => {
  if (typeof item === "string") {
    return { value: item, time: null };
  }
  return item;
});

renderHistory();

// Register service worker for offline
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

// Scanning control
let scanning = false;
let stream = null;

// Start scanning button
startBtn.onclick = async () => {
  if (scanning) return;

  overlay.style.opacity = 0;
  const lastResultContainer = document.getElementById("lastResultContainer");
  lastResultContainer.style.display = "none";
  resultDiv.innerHTML = "";
  statusDiv.textContent = "Scanning...";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera not supported on this device/browser.");
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = stream;
    video.play();
    scanning = true;
    requestAnimationFrame(scanFrame);
  } catch (err) {
    console.error("getUserMedia error:", err);
    alert("Failed to access camera: " + err.message);
  }
};

// Scan loop
function scanFrame() {
  if (!scanning) return;

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let detected = false;

    if ("BarcodeDetector" in window) {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      detector.detect(imageData)
        .then(codes => {
          if (codes.length > 0) {
            detected = true;
            handleResult(codes[0].rawValue);
          } else {
            statusDiv.textContent = "No QR detected (native)";
          }
        })
        .catch(err => {
          console.error("BarcodeDetector error:", err);
          statusDiv.textContent = "BarcodeDetector error, see console";
        });
    } else if (typeof jsQR !== "undefined") {
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        detected = true;
        handleResult(code.data);
        drawRect(code.location);
      } else {
        statusDiv.textContent = "No QR detected (jsQR)";
      }
    } else {
      statusDiv.textContent = "No QR library available";
    }
  }

  if (scanning) requestAnimationFrame(scanFrame);
}

// Draw rectangle around QR (jsQR)
function drawRect(location) {
  if (!location) return;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "lime";
  ctx.beginPath();
  ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
  ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
  ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
  ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
  ctx.closePath();
  ctx.stroke();
}

// Handle detected QR
function handleResult(text) {
  scanning = false;

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  overlay.style.opacity = 1;

  const lastResultContainer = document.getElementById("lastResultContainer");

  if (text && text.trim() !== "") {
    resultDiv.innerHTML = makeClickable(text);
    lastResultContainer.style.display = "block";
  } else {
    resultDiv.innerHTML = "";
    lastResultContainer.style.display = "none";
  }

  statusDiv.textContent = "QR detected! Press Start Scan to scan again.";

  if (text && text.trim() !== "") {
    history.unshift({
      value: text,
      time: new Date().toISOString()
    });

    history = history.slice(0, 20);
    localStorage.setItem("qr-history", JSON.stringify(history));
    renderHistory();
  }
}

// Render history with timestamp
function renderHistory() {
  historyList.innerHTML = "";

  history.forEach(item => {
    const li = document.createElement("li");

    const time = item.time
      ? new Date(item.time).toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false
      })
      : "";

    li.innerHTML = `
      <div style="font-size:0.75rem; color:#9aa0b3; margin-bottom:2px;">
        ${time}
      </div>
      <div>
        ${makeClickable(item.value)}
      </div>
    `;

    historyList.appendChild(li);
  });
}

// Make URLs clickable
function makeClickable(text) {
  if (text.startsWith("http")) {
    return `<a href="${text}" target="_blank">${text}</a>`;
  }
  return text;
}
