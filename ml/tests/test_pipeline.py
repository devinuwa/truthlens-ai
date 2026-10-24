import json

import pytest
from fastapi.testclient import TestClient

from truthlens_ml.evaluate import binary_report
from truthlens_ml.preprocess import dedupe_rows, normalise_text


def test_normalise_is_stable():
    assert normalise_text("  Click   NOW!!! ") == normalise_text("click now")


def test_dedupe_drops_blank_and_repeat_rows():
    rows = dedupe_rows(
        [
            {"text": "Send the fee", "label": "suspicious"},
            {"text": "send   the fee", "label": "suspicious"},
            {"text": "   ", "label": "suspicious"},
        ]
    )
    assert len(rows) == 1


def test_metrics_from_a_known_confusion():
    report = binary_report(
        ["suspicious", "suspicious", "legitimate", "legitimate"],
        ["suspicious", "legitimate", "suspicious", "legitimate"],
    )
    assert report["true_positive"] == 1
    assert report["false_negative"] == 1
    assert report["false_positive"] == 1
    assert report["precision"] == 0.5
    assert report["recall"] == 0.5


def test_metrics_reject_a_mismatched_length():
    with pytest.raises(ValueError):
        binary_report(["suspicious"], [])


def test_missing_model_is_not_pretending_to_score():
    from truthlens_ml.infer import MODEL_PATH, score_text

    if MODEL_PATH.is_file():
        pytest.skip("A real model file is present, so the unavailable path is not under test.")
    result = score_text("pay the fee now")
    assert result["status"] == "unavailable"
    assert "score" not in result


def test_api_rejects_empty_text_and_reports_health():
    from api.main import app

    client = TestClient(app)
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["ok"] is True
    rejected = client.post("/analyze-message", json={"text": ""})
    assert rejected.status_code == 422
    oversized = client.post("/analyze-message", json={"text": "a" * 4001})
    assert oversized.status_code == 422
    missing = client.post("/analyze-message", json={"text": "hello there"})
    assert missing.status_code == 200
    body = missing.json()
    assert body["status"] in {"unavailable", "scored"}
    if body["status"] == "unavailable":
        assert "score" not in body or body.get("score") is None
