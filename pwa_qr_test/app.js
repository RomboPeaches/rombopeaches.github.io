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
function scanFrame() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use native API if available
    if ("BarcodeDetector" in window) {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      detector.detect(imageData).then(codes => {
        if (codes.length) handleResult(codes[0].rawValue);
      });
    } 
    // Fallback for everything else
    else {
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) handleResult(code.data);
    }
  }

  requestAnimationFrame(scanFrame);
}


// Handle detected QR
function handleResult(text) {
  resultDiv.innerHTML = makeClickable(text);

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
