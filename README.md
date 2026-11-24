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
