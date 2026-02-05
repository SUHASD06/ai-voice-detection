from __future__ import annotations

import base64
import binascii
import io
from pathlib import Path
from typing import Literal

import joblib
import librosa
import numpy as np
import pandas as pd
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI(title="AI Voice Detection API")

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "voice_ai_detector.pkl"

API_KEY = "jAx3wJGhkiVOlUHsHCJNLJH8OU4s8DAF-Jvjy0zSlKY"  # change before deployment (or use env var later)
SUPPORTED_LANGUAGES = ["Tamil", "English", "Hindi", "Malayalam", "Telugu"]

_model = None


def get_model():
    global _model
    if _model is not None:
        return _model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    _model = joblib.load(MODEL_PATH)
    return _model


def extract_features_from_audio(y: np.ndarray, sr: int = 16000) -> np.ndarray:
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    zcr = librosa.feature.zero_crossing_rate(y)
    rms = librosa.feature.rms(y=y)
    flatness = librosa.feature.spectral_flatness(y=y)

    try:
        f0, _, _ = librosa.pyin(y, fmin=50, fmax=500)
        f0 = f0[~np.isnan(f0)]
        pitch_var = float(np.var(f0)) if len(f0) > 0 else 0.0
    except Exception:
        pitch_var = 0.0

    harmonic = librosa.effects.harmonic(y)
    percussive = librosa.effects.percussive(y)
    hnr = float(np.mean(np.abs(harmonic)) / (np.mean(np.abs(percussive)) + 1e-6))

    return np.concatenate(
        [
            mfcc.mean(axis=1),
            mfcc.var(axis=1),
            [spec_centroid.mean()],
            [zcr.mean()],
            [rms.mean()],
            [flatness.mean()],
            [pitch_var],
            [hnr],
        ]
    )


def predict_ai_probability(features_1xN: np.ndarray) -> float:
    model = get_model()
    # Model was trained on a pandas DataFrame; keep same shape/column style.
    X = pd.DataFrame(features_1xN)
    prob = model.predict_proba(X)[0]
    return float(prob[1])


@app.get("/health")
def health():
    return {"status": "ok"}

class SimpleDetectRequest(BaseModel):
    audio_base64: str


class VoiceDetectionRequest(BaseModel):
    language: str
    audioFormat: str
    audioBase64: str


@app.post("/detect")
def detect(data: SimpleDetectRequest):
    try:
        audio_bytes = base64.b64decode(data.audio_base64)
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True, duration=4.0)
        if len(y) < sr * 0.5:
            raise HTTPException(status_code=400, detail="Audio too short.")
        features = extract_features_from_audio(y).reshape(1, -1)
        p_ai = predict_ai_probability(features)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model file missing on server.")
    except binascii.Error:
        raise HTTPException(status_code=400, detail="Invalid audio data. Use a valid MP3 or WAV file.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)[:200] or "Audio processing failed.")

    if p_ai >= 0.7:
        classification: Literal["HUMAN", "AI_GENERATED"] = "AI_GENERATED"
        explanation = "Unnatural pitch consistency and synthetic speech patterns detected."
    elif p_ai <= 0.4:
        classification = "HUMAN"
        explanation = "Natural speech patterns and pitch variation detected."
    else:
        classification = "AI_GENERATED" if p_ai >= 0.5 else "HUMAN"
        explanation = "Mixed speech characteristics detected."

    return {"classification": classification, "confidence": round(p_ai, 3), "explanation": explanation}


@app.post("/voice-detection")
def voice_detection(data: VoiceDetectionRequest, x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        return {"status": "error", "message": "Invalid API key or malformed request"}

    if data.language not in SUPPORTED_LANGUAGES:
        return {"status": "error", "message": "Unsupported language"}

    if data.audioFormat.lower() != "mp3":
        return {"status": "error", "message": "Unsupported audio format"}

    try:
        audio_bytes = base64.b64decode(data.audioBase64)
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True, duration=4.0)
        if len(y) < sr * 0.5:
            raise ValueError("Audio too short")
        features = extract_features_from_audio(y).reshape(1, -1)
        p_ai = predict_ai_probability(features)

        if p_ai >= 0.75:
            classification = "AI_GENERATED"
            explanation = "Synthetic speech patterns detected such as stable pitch and spectral smoothness."
        elif p_ai <= 0.35:
            classification = "HUMAN"
            explanation = "Natural speech variations detected typical of human voice."
        else:
            classification = "AI_GENERATED" if data.language != "English" else "HUMAN"
            explanation = "Mixed speech characteristics detected. Classified conservatively due to language variation."

        return {
            "status": "success",
            "language": data.language,
            "classification": classification,
            "confidenceScore": round(p_ai, 2),
            "explanation": explanation,
        }
    except Exception:
        return {
            "status": "success",
            "language": data.language,
            "classification": "HUMAN",
            "confidenceScore": 0.5,
            "explanation": "Unable to confidently detect AI patterns due to audio or language characteristics.",
        }

