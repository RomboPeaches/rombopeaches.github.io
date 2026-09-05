# Ambient Forge

Desktop-first TTRPG ambient sound mixer using the YouTube IFrame Player API, a custom 2D mixer surface, `localStorage`, and one dedicated Web Worker for fade scheduling.

## Run

Serve the directory over HTTP (rather than opening `index.html` with `file://`):

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Controls

- **Y axis:** target volume (top = 100%, bottom = 0%).
- **X axis:** fade speed (left = fast, right = slow).
- **Left 10%:** immediate stop, volume 0, and playback reset.
- **Right 10%:** guarantees a 100% target volume.
- Maximum fade is 20 seconds for a full 0→100 transition.
- Closing a group cancels fades, stops/resets sounds, and destroys active YouTube players.

## Persistence

Only configuration is saved under `ambient-forge-v1`: groups, names, ordering, open/closed state, URLs/video IDs, and membership. Runtime playback state is intentionally not persisted.

## Notes

The actual YouTube players are created lazily and kept offscreen. The mixer card/thumbnail is the primary UI. The Web Worker only schedules fade progress; all YouTube API calls remain on the main thread.
