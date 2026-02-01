import json

import pytest

from app.services.audit_service import AuditService, MAX_PAYLOAD_CHARS


@pytest.fixture()
def audit_service_instance() -> AuditService:
    return AuditService()


def test_mask_payload_hides_sensitive_fields(audit_service_instance: AuditService) -> None:
    payload = {
        "password": "secret",
        "nested": {"token": "abc123", "value": "visible"},
        "plain": "data",
    }

    masked = audit_service_instance._mask_payload(payload)  # type: ignore[attr-defined]

    assert masked["password"] == "***"
    assert masked["nested"]["token"] == "***"
    assert masked["nested"]["value"] == "visible"
    assert masked["plain"] == "data"


def test_build_event_metadata_generates_uppercase_slug(audit_service_instance: AuditService) -> None:
    scope = {"path": "/api/v1/test-resource"}
    event_name, event_id = audit_service_instance._build_event_metadata(scope, "post")  # type: ignore[attr-defined]

    assert event_name == "POST /api/v1/test-resource"
    assert event_id == "POST_API_V1_TEST_RESOURCE"


def test_build_request_payload_truncates_large_body(monkeypatch: pytest.MonkeyPatch, audit_service_instance: AuditService) -> None:
    oversized_body = json.dumps({"key": "value"}).encode()

    monkeypatch.setattr("app.services.audit_service.MAX_PAYLOAD_CHARS", 4, raising=False)

    payload = audit_service_instance._build_request_payload(oversized_body)  # type: ignore[attr-defined]

    assert payload == {"_raw": "Payload truncated"}


def test_build_request_payload_masks_sensitive_fields(monkeypatch: pytest.MonkeyPatch, audit_service_instance: AuditService) -> None:
    body = json.dumps({"password": "123", "token": "abc", "name": "sample"}).encode()

    monkeypatch.setattr("app.services.audit_service.MAX_PAYLOAD_CHARS", MAX_PAYLOAD_CHARS, raising=False)

    payload = audit_service_instance._build_request_payload(body)  # type: ignore[attr-defined]

    assert payload["password"] == "***"
    assert payload["token"] == "***"
    assert payload["name"] == "sample"
