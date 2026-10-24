"""Small text helpers shared by training and tests."""

from __future__ import annotations

import re

TOKEN = re.compile(r"[a-z0-9']+")


def normalise_text(value: str) -> str:
    return " ".join(TOKEN.findall(value.lower()))


def dedupe_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    seen: set[str] = set()
    kept: list[dict[str, str]] = []
    for row in rows:
        key = normalise_text(row["text"])
        if not key or key in seen:
            continue
        seen.add(key)
        kept.append({"text": row["text"].strip(), "label": row["label"].strip().lower()})
    return kept
