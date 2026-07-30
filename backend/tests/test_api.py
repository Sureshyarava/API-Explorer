import httpx
import respx
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@respx.mock
def test_proxy_route_returns_envelope():
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
def test_proxy_route_wraps_connection_error_as_200():
    respx.get("https://api.test/down").mock(side_effect=httpx.ConnectError("refused"))
    res = client.post(
        "/api/proxy", json={"method": "GET", "url": "https://api.test/down"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is False
    assert data["error"]["type"] == "connection"


def test_invalid_payload_is_422():
    res = client.post(
        "/api/proxy", json={"method": "BREW", "url": "https://api.test"}
    )
    assert res.status_code == 422
