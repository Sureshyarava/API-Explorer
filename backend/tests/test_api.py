import httpx
import pytest
import respx
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    # context manager runs the lifespan, which creates app.state.http_client
    with TestClient(app) as c:
        yield c


@respx.mock
def test_proxy_route_returns_envelope(client):
    respx.get("https://api.test/ok").mock(
        return_value=httpx.Response(200, json={"hello": "world"})
    )
    res = client.post(
        "/api/proxy", json={"method": "GET", "url": "https://api.test/ok"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["response"]["status"] == 200
    assert data["response"]["contentType"] == "application/json"


@respx.mock
def test_binary_body_serializes_as_explicit_null(client):
    respx.get("https://api.test/bin").mock(
        return_value=httpx.Response(200, content=b"\xff\xfe\x00\x01")
    )
    res = client.post(
        "/api/proxy", json={"method": "GET", "url": "https://api.test/bin"}
    )
    data = res.json()
    # regression: response_model_exclude_none used to drop these keys entirely,
    # breaking the frontend's `body === null` binary check
    assert "body" in data["response"]
    assert data["response"]["body"] is None
    assert "contentType" in data["response"]


@respx.mock
def test_proxy_route_wraps_connection_error_as_200(client):
    respx.get("https://api.test/down").mock(side_effect=httpx.ConnectError("refused"))
    res = client.post(
        "/api/proxy", json={"method": "GET", "url": "https://api.test/down"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is False
    assert data["error"]["type"] == "connection"


def test_invalid_payload_is_422(client):
    res = client.post(
        "/api/proxy", json={"method": "BREW", "url": "https://api.test"}
    )
    assert res.status_code == 422
