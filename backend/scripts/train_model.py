import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
FEATURES_PATH = BASE_DIR / "data" / "features.csv"
MODEL_PATH = BASE_DIR / "models" / "voice_ai_detector.pkl"

# Load features
df = pd.read_csv(FEATURES_PATH)

X = df.drop("label", axis=1)
y = df["label"]

# Train / test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Model (solid default for this task)

model = RandomForestClassifier(
    n_estimators=400,
    max_depth=30,
    random_state=42,
    n_jobs=-1,
    class_weight={0: 1, 1: 2}  # HUMAN : AI
)

print("Training model...")
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print("\nAccuracy:", acc)
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Human", "AI"]))

# Save model
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_PATH)
print(f"\nModel saved as {MODEL_PATH}")
