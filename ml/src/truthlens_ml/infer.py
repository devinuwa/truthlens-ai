"""Load a saved model if one exists. Never load a path supplied by an API caller."""

from __future__ import annotations

from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "models" / "message_model.joblib"


def model_status() -> dict:
    if not MODEL_PATH.is_file():
        return {
            "status": "unavailable",
            "note": "No trained model file is present. Use the transparent checks in the web app, or train a model from a licensed dataset and save it to ml/models/message_model.joblib.",
        }
    return {"status": "ready", "note": "A local model file is available."}


def score_text(text: str) -> dict:
    status = model_status()
    if status["status"] != "ready":
        return status
    pipeline = joblib.load(MODEL_PATH)
    label = str(pipeline.predict([text])[0])
    score = None
    if hasattr(pipeline, "predict_proba"):
        classes = list(pipeline.classes_)
        probabilities = pipeline.predict_proba([text])[0]
        if "suspicious" in classes:
            score = float(probabilities[classes.index("suspicious")])
    return {
        "status": "scored",
        "label": label,
        "score": None if score is None else round(score, 4),
        "note": "This score is the model's estimate for text similar to its training data. It is not proof of fraud, and it is separate from the rule checks.",
    }
