<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1pNiB7YYTLXPeIhDmw8ZoSUKJsq-W31MD

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file with your Gemini API key (see `.env.example`):
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push this repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your GitHub repository.
4. Framework Preset will auto-detect as **Vite**.
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Under **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
6. Click **Deploy**.
