from fastapi import FastAPI
from pydantic import BaseModel, Field

from truthlens_ml.infer import model_status, score_text

app = FastAPI(title="TruthLens model service", version="0.1.0")


class MessageBody(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class UrlBody(BaseModel):
    url: str = Field(min_length=1, max_length=2048)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "model": model_status()}


@app.post("/analyze-message")
def analyze_message(body: MessageBody) -> dict:
    return score_text(body.text)


@app.post("/analyze-url")
def analyze_url(body: UrlBody) -> dict:
    status = model_status()
    if status["status"] != "ready":
        return {
            "status": "unavailable",
            "note": "No URL model has been trained. The web app still returns structural link checks.",
        }
    return {
        "status": "unavailable",
        "note": "A message model is present, but a separate URL model has not been trained. Structural checks remain the URL evidence.",
    }
