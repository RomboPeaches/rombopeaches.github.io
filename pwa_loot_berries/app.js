let deferredPrompt;

const installBtn = document.getElementById("installBtn");
const shareBtn = document.getElementById("shareBtn");

installBtn.style.display = "none";

/* PWA Install */
window.addEventListener("beforeinstallprompt", (e) => {

  e.preventDefault();
  deferredPrompt = e;

  installBtn.style.display = "inline-block";

});

installBtn.addEventListener("click", async () => {

  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("App installed");
  }

  deferredPrompt = null;

});

/* Share Button */

shareBtn.addEventListener("click", async () => {

  if (navigator.share) {

    try {
      await navigator.share({
        title: "Minimal PWA",
        text: "Check this app",
        url: window.location.href
      });
    } catch (err) {
      console.log(err);
    }

  } else {

    alert("Sharing wird auf diesem Gerät nicht unterstützt.");

  }

});

/* Service Worker */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}