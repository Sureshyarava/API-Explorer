import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendRequest } from './client'

const okEnvelope = {
  ok: true,
  response: {
    status: 200,
    statusText: 'OK',
    headers: {},
    body: '{}',
    contentType: 'application/json',
    elapsedMs: 5,
    sizeBytes: 2,
  },
}

afterEach(() => vi.restoreAllMocks())

describe('sendRequest', () => {
  it('POSTs the spec to /api/proxy and returns the parsed envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(okEnvelope), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendRequest({
      method: 'GET',
      url: 'https://api.test',
      headers: {},
      body: null,
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.test',
        headers: {},
        body: null,
      }),
    })
    expect(result).toEqual(okEnvelope)
  })

  it('throws when the proxy itself responds non-200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('bad', { status: 422 })),
    )
    await expect(
      sendRequest({ method: 'GET', url: 'x', headers: {}, body: null }),
    ).rejects.toThrow('422')
  })
})
