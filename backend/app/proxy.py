import time

import httpx

from .models import ProxyError, ProxyRequest, ProxyResponseData, ProxyResult

TIMEOUT_SECONDS = 30.0
MAX_BODY_BYTES = 10 * 1024 * 1024

HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
}


async def execute(req: ProxyRequest, client: httpx.AsyncClient) -> ProxyResult:
    try:
        request = client.build_request(
            req.method,
            req.url,
            headers=req.headers,
            content=req.body.encode("utf-8") if req.body is not None else None,
        )
        start = time.perf_counter()
        resp = await client.send(request, stream=True)
        try:
            raw = bytearray()
            truncated = False
            async for chunk in resp.aiter_bytes():
                raw.extend(chunk)
                if len(raw) > MAX_BODY_BYTES:
                    del raw[MAX_BODY_BYTES:]
                    truncated = True
                    break
        finally:
            await resp.aclose()
        elapsed_ms = int((time.perf_counter() - start) * 1000)
    except httpx.TimeoutException as exc:
        return ProxyResult(ok=False, error=ProxyError(type="timeout", message=str(exc)))
    except (httpx.InvalidURL, httpx.UnsupportedProtocol) as exc:
        return ProxyResult(ok=False, error=ProxyError(type="invalid_url", message=str(exc)))
    except httpx.HTTPError as exc:
        return ProxyResult(ok=False, error=ProxyError(type="connection", message=str(exc)))

    headers = [
        (k, v) for k, v in resp.headers.multi_items() if k.lower() not in HOP_BY_HOP
    ]
    content = bytes(raw)
    try:
        body = content.decode("utf-8")
    except UnicodeDecodeError:
        body = None

    return ProxyResult(
        ok=True,
        response=ProxyResponseData(
            status=resp.status_code,
            statusText=resp.reason_phrase,
            headers=headers,
            body=body,
            contentType=resp.headers.get("content-type"),
            elapsedMs=elapsed_ms,
            sizeBytes=len(content),
            truncated=truncated,
        ),
    )
