"""Metrics for a binary suspicious/legitimate classifier."""

from __future__ import annotations


def binary_report(y_true: list[str], y_pred: list[str], positive: str = "suspicious") -> dict[str, float | int]:
    if len(y_true) != len(y_pred) or not y_true:
        raise ValueError("Predictions and labels must be the same non-empty length.")
    tp = fp = tn = fn = 0
    for truth, pred in zip(y_true, y_pred, strict=True):
        if truth == positive and pred == positive:
            tp += 1
        elif truth != positive and pred == positive:
            fp += 1
        elif truth == positive and pred != positive:
            fn += 1
        else:
            tn += 1
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "true_positive": tp,
        "false_positive": fp,
        "true_negative": tn,
        "false_negative": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
    }
