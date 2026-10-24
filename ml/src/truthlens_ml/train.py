"""Train a TF-IDF logistic regression model on a local CSV.

The CSV must have columns text,label. Labels are suspicious or legitimate.
The file is not downloaded by this script. See ml/data/MANIFEST.md.
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from truthlens_ml.evaluate import binary_report
from truthlens_ml.preprocess import dedupe_rows

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "messages.csv"
MODEL = ROOT / "models" / "message_model.joblib"
REPORT = ROOT / "models" / "evaluation.json"


def load_rows(path: Path) -> list[dict[str, str]]:
    frame = pd.read_csv(path)
    if not {"text", "label"}.issubset(frame.columns):
        raise SystemExit("messages.csv needs text and label columns.")
    rows = []
    for record in frame.to_dict(orient="records"):
        label = str(record["label"]).strip().lower()
        if label in {"1", "spam", "phishing", "suspicious"}:
            label = "suspicious"
        elif label in {"0", "ham", "legitimate", "benign"}:
            label = "legitimate"
        else:
            continue
        rows.append({"text": str(record["text"]), "label": label})
    return dedupe_rows(rows)


def main() -> None:
    if not RAW.is_file():
        raise SystemExit(
            "No dataset at ml/data/raw/messages.csv. Metrics were not invented. "
            "Add a licensed CSV, record it in ml/data/MANIFEST.md, then run this script again."
        )
    rows = load_rows(RAW)
    if len(rows) < 50:
        raise SystemExit("Need at least 50 usable rows after deduplication. No model was saved.")
    labels = [row["label"] for row in rows]
    if len(set(labels)) < 2:
        raise SystemExit("The file has only one class. No model was saved.")

    texts = [row["text"] for row in rows]
    train_text, temp_text, train_label, temp_label = train_test_split(
        texts, labels, test_size=0.3, random_state=42, stratify=labels
    )
    valid_text, test_text, valid_label, test_label = train_test_split(
        temp_text, temp_label, test_size=0.5, random_state=42, stratify=temp_label
    )
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=20000)),
            ("clf", LogisticRegression(max_iter=200, class_weight="balanced")),
        ]
    )
    pipeline.fit(train_text, train_label)
    # The validation split is kept out of the reported test metrics.
    _ = pipeline.predict(valid_text)
    predictions = [str(item) for item in pipeline.predict(test_text)]
    metrics = binary_report(list(test_label), predictions)
    examples = []
    for text, truth, pred in list(zip(test_text, test_label, predictions, strict=True))[:8]:
        if truth != pred:
            examples.append({"truth": truth, "predicted": pred, "excerpt": text[:140]})
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    import joblib

    joblib.dump(pipeline, MODEL)
    payload = {
        "synthetic": False,
        "rows_after_dedupe": len(rows),
        "train": len(train_text),
        "validation": len(valid_text),
        "test": len(test_text),
        "metrics": metrics,
        "error_examples": examples,
        "note": "Test metrics only. Do not quote them as real-world accuracy. Distribution shift is likely.",
    }
    REPORT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
