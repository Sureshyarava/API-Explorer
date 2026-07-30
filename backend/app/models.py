from typing import Literal

from pydantic import BaseModel, field_validator

Method = Literal["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]


class ProxyRequest(BaseModel):
    method: Method
    url: str
    headers: dict[str, str] = {}
    body: str | None = None

    @field_validator("url")
    @classmethod
    def url_must_be_http(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("url must start with http:// or https://")
        return v


class ProxyResponseData(BaseModel):
    status: int
    statusText: str
    headers: dict[str, str]
    body: str | None
    contentType: str | None
    elapsedMs: int
    sizeBytes: int


class ProxyError(BaseModel):
    type: Literal["timeout", "connection", "invalid_url"]
    message: str


class ProxyResult(BaseModel):
    ok: bool
    response: ProxyResponseData | None = None
    error: ProxyError | None = None
