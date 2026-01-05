<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PyZBXmU5QK0B6YcQpZUrkbm5w3uPKNQa

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set secrets:
   - `GEMINI_API_KEY` with your own Gemini key (no se incluye una clave por motivos de seguridad; crea una nueva en Google AI Studio)
   - `VITE_SUPABASE_URL` = `https://kwdsvylnmcvkglhprekp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_ed6BKpgSMqbG3mxcKzGlVA_2iY2HT4l`
3. Run the app:
   `npm run dev`
