export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

export interface HeaderRow {
  key: string
  value: string
}

export interface ProxyRequest {
  method: HttpMethod
  url: string
  headers: Record<string, string>
  body: string | null
}

export interface ProxyResponseData {
  status: number
  statusText: string
  // (name, value) pairs: repeated headers like Set-Cookie must survive
  headers: [string, string][]
  body: string | null
  contentType: string | null
  elapsedMs: number
  sizeBytes: number
  truncated: boolean
}

export interface ProxyError {
  type: 'timeout' | 'connection' | 'invalid_url'
  message: string
}

export type ProxyResult =
  | { ok: true; response: ProxyResponseData }
  | { ok: false; error: ProxyError }
