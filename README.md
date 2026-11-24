# SNIPER-$VVV AI HUB

A mobile-friendly AI workspace and Base intelligence interface with a blue tactical terminal design. Built with Vite, vanilla JavaScript, and Cloudflare Pages Functions.

## Current experience

- Tactical AI terminal with General, Coding, and Visual Assistant workspaces.
- OpenRouter server-side routing with a verified automatic route.
- Local conversation sessions, projects, prompt arsenal, command center, and response controls.
- Developer utilities for code review, debugging, refactoring, documentation, and test planning.
- AI File Manager, Patch Reviewer, Test Lab, Debug Engine, and Autonomous Coding Workspace.
- Project Dependency Intelligence, Security & Secrets Guardian, Project Health Dashboard, and Performance & Optimization tools.
- AI Workflow Automation Center with locally tracked steps and explicit user checkpoints.
- **AI Model Arena:** compare up to three available free OpenRouter model routes using the same prompt. Requests run independently; provider availability and free-tier limits apply.
- **Base Onchain Intelligence:** search Base token contracts or names and inspect DexScreener-reported price, liquidity, 24-hour volume, FDV, and links to BaseScan and DexScreener.
- Clanker trending token panel with live market data and token icon hydration.
- Responsive Intelligence Lab designed for desktop and Android browsers.

## Tech stack

- Vite
- Vanilla JavaScript and CSS
- Cloudflare Pages Functions
- OpenRouter API
- DexScreener public market-data API
- Browser local storage for local chat sessions and project data

## Run locally

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

Vite writes the production build to `dist/`.

## Cloudflare Pages deployment

Connect the GitHub repository to Cloudflare Pages and use:

- Framework preset: **Vite** (or None)
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `feature/sniper-vvv-ai-hub`

The repository uses Cloudflare Pages Functions under `functions/api/`:

- `GET /api/models` — retrieves the OpenRouter model directory and returns free routes.
- `POST /api/chat` — sends a prompt to the selected OpenRouter route.
- `GET /api/clanker` — retrieves Clanker trending token data.

Configure this server-side environment variable in Cloudflare Pages:

```text
OPENROUTER_API_KEY
```

Keep provider credentials in Cloudflare Pages environment variables only. Never expose API keys in frontend code or public commits. Redeploy after changing production environment variables.

## Intelligence Lab notes

### AI Model Arena

- Uses the existing `/api/models` and `/api/chat` endpoints.
- Shows up to three free routes returned by the server.
- Sends the same prompt to each selected route and displays the answers side by side.
- Model availability, latency, response quality, and free-tier limits depend on upstream providers.
- It does not claim that model outputs are independently verified or objectively ranked.

### Base Onchain Intelligence

- Uses DexScreener's public API for Base token pair data.
- Supports contract-address lookup and text search, then filters results to the Base network.
- Displays provider-reported pair metrics and links to BaseScan and DexScreener.
- Market data may be delayed, incomplete, or unavailable. A listing, liquidity figure, or price change does not establish that a token is legitimate or safe.
- This is an informational lookup tool, not investment advice or an automated trading feature.

## Important limitations

- AI output can be incomplete or incorrect. Review and validate generated content before relying on it.
- Provider availability, free-tier limits, rate limits, and model responses can change.
- Project organization, session history, and local drafts may be stored in the current browser and are not automatically synchronized between devices.
- The Visual Assistant helps create and refine prompts; it does not claim to generate images unless an image-generation provider is connected.
- Developer and project-health tools use local heuristics unless a feature explicitly states otherwise. They do not guarantee complete security, compatibility, or performance analysis.
- The Intelligence Lab does not execute transactions, connect wallets, or provide guaranteed token risk assessments.
