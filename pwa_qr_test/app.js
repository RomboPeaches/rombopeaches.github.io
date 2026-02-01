// Elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const resultDiv = document.getElementById("result");
const historyList = document.getElementById("history");
const statusDiv = document.getElementById("status");
const overlay = document.getElementById("overlay");

// Load history from localStorage
let history = JSON.parse(localStorage.getItem("qr-history") || "[]");
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

  overlay.style.opacity = 0; // hide overlay
  resultDiv.innerHTML = "";
  statusDiv.textContent = "Scanning...";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera not supported on this device/browser.");
    return;
  }

  try {
    // Start camera
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
  if (!scanning) return; // stop if not scanning

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    // square canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let detected = false;

    // Native BarcodeDetector
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
    }
    // jsQR fallback
    else if (typeof jsQR !== "undefined") {
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

    console.log("Frame processed, detected:", detected);
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

  // Stop camera
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  // Show overlay
  overlay.style.opacity = 1;

  // Display QR content
  resultDiv.innerHTML = makeClickable(text);
  statusDiv.textContent = "QR detected! Press Start Scan to scan again.";
  console.log("QR detected:", text);

  // Save history
  history.unshift(text);
  history = history.slice(0, 20);
  localStorage.setItem("qr-history", JSON.stringify(history));
  renderHistory();
}

// Render history
function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = makeClickable(item);
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
