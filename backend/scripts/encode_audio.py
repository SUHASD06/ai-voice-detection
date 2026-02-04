import base64

audio_path = "test.mp3"  # real mp3 file

with open(audio_path, "rb") as f:
    encoded = base64.b64encode(f.read()).decode("utf-8")

print(encoded)
