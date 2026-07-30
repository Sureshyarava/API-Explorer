from fastapi import FastAPI

from .models import ProxyRequest, ProxyResult
from .proxy import execute

app = FastAPI(title="API Explorer proxy")


@app.post("/api/proxy", response_model=ProxyResult, response_model_exclude_none=True)
async def proxy(request: ProxyRequest) -> ProxyResult:
    return await execute(request)
