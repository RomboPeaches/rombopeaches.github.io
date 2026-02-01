// Elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const resultDiv = document.getElementById("result");
const historyList = document.getElementById("history");

// Load history from localStorage (offline persistence)
let history = JSON.parse(localStorage.getItem("qr-history") || "[]");
renderHistory();

// Register service worker for offline
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

// Start scanning
startBtn.onclick = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera not supported on this device/browser.");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  video.srcObject = stream;
  video.play();

  requestAnimationFrame(scanFrame);
};


// Scan loop
// Add a small status div in index.html, above the result div
// <div id="status"></div>
const statusDiv = document.getElementById("status");

function scanFrame() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
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
    // Fallback to jsQR
    else if (typeof jsQR !== "undefined") {
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        detected = true;
        handleResult(code.data);
      } else {
        statusDiv.textContent = "No QR detected (jsQR)";
      }
    } 
    else {
      statusDiv.textContent = "No QR library available";
    }

    console.log("Frame processed, detected:", detected);
  }

  requestAnimationFrame(scanFrame);
}

function handleResult(text) {
  // Show result in UI
  resultDiv.innerHTML = makeClickable(text);

  // Log for debugging
  console.log("QR detected:", text);
  statusDiv.textContent = "QR detected!";

  // Save to history
  history.unshift(text);
  history = history.slice(0, 20); // limit size
  localStorage.setItem("qr-history", JSON.stringify(history));
  renderHistory();
}


// Render offline history
function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = makeClickable(item);
    historyList.appendChild(li);
  });
}

// Auto-link URLs
function makeClickable(text) {
  if (text.startsWith("http")) {
    return `<a href="${text}" target="_blank">${text}</a>`;
  }
  return text;
}
