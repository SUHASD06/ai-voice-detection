# 🎙️ AI Voice Detection

> Detect whether a voice recording is **human** or **AI-generated** using acoustic feature analysis and machine learning.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

---

## 📖 Overview

**AI Voice Detection** is a full-stack web application that analyzes audio recordings and classifies them as either **human** speech or **AI-generated** voice (e.g., TTS, voice cloning). It uses a trained **Random Forest classifier** on a rich set of acoustic features extracted with [librosa](https://librosa.org), served via a **FastAPI** backend and a modern **React + TypeScript** frontend.

Supported languages: **Tamil, English, Hindi, Malayalam, Telugu**

---

## ✨ Features

- 🎵 **Upload & analyze** MP3 / WAV audio files directly from the browser
- 🤖 **ML-powered detection** using a Random Forest classifier (400 estimators)
- 📊 **Confidence score** and human-readable explanation for every prediction
- 🌐 **Multi-language support** with language-aware decision thresholds
- 🔑 **Authenticated REST API** (`/api/voice-detection`) for programmatic access
- 🐳 **Docker-ready** backend for self-hosting
- ☁️ **Vercel deployment** with Python serverless functions

---

## 🗂️ Project Structure

```
ai_voice/
├── api/
│   └── index.py              # Vercel serverless FastAPI handler
├── backend/
│   ├── app.py                # Main FastAPI application (self-hosted)
│   ├── Dockerfile            # Docker image for backend
│   ├── requirements.txt      # Python dependencies
│   ├── data/
│   │   └── features.csv      # Pre-extracted feature dataset (~13 MB)
│   ├── models/
│   │   └── voice_ai_detector.pkl  # Trained Random Forest model (~19 MB)
│   ├── scripts/
│   │   ├── extract_features.py   # Extracts acoustic features from dataset
│   │   ├── preprocess_audio.py   # Resamples & normalizes raw audio files
│   │   ├── train_model.py        # Trains & saves the classifier
│   │   └── encode_audio.py       # Utility: encodes audio to Base64
│   └── tests/
│       ├── test_api.py           # Integration test against live backend
│       └── fixtures/             # Test audio samples
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ConfidenceBar.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── NavLink.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── ui/               # shadcn/ui component library
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   ├── api.ts            # Typed API client (detectVoice)
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── Index.tsx         # Main detection page
│   │   │   └── NotFound.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── requirements.txt          # Root-level Python deps (Vercel build)
└── vercel.json               # Vercel deployment configuration
```

---

## 🧠 How It Works

### Acoustic Feature Extraction (31 features)

Each audio clip is resampled to **16 kHz mono** and trimmed to **4 seconds**. The following features are extracted and fed to the classifier:

| Feature | Dimensions | Description |
|---|---|---|
| MFCC Mean | 13 | Mean of 13 Mel-frequency cepstral coefficients |
| MFCC Variance | 13 | Variance of MFCCs (captures speech rhythm) |
| Spectral Centroid | 1 | Brightness of the audio spectrum |
| Zero Crossing Rate | 1 | Rate of signal sign changes |
| RMS Energy | 1 | Root mean square loudness |
| Spectral Flatness | 1 | Noise-likeness vs. tonal quality |
| Pitch Variance | 1 | Variance of fundamental frequency F0 |
| HNR (Harmonic-to-Noise Ratio) | 1 | Ratio of harmonic to percussive components |

### Classification Logic

- **`p_ai >= 0.7`** → `AI_GENERATED` — *Unnatural pitch consistency and synthetic speech patterns detected*
- **`p_ai <= 0.4`** → `HUMAN` — *Natural speech patterns and pitch variation detected*
- **`0.4 < p_ai < 0.7`** → borderline, classified by majority threshold
- Non-English languages use a **stricter threshold** (`>= 0.8`) to reduce false positives

### Model

A **Random Forest Classifier** (scikit-learn) with:
- 400 estimators, max depth 30
- Class weight: `{HUMAN: 1, AI: 2}` (penalizes false negatives for AI)
- 80/20 stratified train-test split

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** (or Bun)
- **ffmpeg** (required by librosa for MP3 decoding)

---

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd ai_voice
```

---

### 2. Backend — Run locally

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Backend will be available at: `http://localhost:8000`

> **Note:** The pre-trained model (`backend/models/voice_ai_detector.pkl`) is required. If it's missing, retrain it using the steps in the [Training](#-training-the-model) section.

---

### 3. Frontend — Run locally

```bash
cd frontend
npm install        # or: bun install
npm run dev
```

Frontend will be available at: `http://localhost:8080`

> The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`, so both services must run simultaneously for full functionality.

---

### 4. Run with Docker (Backend only)

```bash
cd backend
docker build -t ai-voice-backend .
docker run -p 8000:8000 ai-voice-backend
```

---

## 📦 Training the Model

If you want to train the model from scratch on your own dataset:

### 1. Prepare the dataset

Organize audio files (`.mp3` or `.wav`) in the following structure:

```
backend/data/dataset/
├── human/     ← human speech recordings
└── ai/        ← AI-generated voice recordings
```

### 2. (Optional) Preprocess audio

Resamples all files to 16 kHz mono WAV and trims to 5 seconds:

```bash
cd backend/scripts
python preprocess_audio.py
```

### 3. Extract features

```bash
cd backend/scripts
python extract_features.py
```

This creates `backend/data/features.csv`.

### 4. Train the model

```bash
cd backend/scripts
python train_model.py
```

This saves the trained model to `backend/models/voice_ai_detector.pkl` and prints accuracy + classification report.

---

## 🔌 API Reference

### `GET /health`

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

---

### `POST /detect`

Frontend endpoint — analyzes a Base64-encoded audio file.

**Request Body:**
```json
{
  "audio_base64": "<base64-encoded MP3 or WAV>"
}
```

**Response:**
```json
{
  "classification": "HUMAN | AI_GENERATED",
  "confidence": 0.847,
  "explanation": "Unnatural pitch consistency and synthetic speech patterns detected."
}
```

**Error Codes:**
| Code | Reason |
|---|---|
| `400` | Invalid audio data, too short, or processing failed |
| `503` | Model file not found on server |

---

### `POST /api/voice-detection`

Authenticated API for programmatic access. Requires an API key and accepts only MP3 format.

**Headers:**
```
x-api-key: <YOUR_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "language": "English",
  "audioFormat": "mp3",
  "audioBase64": "<base64-encoded MP3>"
}
```

**Supported Languages:** `Tamil`, `English`, `Hindi`, `Malayalam`, `Telugu`

**Response:**
```json
{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.91,
  "explanation": "Unnatural pitch consistency and synthetic speech patterns detected."
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Invalid API key or malformed request"
}
```

---

## 🌐 Deployment

### Vercel (Frontend + Serverless Backend)

The project is pre-configured for **Vercel** deployment via `vercel.json`:

- **Frontend:** built from `frontend/` using Vite, output to `frontend/dist/`
- **Backend:** `api/index.py` is deployed as a **Python 3.11 serverless function**
- All `/api/*` requests are routed to the serverless handler
- All other requests serve the React SPA

**Environment Variables (set in Vercel dashboard):**

| Variable | Description |
|---|---|
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |

**Deploy:**
```bash
vercel --prod
```

---

### Self-hosted (Docker)

```bash
# Build and run backend
cd backend
docker build -t ai-voice-backend .
docker run -e CORS_ORIGINS="https://your-frontend.com" -p 8000:8000 ai-voice-backend

# Build frontend
cd frontend && npm run build
# Serve frontend/dist with any static file server (nginx, Vercel, etc.)
```

---

## 🧪 Testing

### Backend Integration Test

Ensure the backend is running at `localhost:8000`, then:

```bash
cd backend/tests
python test_api.py
```

Provide a test MP3 file at `backend/tests/fixtures/test.mp3`.

### Frontend Tests

```bash
cd frontend
npm test         # run tests once
npm run test:watch  # watch mode
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.11** | Runtime |
| **FastAPI** | REST API framework |
| **librosa** | Audio loading & feature extraction |
| **scikit-learn** | Random Forest classifier |
| **NumPy / Pandas** | Numerical processing & data handling |
| **joblib** | Model serialization |
| **Docker** | Containerized deployment |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript 5** | Type safety |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **shadcn/ui + Radix UI** | Accessible UI components |
| **lucide-react** | Icon library |
| **TanStack Query** | Server state management |
| **react-router-dom** | Client-side routing |

---

## 📁 Key Files Reference

| File | Description |
|---|---|
| `backend/app.py` | Main FastAPI app with `/detect` and `/api/voice-detection` endpoints |
| `api/index.py` | Vercel serverless version of the same API |
| `backend/scripts/extract_features.py` | Batch feature extraction from dataset |
| `backend/scripts/train_model.py` | Model training script |
| `frontend/src/lib/api.ts` | Typed fetch client for the backend |
| `frontend/src/pages/Index.tsx` | Main upload & analysis UI |
| `frontend/src/components/ResultCard.tsx` | Detection result display |
| `vercel.json` | Vercel build + routing config |
| `backend/Dockerfile` | Docker image definition |

---

## ⚠️ Known Limitations

- Audio clips are **truncated to 4 seconds** — longer samples use only the first 4 seconds
- Only **MP3 and WAV** formats are supported by the API
- The `/api/voice-detection` endpoint currently requires the API key to be set at build time (future: environment variable)
- Non-English audio uses a higher confidence threshold, which may result in more `HUMAN` classifications for edge cases

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.
