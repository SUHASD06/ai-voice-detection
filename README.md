# AI Voice Detection

Detect whether a voice recording is **human** or **AI-generated** using audio analysis and machine learning.

## Repo structure

- **`frontend/`** — Vite + React + TypeScript + shadcn-ui + Tailwind
- **`backend/`** — FastAPI voice detection API + training scripts + data/models

## Run locally

### Frontend

```sh
cd frontend
npm i
npm run dev
```

Open http://localhost:8080

### Backend

From the repo root:

```sh
cd backend
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The frontend proxies `/api` to the backend, so both must run for full functionality.

## Tech stack

- **Frontend:** Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend:** Python, FastAPI, librosa, scikit-learn

## Clone and run

```sh
git clone <YOUR_GIT_URL>
cd ai_voice
cd frontend && npm i && npm run dev
# In another terminal:
cd backend && python -m uvicorn app:app --reload --port 8000
```
