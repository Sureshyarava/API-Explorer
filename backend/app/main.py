from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request

from .models import ProxyRequest, ProxyResult
from .proxy import TIMEOUT_SECONDS, execute


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(
        timeout=TIMEOUT_SECONDS, follow_redirects=False
    )
    yield
    await app.state.http_client.aclose()


app = FastAPI(title="API Explorer proxy", lifespan=lifespan)


@app.post("/api/proxy", response_model=ProxyResult)
async def proxy(payload: ProxyRequest, request: Request) -> ProxyResult:
    return await execute(payload, request.app.state.http_client)
