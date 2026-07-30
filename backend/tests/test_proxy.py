import httpx
import respx

from app.models import ProxyRequest
from app.proxy import execute


@respx.mock
async def test_success_envelope():
    respx.get("https://api.test/data").mock(
        return_value=httpx.Response(
            200, json={"a": 1}, headers={"connection": "keep-alive"}
        )
    )
    result = await execute(ProxyRequest(method="GET", url="https://api.test/data"))
    assert result.ok is True
    r = result.response
    assert r.status == 200
    assert r.statusText == "OK"
    assert r.body == '{"a":1}'
    assert r.contentType == "application/json"
    assert r.sizeBytes == len(b'{"a":1}')
    assert r.elapsedMs >= 0
    assert "connection" not in r.headers  # hop-by-hop stripped
    assert r.headers["content-type"] == "application/json"


@respx.mock
async def test_target_error_status_is_still_ok_envelope():
    respx.get("https://api.test/missing").mock(return_value=httpx.Response(404))
    result = await execute(ProxyRequest(method="GET", url="https://api.test/missing"))
    assert result.ok is True
    assert result.response.status == 404


@respx.mock
async def test_forwards_method_headers_and_body():
    route = respx.post("https://api.test/echo").mock(return_value=httpx.Response(201))
    await execute(
        ProxyRequest(
            method="POST",
            url="https://api.test/echo",
            headers={"X-Token": "abc"},
            body='{"n": 2}',
        )
    )
    sent = route.calls.last.request
    assert sent.headers["x-token"] == "abc"
    assert sent.content == b'{"n": 2}'


@respx.mock
async def test_timeout_maps_to_timeout_error():
    respx.get("https://api.test/slow").mock(side_effect=httpx.ConnectTimeout("timed out"))
    result = await execute(ProxyRequest(method="GET", url="https://api.test/slow"))
    assert result.ok is False
    assert result.error.type == "timeout"


@respx.mock
async def test_connection_failure_maps_to_connection_error():
    respx.get("https://api.test/down").mock(side_effect=httpx.ConnectError("refused"))
    result = await execute(ProxyRequest(method="GET", url="https://api.test/down"))
    assert result.ok is False
    assert result.error.type == "connection"


@respx.mock
async def test_binary_body_returns_null_body_with_size():
    respx.get("https://api.test/bin").mock(
        return_value=httpx.Response(200, content=b"\xff\xfe\x00\x01")
    )
    result = await execute(ProxyRequest(method="GET", url="https://api.test/bin"))
    assert result.ok is True
    assert result.response.body is None
    assert result.response.sizeBytes == 4
