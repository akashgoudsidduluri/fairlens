"""Complex-analysis payload: proxy flips, hotspots, and gap decomposition."""

from __future__ import annotations

import threading
import time
from typing import Any

import pytest
from fastapi.testclient import TestClient

from api.app import create_app
from api.complex import build_complex_analysis
from config_loader import load_config
from schemas import AgentEvent, AuditReport


def _finding(
    *,
    id: str = "single-gender-female",
    kind: str = "single_attribute",
    attribute: str = "gender",
    target: str = "female",
    comparison: str = "male",
    target_rate: float | None = 0.5,
    comparison_rate: float | None = 0.4,
    net: float = 0.05,
    status: str = "kept",
    treatment: str | None = None,
    treatment_level: str | None = None,
    context: dict[str, str] | None = None,
) -> dict[str, Any]:
    rates: dict[str, Any] = {}
    if target_rate is not None:
        rates[target] = target_rate
    if comparison_rate is not None:
        rates[comparison] = comparison_rate
    return {
        "id": id,
        "kind": kind,
        "attribute_or_subgroup": f"{attribute}={target}",
        "target_group": target,
        "comparison_group": comparison,
        "evidence": {
            "n": 2000,
            "b": 100,
            "c": 0,
            "net_flip_rate": net,
            "ci_low": net - 0.01,
            "ci_high": net + 0.01,
            "p_raw": 1e-9,
            "p_adjusted": 1e-8,
        },
        "observational_gap": (comparison_rate or 0) - (target_rate or 0),
        "observational_rates": rates,
        "status": status,
        "reason": "",
        "treatment": treatment,
        "treatment_level": treatment_level,
        "context": context or {},
        "search": {},
        "merged_into": None,
    }


def _record(findings: list[dict[str, Any]], *, search: bool = False) -> dict[str, Any]:
    return {
        "id": "audit1",
        "model_id": 2,
        "result": {
            "model_id": 2,
            "config": {"audit": {"search": {"enabled": search}}},
            "findings": findings,
            "observational": {"rates": {}},
        },
    }


def test_observed_gap_is_target_minus_comparison() -> None:
    payload = build_complex_analysis(_record([_finding()]))
    decomposition = payload["decomposition"]

    # 0.50 target - 0.40 comparison, not the Finding.observational_gap sign.
    assert decomposition["observed_gap"] == pytest.approx(0.10)
    assert decomposition["counterfactual_gap"] == pytest.approx(0.05)
    assert decomposition["confounding_shift"] == pytest.approx(-0.05)
    assert decomposition["direction"] == "same_direction"


def test_shift_sums_to_counterfactual() -> None:
    payload = build_complex_analysis(_record([_finding(net=0.12)]))
    d = payload["decomposition"]
    assert d["observed_gap"] + d["confounding_shift"] == pytest.approx(
        d["counterfactual_gap"]
    )


def test_opposite_directions_are_reported_as_reversal_not_a_share() -> None:
    # Model 2 shape: women approved far less naively, twins flip toward women.
    finding = _finding(
        target_rate=0.0065, comparison_rate=0.667, net=0.6535, status="kept"
    )
    payload = build_complex_analysis(_record([finding]))
    d = payload["decomposition"]

    assert d["observed_gap"] == pytest.approx(-0.6605, abs=1e-4)
    assert d["counterfactual_gap"] == pytest.approx(0.6535)
    assert d["confounding_shift"] == pytest.approx(1.314, abs=1e-3)
    assert abs(d["confounding_shift"]) > 1.0  # allowed: a difference, not a share
    assert d["direction"] == "reversal"


def test_neutral_twins_explain_the_observed_gap() -> None:
    # Model 7 shape: a 15-point naive gap, twins never flip.
    finding = _finding(
        target_rate=0.3574, comparison_rate=0.5075, net=0.0, status="rejected"
    )
    payload = build_complex_analysis(_record([finding]))
    d = payload["decomposition"]

    assert d["direction"] == "explained"
    assert d["observed_gap"] == pytest.approx(-0.1501, abs=1e-4)
    assert d["counterfactual_gap"] == 0.0


def test_hidden_effect_when_naive_gap_is_immaterial() -> None:
    finding = _finding(target_rate=0.405, comparison_rate=0.4, net=0.1)
    payload = build_complex_analysis(_record([finding]))
    assert payload["decomposition"]["direction"] == "hidden"


def test_no_gap_when_both_sides_are_immaterial() -> None:
    finding = _finding(target_rate=0.401, comparison_rate=0.4, net=0.001)
    payload = build_complex_analysis(_record([finding]))
    assert payload["decomposition"]["direction"] == "no_gap"


def test_proxy_rows_report_measured_attributes_and_absence() -> None:
    findings = [
        _finding(
            id="single-pincode_group-p2",
            attribute="pincode_group",
            target="P2",
            comparison="P1",
            target_rate=0.30,
            comparison_rate=0.35,
            net=0.0,
            status="rejected",
        ),
        _finding(
            id="single-name_group-n2",
            attribute="name_group",
            target="N2",
            comparison="N1",
            target_rate=0.29,
            comparison_rate=0.36,
            net=0.0,
            status="rejected",
        ),
    ]
    payload = build_complex_analysis(_record(findings))
    rows = {row["attribute"]: row for row in payload["proxy"]}

    assert rows["pincode_group"]["supported"] is True
    assert rows["pincode_group"]["net_flip_rate"] == 0.0
    assert rows["name_group"]["supported"] is True
    assert rows["age"]["supported"] is False
    assert "reason" in rows["age"]
    # Legitimate attributes never appear as proxy rows.
    assert "loan_amount" not in rows
    assert "income" not in rows


def test_generalized_hotspots_keep_context_and_status() -> None:
    finding = _finding(
        id="gen-gender-female-age-45plus-rural",
        kind="generalized",
        target="female",
        comparison="male",
        target_rate=None,
        comparison_rate=None,
        net=0.6,
        status="kept",
        treatment="gender",
        treatment_level="female",
        context={"age": "45+", "urban_rural": "rural"},
    )
    payload = build_complex_analysis(_record([finding], search=True))

    assert payload["protocol"] == "generalized"
    assert len(payload["hotspots"]) == 1
    hotspot = payload["hotspots"][0]
    assert hotspot["treatment"] == "gender"
    assert hotspot["context"] == {"age": "45+", "urban_rural": "rural"}
    assert hotspot["status"] == "kept"
    assert payload["decomposition"] is None  # no per-group rates on this finding


def test_generalized_decomposition_falls_back_to_report_rates() -> None:
    finding = _finding(
        id="gen-gender-female-age-45plus",
        kind="generalized",
        target="female",
        comparison="male",
        target_rate=None,
        comparison_rate=None,
        net=0.6,
        status="kept",
        treatment="gender",
        treatment_level="female",
        context={"age": "45+"},
    )
    record = _record([finding], search=True)
    record["result"]["observational"] = {
        "rates": {
            "gender": {
                "female": {"n": 100, "rate": 0.2},
                "male": {"n": 100, "rate": 0.7},
            }
        }
    }
    d = build_complex_analysis(record)["decomposition"]
    assert d["observed_gap"] == pytest.approx(-0.5)
    assert d["direction"] == "reversal"


def test_largest_kept_effect_anchors_the_decomposition() -> None:
    weak = _finding(id="single-gender-female", net=0.05, status="kept")
    strong = _finding(id="single-pincode_group-p2", net=0.3, status="kept")
    payload = build_complex_analysis(_record([weak, strong]))
    assert payload["decomposition"]["finding_id"] == "single-pincode_group-p2"


def test_merged_findings_cannot_anchor_the_decomposition() -> None:
    kept = _finding(id="single-gender-female", net=0.1, status="kept")
    merged = _finding(
        id="gen-gender-female-age-45plus",
        kind="generalized",
        net=0.9,
        status="merged",
        treatment="gender",
        treatment_level="female",
        context={"age": "45+"},
    )
    payload = build_complex_analysis(_record([kept, merged], search=True))
    assert payload["decomposition"]["finding_id"] == "single-gender-female"


def _config(tmp_path):
    config = load_config()
    config["service"]["audit_db"] = str(tmp_path / "audits.db")
    config["service"]["sse_poll_seconds"] = 0.01
    config["certificate"]["db_path"] = str(tmp_path / "certificates.db")
    return config


def _report(config: dict[str, Any]) -> AuditReport:
    return AuditReport(
        model_id=2,
        config=config,
        findings=[
            {
                "id": "single-gender-female",
                "kind": "single_attribute",
                "attribute_or_subgroup": "gender=female",
                "target_group": "female",
                "comparison_group": "male",
                "evidence": {
                    "n": 2000,
                    "b": 100,
                    "c": 0,
                    "net_flip_rate": 0.05,
                    "ci_low": 0.04,
                    "ci_high": 0.06,
                    "p_raw": 0.001,
                    "p_adjusted": 0.002,
                },
                "observational_gap": 0.1,
                "observational_rates": {"female": 0.4, "male": 0.5},
                "status": "kept",
                "reason": "",
            }
        ],
        narrative="",
    )


def test_endpoint_returns_the_builder_payload(tmp_path) -> None:
    release = threading.Event()

    def audit_fn(model_id, api_url, config, seed=None, **_: Any):
        yield AgentEvent(agent="planner", message="started")
        release.wait(timeout=10)
        return _report(config)

    app = create_app(config=_config(tmp_path), audit_fn=audit_fn)
    with TestClient(app) as client:
        created = client.post(
            "/audits",
            json={"model_id": 2, "include_mitigation": False, "include_narrative": False},
        )
        assert created.status_code == 202
        audit_id = created.json()["id"]

        # While the audit is running the payload is a conflict, not a guess.
        running = client.get(f"/audits/{audit_id}/complex-analysis")
        assert running.status_code == 409

        release.set()
        deadline = time.time() + 5
        while time.time() < deadline:
            record = client.get(f"/audits/{audit_id}").json()
            if record["status"] in {"completed", "failed"}:
                break
            time.sleep(0.02)
        assert record["status"] == "completed"

        response = client.get(f"/audits/{audit_id}/complex-analysis")
        assert response.status_code == 200
        body = response.json()
        assert body["audit_id"] == audit_id
        assert body["protocol"] == "single"
        assert len(body["proxy"]) == 3
        assert body["decomposition"]["attribute"] == "gender"

        missing = client.get("/audits/nope/complex-analysis")
        assert missing.status_code == 404
