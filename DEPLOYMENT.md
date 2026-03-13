# Deploy Hometown Hub

## Frontend on Vercel

1. Import this repository into Vercel.
2. Create a project with the root directory set to `hometown-frontend`.
3. Confirm these settings:
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add the environment variable from [hometown-frontend/.env.example](./hometown-frontend/.env.example):
   - `REACT_APP_API_BASE_URL=https://your-render-service.onrender.com/api`
5. Deploy.

The [hometown-frontend/vercel.json](./hometown-frontend/vercel.json) file keeps React Router routes working on refresh and direct URL visits.

## Backend on Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. If using the Blueprint, Render will read [render.yaml](./render.yaml).
4. If creating the service manually, use:
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/`
5. Add the environment variables from [backend/.env.example](./backend/.env.example):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - Optional: `FRONTEND_URLS`
6. Deploy.

## Important

- Set `FRONTEND_URL` to your deployed Vercel URL, for example `https://your-project.vercel.app`.
- If you later add a custom domain, either replace `FRONTEND_URL` or add it to `FRONTEND_URLS`.
- After changing environment variables in Vercel or Render, redeploy the service.
- Do not commit your real `.env` secrets.
