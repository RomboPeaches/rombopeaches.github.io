let deferredPrompt;

const installBtn = document.getElementById("installBtn");
installBtn.style.display = "none";

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const result = await deferredPrompt.userChoice;

  if (result.outcome === "accepted") {
    console.log("User installed app");
  }

  deferredPrompt = null;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
