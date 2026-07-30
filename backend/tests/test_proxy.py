import httpx
import respx

import app.proxy as proxy_module
from app.models import ProxyRequest, ProxyResult
from app.proxy import execute


async def run(req: ProxyRequest) -> ProxyResult:
    async with httpx.AsyncClient(timeout=5.0, follow_redirects=False) as client:
        return await execute(req, client)


@respx.mock
async def test_success_envelope():
    respx.get("https://api.test/data").mock(
        return_value=httpx.Response(
            200, json={"a": 1}, headers={"connection": "keep-alive"}
        )
    )
    result = await run(ProxyRequest(method="GET", url="https://api.test/data"))
    assert result.ok is True
    r = result.response
    assert r.status == 200
    assert r.statusText == "OK"
    assert r.body == '{"a":1}'
    assert r.contentType == "application/json"
    assert r.sizeBytes == len(b'{"a":1}')
    assert r.elapsedMs >= 0
    assert r.truncated is False
    header_names = [k for k, _ in r.headers]
    assert "connection" not in header_names  # hop-by-hop stripped
    assert ("content-type", "application/json") in r.headers


@respx.mock
async def test_repeated_headers_are_preserved():
    respx.get("https://api.test/cookies").mock(
        return_value=httpx.Response(
            200, headers=[("set-cookie", "a=1"), ("set-cookie", "b=2")]
        )
    )
    result = await run(ProxyRequest(method="GET", url="https://api.test/cookies"))
    values = [v for k, v in result.response.headers if k == "set-cookie"]
    assert values == ["a=1", "b=2"]


@respx.mock
async def test_target_error_status_is_still_ok_envelope():
    respx.get("https://api.test/missing").mock(return_value=httpx.Response(404))
    result = await run(ProxyRequest(method="GET", url="https://api.test/missing"))
    assert result.ok is True
    assert result.response.status == 404


@respx.mock
async def test_forwards_method_headers_and_body():
    route = respx.post("https://api.test/echo").mock(return_value=httpx.Response(201))
    await run(
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
    result = await run(ProxyRequest(method="GET", url="https://api.test/slow"))
    assert result.ok is False
    assert result.error.type == "timeout"


@respx.mock
async def test_connection_failure_maps_to_connection_error():
    respx.get("https://api.test/down").mock(side_effect=httpx.ConnectError("refused"))
    result = await run(ProxyRequest(method="GET", url="https://api.test/down"))
    assert result.ok is False
    assert result.error.type == "connection"


@respx.mock
async def test_binary_body_returns_null_body_with_size():
    respx.get("https://api.test/bin").mock(
        return_value=httpx.Response(200, content=b"\xff\xfe\x00\x01")
    )
    result = await run(ProxyRequest(method="GET", url="https://api.test/bin"))
    assert result.ok is True
    assert result.response.body is None
    assert result.response.sizeBytes == 4


@respx.mock
async def test_body_truncated_at_cap(monkeypatch):
    monkeypatch.setattr(proxy_module, "MAX_BODY_BYTES", 8)
    respx.get("https://api.test/big").mock(
        return_value=httpx.Response(200, content=b"0123456789")
    )
    result = await run(ProxyRequest(method="GET", url="https://api.test/big"))
    assert result.ok is True
    assert result.response.truncated is True
    assert result.response.body == "01234567"
    assert result.response.sizeBytes == 8
