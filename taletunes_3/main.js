const STORAGE_KEY = 'ambient-forge-v1';
const DATA_VERSION = 1;
const MAX_FADE_MS = 30000;
const worker = typeof Worker !== 'undefined' ? new Worker('volumeFadeWorker.js') : null;

let model = loadModel();
let runtimePlayers = new Map();
let playerCounter = 0;
let modalMode = null;
let toastTimer = null;
let ytReady = false;
let ytWaiters = [];

window.onYouTubeIframeAPIReady = () => {
  ytReady = true;
  ytWaiters.splice(0).forEach(resolve => resolve());
};

if (worker) worker.onmessage = handleWorkerMessage;

const $ = id => document.getElementById(id);
const groupsEl = $('groups');
const emptyState = $('emptyState');
const modalBackdrop = $('modalBackdrop');
const form = $('entityForm');

function uid(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random()}`;
}

function defaultModel() {
  return {
    version: DATA_VERSION,
    groups: [
      {
        id: uid('group'), name: 'Tavern', open: true, sounds: [
          { id: uid('sound'), name: 'Tavern ambience', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', youtubeId: 'jfKfPfyJRdk' }
        ]
      },
      { id: uid('group'), name: 'Wilderness', open: false, sounds: [] },
      { id: uid('group'), name: 'Dungeon', open: false, sounds: [] }
    ]
  };
}

function loadModel() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultModel();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== DATA_VERSION || !Array.isArray(parsed.groups)) throw new Error('Invalid data');
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return defaultModel();
  }
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(model)); }
  catch { showToast('Could not save configuration to localStorage.', true); }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);
}

function findSound(soundId) {
  for (const group of model.groups) {
    const sound = group.sounds.find(s => s.id === soundId);
    if (sound) return { sound, group };
  }
  return null;
}

function render() {
  groupsEl.innerHTML = '';
  emptyState.classList.toggle('hidden', model.groups.length > 0);
  for (const group of model.groups) renderGroup(group);
}

function renderGroup(group) {
  const section = document.createElement('section');
  section.className = `group${group.open ? '' : ' closed'}`;
  section.dataset.groupId = group.id;
  const actionButtons = group.open ? `
        <button class="icon-btn" title="Edit group" data-action="edit-group">Edit</button>
        <button class="icon-btn" title="Add sound" data-action="add-sound">+</button>
        <button class="icon-btn" title="Delete group" data-action="delete-group">×</button>
      ` : '';
  section.innerHTML = `
    <div class="group-header">
      <button class="group-toggle" data-action="toggle-group">
        <span class="chevron">⌄</span>
        <span class="group-name">${escapeHtml(group.name)}</span>
        <span class="group-count">${group.sounds.length} sound${group.sounds.length === 1 ? '' : 's'}</span>
      </button>
      <div class="group-actions">
        ${actionButtons}
      </div>
    </div>
    <div class="group-body">
      <div class="sound-grid"></div>
    </div>`;
  const grid = section.querySelector('.sound-grid');
  for (const sound of group.sounds) grid.appendChild(renderSound(sound));
  groupsEl.appendChild(section);
}

function renderSound(sound) {
  const container = document.createElement('div');
  container.className = 'sound-item';
  container.dataset.soundId = sound.id;

  const card = document.createElement('article');
  const rt = runtimePlayers.get(sound.id);
  const confirmedPlaying = !!(rt && rt.playing && Number(rt.volume || 0) > 0);
  card.className = `sound-card${confirmedPlaying ? ' playing' : ''}`;
  card.dataset.soundId = sound.id;
  card.style.backgroundImage = `url("https://i.ytimg.com/vi/${encodeURIComponent(sound.youtubeId)}/hqdefault.jpg")`;
  const statusText = !rt
    ? 'Stopped'
    : rt.fading || rt.pendingFade
      ? `Fading · ${Math.round(rt.volume || 0)}%`
      : rt.playing && Number(rt.volume || 0) > 0
        ? `${Math.round(rt.volume || 0)}% · Playing`
        : 'Stopped';
  card.innerHTML = `
    <div class="mixer-zone" data-action="mixer" title="Y = volume · X = fade speed">
      <div class="crosshair"></div>
    </div>
    <div class="sound-info">
      <div class="sound-name">${escapeHtml(sound.name)}</div>
      <div class="sound-status">${statusText}</div>
    </div>`;

  const controls = document.createElement('div');
  controls.className = 'sound-controls';
  controls.innerHTML = `
    <button class="icon-btn" data-action="edit-sound" title="Edit sound">⋯</button>
    <button class="icon-btn" data-action="delete-sound" title="Delete sound">×</button>
    <button class="icon-btn" data-action="stop-sound" title="Stop / Reset">⏹</button>`;

  container.appendChild(card);
  container.appendChild(controls);

  card.addEventListener('error', () => { card.style.backgroundImage = 'linear-gradient(135deg,#171c23,#0e1116)'; }, true);
  const mixer = card.querySelector('.mixer-zone');
  mixer.addEventListener('pointermove', e => {
    if (!card.classList.contains('playing')) return;
    updateCrosshair(card, e);
  });
  mixer.addEventListener('pointerleave', () => {
    if (!card.classList.contains('playing')) return;
    card.querySelector('.crosshair').style.opacity = '0';
  });
  mixer.addEventListener('pointerenter', () => {
    if (!card.classList.contains('playing')) return;
    card.querySelector('.crosshair').style.opacity = '1';
  });
  mixer.addEventListener('pointerdown', e => activateMixer(sound.id, e, mixer));
  return container;
}

function updateCrosshair(card, e) {
  const r = card.getBoundingClientRect();
  const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
  const y = Math.max(0, Math.min(r.height, e.clientY - r.top));
  const cross = card.querySelector('.crosshair');
  cross.style.left = `${x}px`;
  cross.style.top = `${y}px`;
  cross.style.opacity = '1';
}

function refreshCard(soundId) {
  const container = document.querySelector(`[data-sound-id="${CSS.escape(soundId)}"].sound-item`);
  const found = findSound(soundId);
  if (!container || !found) return;

  const card = container.querySelector('.sound-card');
  if (!card) return;

  const rt = runtimePlayers.get(soundId);
  const confirmedPlaying = !!(rt && rt.playing && Number(rt.volume || 0) > 0);
  card.classList.toggle('playing', confirmedPlaying);

  const statusText = !rt
    ? 'Stopped'
    : rt.fading || rt.pendingFade
      ? `Fading · ${Math.round(rt.volume || 0)}%`
      : rt.playing && Number(rt.volume || 0) > 0
        ? `${Math.round(rt.volume || 0)}% · Playing`
        : 'Stopped';

  const statusEl = card.querySelector('.sound-status');
  if (statusEl) statusEl.textContent = statusText;
}

async function activateMixer(soundId, event, mixer) {
  const r = mixer.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - r.left) / r.width));
  const y = Math.max(0, Math.min(1, (event.clientY - r.top) / r.height));
  const target = Math.round((1 - y) * 100);

  const fadeFactor = x;
  const rt = await ensurePlayer(soundId);
  if (!rt) return;
  if (!rt.player) return;

  if (target === 0) {
    if (!rt.playing) {
      stopAndReset(soundId);
      return;
    }
    await fadeTo(soundId, 0, fadeFactor);
    return;
  }

  if (!rt.playing) {
    rt.pendingFade = { target, fadeFactor };
    rt.playing = true;
    rt.volume = 0;
    try { rt.player.playVideo(); } catch { }
    try { rt.player.setVolume(0); } catch { }
    refreshCard(soundId);
    return;
  }

  rt.playing = true;
  fadeTo(soundId, target, fadeFactor);
  refreshCard(soundId);
}

function waitForYouTube() {
  if (ytReady || window.YT?.Player) return Promise.resolve();
  return new Promise(resolve => ytWaiters.push(resolve));
}

async function ensurePlayer(soundId) {
  const found = findSound(soundId);
  if (!found) return null;
  let rt = runtimePlayers.get(soundId);
  if (rt?.player) return rt;
  await waitForYouTube();
  if (!window.YT?.Player) { showToast('YouTube player API is unavailable.', true); return null; }

  rt = { player: null, volume: 0, playing: false, fading: false, fadeId: null, ready: false, pending: [], pendingFade: null };
  runtimePlayers.set(soundId, rt);
  const host = document.createElement('div');
  host.id = `yt-player-${++playerCounter}`;
  $('playerHost').appendChild(host);
  const player = new YT.Player(host.id, {
    videoId: found.sound.youtubeId,
    width: '2', height: '2',
    playerVars: { enablejsapi: 1, origin: location.origin, controls: 0, playsinline: 1, rel: 0 },
    events: {
      onReady: () => {
        rt.ready = true;
        rt.volume = 0;
        try { player.setVolume(0); } catch { }
        rt.pending.splice(0).forEach(fn => fn());
      },
      onStateChange: ev => {
        if (ev.data === YT.PlayerState.PLAYING) {
          rt.playing = true;
          const queued = rt.pendingFade;
          rt.pendingFade = null;
          if (queued) {
            rt.volume = 0;
            try { rt.player.setVolume(0); } catch { }
            fadeTo(soundId, queued.target, queued.fadeFactor);
          }
          refreshCard(soundId);
        }
        if (ev.data === YT.PlayerState.PAUSED) {
          rt.playing = false;
          refreshCard(soundId);
        }
        if (ev.data === YT.PlayerState.ENDED) stopAndReset(soundId, true);
      },
      onError: () => { showToast(`YouTube could not play “${found.sound.name}”.`, true); rt.playing = false; refreshCard(soundId); }
    }
  });
  rt.player = player;
  await new Promise(resolve => rt.ready ? resolve() : rt.pending.push(resolve));
  return rt;
}

function sendWorker(message) {
  if (worker) worker.postMessage(message);
}

function cancelFade(soundId) {
  const rt = runtimePlayers.get(soundId);
  if (!rt) return;
  if (rt.fadeId) sendWorker({ type: 'cancel', id: rt.fadeId });
  rt.fadeId = null; rt.fading = false;
  rt.pendingFade = null;
}

async function fadeTo(soundId, targetVolume, fadeFactor) {
  const rt = await ensurePlayer(soundId);

  if (!rt) return;

  const from = Math.max(0, Math.min(100, Number(rt.volume || 0)));

  let to = Math.max(0, Math.min(100, Number(targetVolume)));

  // Snap near-zero to muted, and near-full to 100%
  if (to < 5) {
    to = 0;
  } else if (to > 95) {
    to = 100;
  }

  cancelFade(soundId);

  rt.playing = true;
  const duration =
    MAX_FADE_MS *
    Math.max(0, Math.min(1, fadeFactor)) *
    Math.abs(to - from) / 100;

  if (duration < 60) {
    rt.volume = to;

    try {
      rt.player.setVolume(to);
    } catch { }

    rt.fading = false;

    if (to === 0) {
      stopAndReset(soundId, true);
    } else {
      rt.playing = true;
      refreshCard(soundId);
    }

    return;
  }

  const fadeId = uid('fade');

  rt.fadeId = fadeId;
  rt.fading = true;

  sendWorker({
    type: 'start',
    id: fadeId,
    from,
    to,
    durationMs: duration,
    duration
  });

  refreshCard(soundId);
}

function handleWorkerMessage({ data }) {
  if (data.type !== 'fade') return;
  const match = [...runtimePlayers.entries()].find(([, rt]) => rt.fadeId === data.id);
  if (!match) return;
  const [soundId, rt] = match;
  rt.volume = Math.max(0, Math.min(100, data.volume));
  try { rt.player.setVolume(rt.volume); } catch { }
  if (data.done) {
    rt.fading = false; rt.fadeId = null;
    if (rt.volume <= 0.001) {
      stopAndReset(soundId, true);
    } else {
      rt.volume = Math.round(rt.volume * 100) / 100;
      refreshCard(soundId);
    }
  } else {
    if (rt.volume <= 0.001) {
      stopAndReset(soundId, true);
      return;
    }
    refreshCard(soundId);
  }
}

function stopAndReset(soundId, rerender = true) {
  const rt = runtimePlayers.get(soundId);
  if (!rt) return;
  cancelFade(soundId);
  try { rt.player.stopVideo(); rt.player.seekTo(0, true); rt.player.setVolume(0); } catch { }
  rt.volume = 0; rt.playing = false; rt.fading = false; rt.pendingFade = null;
  if (rerender || rt.volume === 0) refreshCard(soundId);
}

function destroyPlayer(soundId) {
  const rt = runtimePlayers.get(soundId);
  if (!rt) return;
  cancelFade(soundId);
  try { rt.player.stopVideo(); rt.player.destroy(); } catch { }
  runtimePlayers.delete(soundId);
}

function closeGroup(group) {
  for (const sound of group.sounds) destroyPlayer(sound.id);
  group.open = false;
  persist(); render();
}

function deleteGroup(groupId) {
  const group = model.groups.find(g => g.id === groupId);
  if (!group) return;
  for (const sound of group.sounds) destroyPlayer(sound.id);
  model.groups = model.groups.filter(g => g.id !== groupId);
  persist(); render();
}

function deleteSound(soundId) {
  const found = findSound(soundId);
  if (!found) return;
  destroyPlayer(soundId);
  found.group.sounds = found.group.sounds.filter(s => s.id !== soundId);
  persist(); render();
}

function parseYouTubeId(raw) {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'youtu.be') return cleanId(url.pathname.slice(1));
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') return cleanId(url.searchParams.get('v'));
      if (url.pathname.startsWith('/shorts/')) return cleanId(url.pathname.split('/')[2]);
      if (url.pathname.startsWith('/embed/')) return cleanId(url.pathname.split('/')[2]);
    }
  } catch { }
  return null;
}
function cleanId(id) { return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null; }

function openModal(mode, payload = {}) {
  modalMode = { mode, ...payload };
  $('modalTitle').textContent = mode === 'group' ? (payload.group ? 'Edit group' : 'Add group') : (payload.sound ? 'Edit sound' : 'Add sound');
  $('nameField').classList.remove('hidden');
  $('urlField').classList.toggle('hidden', mode === 'group');
  $('groupField').classList.toggle('hidden', mode === 'group');
  $('entityName').value = payload.group?.name || payload.sound?.name || '';
  $('entityUrl').value = payload.sound?.url || '';
  const select = $('entityGroup');
  select.innerHTML = model.groups.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.name)}</option>`).join('');
  if (payload.sound) select.value = payload.group.id;
  if (mode === 'sound' && !model.groups.length) { closeModal(); showToast('Create a group before adding a sound.', true); return; }
  modalBackdrop.classList.remove('hidden');
  $('entityName').focus();
}
function closeModal() { modalBackdrop.classList.add('hidden'); modalMode = null; form.reset(); }

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('entityName').value.trim();
  if (!name) return;
  if (modalMode.mode === 'group') {
    if (modalMode.group) modalMode.group.name = name;
    else model.groups.push({ id: uid('group'), name, open: true, sounds: [] });
  } else {
    const url = $('entityUrl').value.trim();
    const youtubeId = parseYouTubeId(url);
    if (!youtubeId) { showToast('Enter a valid YouTube URL.', true); return; }
    const group = model.groups.find(g => g.id === $('entityGroup').value);
    if (!group) { showToast('Select a valid group.', true); return; }
    if (modalMode.sound) {
      const oldId = modalMode.sound.youtubeId;
      if (oldId !== youtubeId) destroyPlayer(modalMode.sound.id);
      modalMode.sound.name = name; modalMode.sound.url = url; modalMode.sound.youtubeId = youtubeId;
      if (modalMode.group.id !== group.id) {
        modalMode.group.sounds = modalMode.group.sounds.filter(s => s.id !== modalMode.sound.id);
        group.sounds.push(modalMode.sound);
      }
    } else {
      group.sounds.push({ id: uid('sound'), name, url, youtubeId });
    }
  }
  persist(); closeModal(); render();
});

$('closeModal').onclick = closeModal;
$('cancelModal').onclick = closeModal;
$('importBtn').onclick = () => $('importFile').click();
$('exportBtn').onclick = exportModel;
$('fullscreenBtn').onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => showToast(`Fullscreen unavailable: ${err.message}`, true));
  } else {
    document.exitFullscreen();
  }
};
$('addGroupBtn').onclick = () => openModal('group');
$('addSoundBtn').onclick = () => openModal('sound');
$('emptyAddGroup').onclick = () => openModal('group');
$('importFile').addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (file) importModelFromFile(file);
  e.target.value = '';
});
modalBackdrop.addEventListener('pointerdown', e => { if (e.target === modalBackdrop) closeModal(); });

groupsEl.addEventListener('click', e => {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const section = actionEl.closest('.group');
  const group = model.groups.find(g => g.id === section?.dataset.groupId);
  if (!group) return;
  const action = actionEl.dataset.action;
  if (action === 'toggle-group') {
    if (group.open) closeGroup(group); else { group.open = true; persist(); render(); }
  } else if (action === 'add-sound') openModal('sound', { group });
  else if (action === 'edit-group') openModal('group', { group });
  else if (action === 'delete-group') {
    if (confirm(`Delete group “${group.name}” and its ${group.sounds.length} sound${group.sounds.length === 1 ? '' : 's'}?`)) deleteGroup(group.id);
  } else if (action === 'edit-sound') {
    const soundItem = actionEl.closest('.sound-item');
    const soundId = soundItem?.dataset.soundId;
    const sound = soundId ? findSound(soundId)?.sound : null;
    if (sound) openModal('sound', { sound, group });
  } else if (action === 'delete-sound') {
    const soundItem = actionEl.closest('.sound-item');
    const soundId = soundItem?.dataset.soundId;
    const sound = soundId ? findSound(soundId)?.sound : null;
    if (!sound) return;
    if (confirm(`Delete sound "${sound.name}"?`)) deleteSound(soundId);
  } else if (action === 'stop-sound') {
    const soundItem = actionEl.closest('.sound-item');
    const soundId = soundItem?.dataset.soundId;
    if (soundId) stopAndReset(soundId);
  }
});

groupsEl.addEventListener('contextmenu', e => e.preventDefault());

function showToast(message, danger = false) {
  clearTimeout(toastTimer);
  const toast = $('toast'); toast.textContent = message; toast.className = `toast show${danger ? ' danger' : ''}`;
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

window.addEventListener('beforeunload', () => {
  for (const soundId of runtimePlayers.keys()) destroyPlayer(soundId);
  worker?.terminate();
});

render();

function exportModel() {
  const payload = JSON.stringify(model, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'taletunes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Groups exported as JSON.');
}

function coerceYoutubeIdFromValue(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
  if (/^[A-Za-z0-9_-]{6,20}$/.test(text)) return text;
  const parsed = parseYouTubeId(text);
  if (parsed) return parsed;
  return null;
}

function extractImportedSoundInfo(sound) {
  if (!sound || typeof sound !== 'object') return null;

  const name = typeof sound.name === 'string' && sound.name.trim() ? sound.name.trim() : 'Untitled sound';
  const directUrl = [sound.url, sound.youtubeUrl, sound.link, sound.src, sound.href, sound.source]
    .find(v => typeof v === 'string' && v.trim());
  const directId = [sound.youtubeId, sound.youtube_id, sound.videoId, sound.video_id]
    .find(v => typeof v === 'string' && v.trim());

  const youtubeId = coerceYoutubeIdFromValue(directUrl || directId || sound.id);
  if (!youtubeId) return null;

  return {
    name,
    url: (typeof directUrl === 'string' && directUrl.trim()) ? directUrl.trim() : `https://www.youtube.com/watch?v=${youtubeId}`,
    youtubeId
  };
}

function extractImportedGroupInfo(group) {
  if (!group || typeof group !== 'object') return null;

  const groupName = typeof group.name === 'string' && group.name.trim() ? group.name.trim() : 'Untitled group';
  const tunes = Array.isArray(group.tunes)
    ? group.tunes
    : (Array.isArray(group.sounds) ? group.sounds : (Array.isArray(group.items) ? group.items : []));

  const sounds = tunes.map(item => {
    if (!item || typeof item !== 'object') return null;
    const directUrl = [item.url, item.youtubeUrl, item.link, item.src, item.href, item.source, item.videoUrl]
      .find(v => typeof v === 'string' && v.trim());
    const directId = [item.youtubeId, item.youtube_id, item.videoId, item.video_id]
      .find(v => typeof v === 'string' && v.trim());
    const name = typeof item.title === 'string' && item.title.trim()
      ? item.title.trim()
      : (typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Untitled sound');
    const youtubeId = coerceYoutubeIdFromValue(directUrl || directId || item.id);
    if (!youtubeId) return null;
    return {
      id: uid('sound'),
      name,
      url: (typeof directUrl === 'string' && directUrl.trim()) ? directUrl.trim() : `https://www.youtube.com/watch?v=${youtubeId}`,
      youtubeId
    };
  }).filter(Boolean);

  return { id: uid('group'), name: groupName, open: !!group.active, sounds };
}

function normalizeImportedModel(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('The file does not look like an Ambient Forge export.');
  }

  let groupList = [];
  if (Array.isArray(raw.groups)) groupList = raw.groups;
  else if (Array.isArray(raw.items)) groupList = raw.items;
  else if (Array.isArray(raw)) groupList = raw;
  else throw new Error('The file does not look like an Ambient Forge export.');

  const normalizedGroups = groupList.map(extractImportedGroupInfo).filter(Boolean).map(group => ({
    id: group.id,
    name: group.name,
    open: group.open,
    sounds: group.sounds
  })).filter(group => group.sounds.length > 0);

  if (!normalizedGroups.length) {
    throw new Error('No valid groups or sounds were found in the import file.');
  }

  return { version: DATA_VERSION, groups: normalizedGroups };
}

function mergeImportedModel(raw) {
  const nextModel = normalizeImportedModel(raw);
  const mergedGroups = [...model.groups];

  for (const importedGroup of nextModel.groups) {
    const existingGroup = mergedGroups.find(g => g.name.trim().toLowerCase() === importedGroup.name.trim().toLowerCase());
    if (!existingGroup) {
      mergedGroups.push(importedGroup);
      continue;
    }

    for (const incomingSound of importedGroup.sounds) {
      const alreadyExists = existingGroup.sounds.some(existingSound => matchesSound(existingSound, incomingSound));
      if (!alreadyExists) {
        existingGroup.sounds.push({
          id: incomingSound.id || uid('sound'),
          name: incomingSound.name,
          url: incomingSound.url,
          youtubeId: incomingSound.youtubeId
        });
      }
    }
  }

  return { version: DATA_VERSION, groups: mergedGroups };
}

window.mergeImportedModel = mergeImportedModel;

function deleteAllGroups() {
  model = { version: DATA_VERSION, groups: [] };
  persist();
  render();
  showToast('All groups deleted.');
}
window.deleteAllGroups = deleteAllGroups;

function matchesSound(a, b) {
  if (!a || !b) return false;
  const aId = coerceYoutubeIdFromValue(a.youtubeId || a.url || a.id || a.youtube_url || a.videoId);
  const bId = coerceYoutubeIdFromValue(b.youtubeId || b.url || b.id || b.youtube_url || b.videoId);
  if (aId && bId) return aId === bId;
  return String(a.url || '').trim() === String(b.url || '').trim();
}

async function importModelFromFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const nextModel = mergeImportedModel(parsed);
    for (const soundId of runtimePlayers.keys()) destroyPlayer(soundId);
    model = nextModel;
    persist();
    render();
    showToast('Groups imported successfully.');
  } catch (err) {
    showToast(err?.message || 'Could not import the selected file.', true);
  }
}

window.importModelFromFile = importModelFromFile;
