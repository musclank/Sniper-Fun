# SNIPER-$VVV AI HUB

A mobile-friendly AI workspace with a blue tactical terminal interface. Built with Vite and deployed on Vercel.

## Current experience

- Blue futuristic terminal-style interface with a cinematic boot screen.
- AI workspace modes: General, Coding, and Visual Assistant.
- Smart routing through OpenRouter (the current interface uses the verified automatic route).
- Local conversation sessions stored in the browser.
- Prompt shortcuts, command center, chat history, and response/code copy controls.
- Responsive developer workspace designed for Android and desktop browsers.
- AI File Manager for local code drafts with preview, copy, download, and safe manual review.
- AI Patch Reviewer for read-only engineering, security, and compatibility feedback.
- AI Test Lab for project-aware test-suite generation; generated tests are not executed or applied automatically.
- AI Debug Engine for session-scoped browser error and unhandled-promise capture, pasted build logs, project-aware diagnosis, and reviewable fix suggestions. It does not record page content or apply fixes automatically.
- Autonomous Coding Workspace for validated multi-file plans, before/after review summaries, explicit local apply, one-step undo, and ZIP export of saved drafts. It does not push changes to GitHub automatically.
- Project Dependency Intelligence for local package.json/lockfile scanning, version-pattern heuristics, dependency inventory, and AI-assisted compatibility review. It does not install packages or claim live vulnerability/registry checks.
- Security & Secrets Guardian for local pattern-based credential detection with redacted reports and AI remediation guidance. Secret values are not displayed or included in AI review; the scanner is heuristic and cannot guarantee complete detection.
- AI Project Health Dashboard combines local security pattern findings, dependency manifest/lockfile metadata, and captured runtime errors into a transparent heuristic score. Tests, builds, and deployment are explicitly marked unverified unless independently run.
- AI Performance & Optimization Engine performs local static pattern checks and source-size inspection, producing a heuristic report and AI-assisted Android-first optimization guidance. It does not run benchmarks, Lighthouse, builds, or modify source files.

## Tech stack

- Vite
- Vanilla JavaScript and CSS
- Vercel serverless functions
- OpenRouter API
- Browser `localStorage` for local chat sessions

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

## Vercel deployment

Import the GitHub repository into Vercel and use these settings:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Production branch: `feature/sniper-vvv-ai-hub` (or the branch explicitly selected in Vercel)

The repository includes these Vercel serverless API routes:

- `GET /api/models` — retrieves the OpenRouter model catalog and filters free models.
- `POST /api/chat` — sends a chat completion request to OpenRouter.

## Environment variable

Add this variable in **Vercel → Project Settings → Environment Variables**:

```text
OPENROUTER_API_KEY
```

Set its value to your OpenRouter API key and enable it for the environments you use (Production, Preview, and/or Development). Keep the key in Vercel environment variables only. Never put it in frontend JavaScript, source files, or public commits.

After changing an environment variable, redeploy the project for the change to take effect.

## Notes

- The AI service requires a valid OpenRouter API key and may be subject to provider availability and free-model limits.
- Chat history is stored locally in the current browser profile. It is not synced between devices and clearing browser storage may remove it.
- The Visual Assistant helps create and refine visual prompts; it does not claim to generate images unless an image-generation provider is connected.
- The project is intended to stay usable on free-tier infrastructure. Provider usage and platform limits still apply.
