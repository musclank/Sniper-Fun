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


## Sniper-$VVV AI hub implementation plan

The AI hub is being developed separately from the production game. The initial branch keeps the game entry point intact until the complete frontend and Pages Functions can be committed together.

### Planned architecture
- Vite frontend with a responsive tactical dashboard.
- Cloudflare Pages Functions at `/api/models` and `/api/chat`.
- OpenRouter free-model catalog and chat completion proxy.
- Provider credentials stored only as Cloudflare Pages secrets (`OPENROUTER_API_KEY`).
- Browser `localStorage` for local chat history; no account or external database required.

### Deployment settings
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Keep production branch on `main` until the AI branch has been built and tested.
