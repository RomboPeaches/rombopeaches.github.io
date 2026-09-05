const fades = new Map();
const TICK_MS = 100;

setInterval(() => {
  const now = performance.now();
  for (const [id, fade] of fades) {
    const elapsed = now - fade.startTime;
    const progress = Math.min(1, Math.max(0, elapsed / fade.duration));
    const volume = fade.from + (fade.to - fade.from) * progress;
    postMessage({ type: 'fade', id, volume, done: progress >= 1 });
    if (progress >= 1) fades.delete(id);
  }
}, TICK_MS);

onmessage = ({ data }) => {
  if (!data) return;
  if (data.type === 'start') {
    fades.set(data.id, {
      from: Number(data.from),
      to: Number(data.to),
      duration: Math.max(1, Number(data.duration)),
      startTime: performance.now()
    });
  } else if (data.type === 'cancel') {
    fades.delete(data.id);
  } else if (data.type === 'cancelAll') {
    fades.clear();
  }
};
