# Sniper Fun

A browser-based 3D tactical sniper range prototype built with **Three.js** and **Vite**.

## Current prototype

- Real-time 3D outdoor training range
- ACES filmic tone mapping, soft shadows, atmospheric fog and directional lighting
- First-person camera with drag-to-look controls
- 4× optical scope overlay
- Three target dummies with hit detection
- Ammunition counter, reload and target score
- Responsive HUD and touch-friendly controls for mobile

## Development

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Vite outputs the production site to `dist/`.

## Cloudflare Pages

Connect this repository to Cloudflare Pages with:

- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

## Controls

- Drag on the scene: look around
- Fire button / Space: shoot
- 4× Scope button / Z: toggle scope
- Reload button / R: reload

This is an early gameplay prototype. Additional weapon models, richer battlefield assets, enemy AI, mission progression and audio are planned for future updates.
