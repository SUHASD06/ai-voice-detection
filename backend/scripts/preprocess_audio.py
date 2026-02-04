import os
from pathlib import Path
import librosa
import soundfile as sf

BASE_DIR = Path(__file__).resolve().parents[1]
DATASET_DIR = BASE_DIR / "data" / "dataset"
OUTPUT_DIR = BASE_DIR / "data" / "processed"

TARGET_SR = 16000
MAX_DURATION = 5.0  # seconds

def process_and_save(input_path, output_path):
    y, sr = librosa.load(
        input_path,
        sr=TARGET_SR,
        mono=True,
        duration=MAX_DURATION
    )
    sf.write(output_path, y, TARGET_SR)

def preprocess_split(split_name):
    input_dir = DATASET_DIR / split_name
    output_dir = OUTPUT_DIR / split_name
    output_dir.mkdir(parents=True, exist_ok=True)

    count = 0

    for root, _, files in os.walk(input_dir):
        for file in files:
            if not file.lower().endswith((".wav", ".mp3")):
                continue

            in_path = Path(root) / file
            out_path = output_dir / f"{split_name}_{count}.wav"

            try:
                process_and_save(in_path, out_path)
                count += 1

                if count % 100 == 0:
                    print(f"{split_name}: processed {count} files")

            except Exception as e:
                print(f"SKIPPED: {in_path} | {e}")

    print(f"{split_name}: total processed {count}")

print("Starting preprocessing...")

preprocess_split("human")
preprocess_split("ai")

print("Preprocessing completed.")
