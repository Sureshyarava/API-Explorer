import time

import httpx

from .models import ProxyError, ProxyRequest, ProxyResponseData, ProxyResult

TIMEOUT_SECONDS = 30.0

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


async def execute(req: ProxyRequest) -> ProxyResult:
    try:
        async with httpx.AsyncClient(
            timeout=TIMEOUT_SECONDS, follow_redirects=False
        ) as client:
            start = time.perf_counter()
            resp = await client.request(
                req.method,
                req.url,
                headers=req.headers,
                content=req.body.encode("utf-8") if req.body is not None else None,
            )
            elapsed_ms = int((time.perf_counter() - start) * 1000)
    except httpx.TimeoutException as exc:
        return ProxyResult(ok=False, error=ProxyError(type="timeout", message=str(exc)))
    except (httpx.InvalidURL, httpx.UnsupportedProtocol) as exc:
        return ProxyResult(ok=False, error=ProxyError(type="invalid_url", message=str(exc)))
    except httpx.HTTPError as exc:
        return ProxyResult(ok=False, error=ProxyError(type="connection", message=str(exc)))

    headers = {k: v for k, v in resp.headers.items() if k.lower() not in HOP_BY_HOP}
    try:
        body = resp.content.decode("utf-8")
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
            sizeBytes=len(resp.content),
        ),
    )
