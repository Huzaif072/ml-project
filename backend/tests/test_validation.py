"""Extra checks added for this regression model (not part of the manual's four tests)."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
from app import app, FEATURES

PAYLOAD = json.loads((ROOT / "backend/test_payload.json").read_text(encoding="utf-8"))


def test_predict_rejects_text_value():
    bad = dict(PAYLOAD)
    bad[FEATURES[0]] = "abc"
    response = app.test_client().post("/predict", json=bad)
    assert response.status_code == 400
    assert FEATURES[0] in response.get_json()["invalid"]


def test_predict_rejects_extra_feature():
    bad = dict(PAYLOAD)
    bad["not_a_feature"] = 1.0
    response = app.test_client().post("/predict", json=bad)
    assert response.status_code == 400


def test_prediction_is_a_plausible_year():
    body = app.test_client().post("/predict", json=PAYLOAD).get_json()
    assert body["task"] == "regression"
    assert 1900 < body["prediction"] < 2030
