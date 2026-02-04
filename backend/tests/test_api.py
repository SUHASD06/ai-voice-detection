import base64
from pathlib import Path
import requests

# Read MP3
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"
with open(FIXTURES_DIR / "test.mp3", "rb") as f:
    audio_b64 = base64.b64encode(f.read()).decode("utf-8")

payload = {
    "audio_base64": audio_b64
}

resp = requests.post(
    "http://127.0.0.1:8000/detect",
    json=payload
)

print("Status:", resp.status_code)
print(resp.json())
