import os
from pathlib import Path
import librosa
import numpy as np
import pandas as pd

# ---------------- PATHS ----------------

BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
DATASET_DIR = BASE_DIR / "data" / "dataset"
HUMAN_DIR = DATASET_DIR / "human"
AI_DIR = DATASET_DIR / "ai"
OUTPUT_FILE = BASE_DIR / "data" / "features.csv"

# ---------------- CONFIG ----------------

MAX_DURATION = 4.0        # seconds (huge speed boost)
MIN_DURATION = 0.5        # seconds
MAX_FILES_PER_CLASS = None  # set to e.g. 1500 for faster testing

features = []
labels = []

# ---------------- FEATURE EXTRACTION ----------------

def extract_features(file_path):
    # Load only first few seconds
    y, sr = librosa.load(
        file_path,
        sr=16000,
        mono=True,
        duration=MAX_DURATION
    )

    if len(y) < sr * MIN_DURATION:
        raise ValueError("Audio too short")

    # ---- BASIC FEATURES ----
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    zcr = librosa.feature.zero_crossing_rate(y)
    rms = librosa.feature.rms(y=y)

    # ---- GENERALIZATION FEATURES ----

    # Spectral flatness
    flatness = librosa.feature.spectral_flatness(y=y)

    # Pitch variance (skip silence)
    if np.max(np.abs(y)) < 0.01:
        pitch_var = 0.0
    else:
        f0, _, _ = librosa.pyin(y, fmin=50, fmax=500)
        f0 = f0[~np.isnan(f0)]
        pitch_var = np.var(f0) if len(f0) > 0 else 0.0

    # Harmonic / Noise proxy
    harmonic = librosa.effects.harmonic(y)
    percussive = librosa.effects.percussive(y)
    hnr = np.mean(np.abs(harmonic)) / (np.mean(np.abs(percussive)) + 1e-6)

    return np.concatenate([
        mfcc.mean(axis=1),        # 13
        mfcc.var(axis=1),         # 13
        [spec_centroid.mean()],   # 1
        [zcr.mean()],             # 1
        [rms.mean()],             # 1
        [flatness.mean()],        # 1
        [pitch_var],              # 1
        [hnr]                     # 1
    ])

# ---------------- DATA WALK ----------------

def process_directory(base_dir, label):
    count = 0

    for root, _, files in os.walk(base_dir):
        for file in files:
            if not file.lower().endswith((".wav", ".mp3")):
                continue

            file_path = os.path.join(root, file)

            try:
                feat = extract_features(file_path)
                features.append(feat)
                labels.append(label)
                count += 1

                if count % 100 == 0:
                    print(f"{base_dir.name}: processed {count} files")

                if MAX_FILES_PER_CLASS and count >= MAX_FILES_PER_CLASS:
                    return

            except Exception as e:
                print(f"SKIPPED: {file_path} | {e}")

    print(f"{base_dir.name}: total processed {count}")

# ---------------- MAIN ----------------

print("Starting feature extraction...")

process_directory(HUMAN_DIR, 0)  # Human
process_directory(AI_DIR, 1)     # AI

X = np.array(features)
y = np.array(labels)

print("Final feature shape:", X.shape)

df = pd.DataFrame(X)
df["label"] = y
df.to_csv(OUTPUT_FILE, index=False)

print("Saved features to:", OUTPUT_FILE)
