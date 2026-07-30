import pytest
from pydantic import ValidationError

from app.models import ProxyRequest


def test_valid_request_with_defaults():
    req = ProxyRequest(method="GET", url="https://example.com")
    assert req.headers == {}
    assert req.body is None


def test_rejects_unknown_method():
    with pytest.raises(ValidationError):
        ProxyRequest(method="BREW", url="https://example.com")


def test_rejects_non_http_url():
    with pytest.raises(ValidationError):
        ProxyRequest(method="GET", url="ftp://example.com")


def test_accepts_all_supported_methods():
    for m in ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]:
        assert ProxyRequest(method=m, url="http://x.dev").method == m
