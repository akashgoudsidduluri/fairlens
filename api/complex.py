"""Complex-analysis payload for one completed audit.

The payload is derived entirely from the stored ``AuditReport``. No target is
called, no new twin is generated, and no number is invented: a measurement the
audit did not take is reported as unsupported rather than as zero.

Three sections:

``proxy``
    Counterfactual flips for the non-gender treatment attributes. ``pincode_group``
    and ``name_group`` stand in for unobserved group membership; ``age`` is the
    registry's ``role: proxy`` attribute. Only measured single-attribute findings
    are shown. ``urban_rural`` is deliberately absent: the frozen registry marks
    it context-only because P3 has no rural pincode, so flipping it alone is not
    defined for the whole population.

``hotspots``
    Generalized treatment x context findings, kept and rejected alike. The
    discovery/confirmation counts and Holm correction live in the report's
    ``observational.search`` block and are not recomputed here.

``decomposition``
    A signed comparison of the naive observational gap and the twin
    counterfactual gap for one anchor attribute. The difference between them is
    reported as a *confounding shift*, not as a legitimate/structural share: a
    difference of two bounded rates can exceed 100 points and can reverse sign,
    so calling it a share would be false. ``direction`` says which case applies.
"""

from __future__ import annotations

from typing import Any, Literal

MATERIALITY = 0.02

# Frozen by config.yaml: legitimate attributes are context-only and are never
# reported as bias on their own, so they are not candidates here either.
PROXY_ATTRIBUTES: tuple[tuple[str, str], ...] = (
    ("pincode_group", "protected stand-in; treatment and context"),
    ("name_group", "protected stand-in; treatment and context"),
    ("age", "role: proxy; treatment and context"),
)

DIRECTION_NOTE = {
    "explained": (
        "The observed gap does not survive the twin test: twins with identical "
        "legitimate signals flip at less than the materiality threshold."
    ),
    "reversal": (
        "The observed gap and the twin gap point in opposite directions. "
        "Composition, not treatment, drives the naive number; no additive "
        "legitimate/structural split is valid."
    ),
    "hidden": (
        "The naive gap is below materiality, but the twins still flip. The "
        "population average hides the treatment effect."
    ),
    "same_direction": (
        "Observed and twin gaps share a direction. The confounding shift is the "
        "part of the naive gap that is not reproduced by the twins."
    ),
    "no_gap": (
        "Neither the observed gap nor the twin gap reaches materiality."
    ),
}


def _rate(rates: dict[str, Any], key: str) -> float | None:
    value = rates.get(key)
    return float(value) if isinstance(value, (int, float)) else None


def _finding_rates(finding: dict[str, Any]) -> tuple[float | None, float | None]:
    """Return ``(target_rate, comparison_rate)`` in the finding's own direction."""

    rates = finding.get("observational_rates") or {}
    target = _rate(rates, str(finding.get("target_group", "")))
    comparison = _rate(rates, str(finding.get("comparison_group", "")))
    if target is None or comparison is None:
        # Generalized findings store the pair under these two keys instead.
        target = _rate(rates, "target")
        comparison = _rate(rates, "comparison")
    return target, comparison


def _observed_gap(finding: dict[str, Any]) -> float | None:
    target, comparison = _finding_rates(finding)
    if target is None or comparison is None:
        return None
    # Positive means the target group is approved more often than the comparison.
    # This is the opposite sign of ``Finding.observational_gap``, which is
    # comparison-minus-target; the payload is explicit about the orientation.
    return target - comparison


def _attribute(finding: dict[str, Any]) -> str:
    if finding.get("treatment"):
        return str(finding["treatment"])
    text = str(finding.get("attribute_or_subgroup", ""))
    return text.split("=", 1)[0].strip()


def _proxy_rows(findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    singles = [f for f in findings if f.get("kind") == "single_attribute"]
    for attribute, role in PROXY_ATTRIBUTES:
        match = next(
            (f for f in singles if _attribute(f) == attribute),
            None,
        )
        if match is None:
            rows.append(
                {
                    "attribute": attribute,
                    "role": role,
                    "supported": False,
                    "reason": (
                        "no single-attribute estimate in this audit; the "
                        "generalized protocol confirms cells instead"
                        if any(f.get("kind") == "generalized" for f in findings)
                        else "this target or protocol did not probe the attribute"
                    ),
                }
            )
            continue
        evidence = match.get("evidence") or {}
        rows.append(
            {
                "attribute": attribute,
                "role": role,
                "supported": True,
                "finding_id": match.get("id"),
                "status": match.get("status"),
                "net_flip_rate": evidence.get("net_flip_rate"),
                "ci_low": evidence.get("ci_low"),
                "ci_high": evidence.get("ci_high"),
                "p_adjusted": evidence.get("p_adjusted"),
                "n": evidence.get("n"),
            }
        )
    return rows


def _hotspots(findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for finding in findings:
        if finding.get("kind") != "generalized":
            continue
        evidence = finding.get("evidence") or {}
        rows.append(
            {
                "finding_id": finding.get("id"),
                "treatment": finding.get("treatment"),
                "treatment_level": finding.get("treatment_level"),
                "context": finding.get("context") or {},
                "net_flip_rate": evidence.get("net_flip_rate"),
                "ci_low": evidence.get("ci_low"),
                "ci_high": evidence.get("ci_high"),
                "p_adjusted": evidence.get("p_adjusted"),
                "n": evidence.get("n"),
                "status": finding.get("status"),
                "merged_into": finding.get("merged_into"),
            }
        )
    return rows


def _anchor(
    findings: list[dict[str, Any]], observational: dict[str, Any]
) -> dict[str, Any] | None:
    """Pick the finding that carries the largest measured treatment effect.

    A kept finding wins over a rejected one; ties break on the absolute twin
    flip, then on the absolute observed gap, so a clean model still anchors on
    its largest naive gap instead of returning nothing.
    """

    candidates = [
        f
        for f in findings
        if f.get("kind") in {"single_attribute", "generalized"}
        and f.get("status") != "merged"
        and (f.get("evidence") or {}).get("net_flip_rate") is not None
    ]
    if not candidates:
        return None

    def key(finding: dict[str, Any]) -> tuple[int, float, float]:
        evidence = finding.get("evidence") or {}
        gap = _observed_gap(finding)
        return (
            1 if finding.get("status") == "kept" else 0,
            abs(float(evidence.get("net_flip_rate") or 0.0)),
            abs(gap) if gap is not None else 0.0,
        )

    anchor = max(candidates, key=key)
    if _observed_gap(anchor) is None:
        # Generalized findings can lack the per-group rates; fall back to the
        # report-level observational table for the same attribute.
        attribute = _attribute(anchor)
        table = (observational.get("rates") or {}).get(attribute) or {}
        target = table.get(str(anchor.get("target_group") or ""))
        comparison = table.get(str(anchor.get("comparison_group") or ""))
        if isinstance(target, dict) and isinstance(comparison, dict):
            anchor = dict(anchor)
            anchor["observational_rates"] = {
                str(anchor.get("target_group")): target.get("rate"),
                str(anchor.get("comparison_group")): comparison.get("rate"),
            }
    return anchor


def _direction(observed: float, counterfactual: float, materiality: float) -> str:
    if abs(counterfactual) < materiality:
        return "explained" if abs(observed) >= materiality else "no_gap"
    if observed * counterfactual < 0:
        return "reversal"
    if abs(observed) < materiality:
        return "hidden"
    return "same_direction"


def _decomposition(
    findings: list[dict[str, Any]],
    observational: dict[str, Any],
    materiality: float = MATERIALITY,
) -> dict[str, Any] | None:
    anchor = _anchor(findings, observational)
    if anchor is None:
        return None
    observed = _observed_gap(anchor)
    evidence = anchor.get("evidence") or {}
    if observed is None or evidence.get("net_flip_rate") is None:
        return None
    counterfactual = float(evidence["net_flip_rate"])
    direction = _direction(observed, counterfactual, materiality)
    return {
        "finding_id": anchor.get("id"),
        "attribute": _attribute(anchor),
        "target_group": anchor.get("target_group"),
        "comparison_group": anchor.get("comparison_group"),
        "observed_gap": observed,
        "counterfactual_gap": counterfactual,
        "confounding_shift": counterfactual - observed,
        "direction": direction,
        "direction_note": DIRECTION_NOTE[direction],
        "materiality": materiality,
        "n": evidence.get("n"),
        "note": (
            "Observed gap is target minus comparison approval rate. The "
            "confounding shift is a difference of two measured gaps, not a "
            "causal share; it can exceed 100 points and can reverse sign."
        ),
    }


def build_complex_analysis(record: dict[str, Any]) -> dict[str, Any]:
    """Build the payload for one completed audit record."""

    result = record.get("result") or {}
    findings = list(result.get("findings") or [])
    observational = result.get("observational") or {}
    config = result.get("config") or {}
    search_enabled = bool(
        (((config.get("audit") or {}).get("search") or {}).get("enabled", False))
    )
    generalized = any(f.get("kind") == "generalized" for f in findings)
    protocol: Literal["generalized", "single", "unknown"] = (
        "generalized" if generalized or search_enabled else "single"
    )
    materiality = float(((config.get("audit") or {}).get("materiality", MATERIALITY)))

    return {
        "audit_id": record.get("id"),
        "model_id": result.get("model_id", record.get("model_id")),
        "protocol": protocol,
        "proxy": _proxy_rows(findings),
        "hotspots": _hotspots(findings),
        "decomposition": _decomposition(findings, observational, materiality),
        "notes": [
            "No target call and no new probe: every value comes from the stored report.",
            "Legitimate attributes (income, credit_score, loan_amount, "
            "employment_years) are never treatments; they appear only as context.",
        ],
    }
