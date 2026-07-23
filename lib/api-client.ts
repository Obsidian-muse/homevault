'use client'

import { useCallback, useEffect, useState } from 'react'

export class ApiRequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseJsonOrThrow(res: Response) {
  let body: any = null
  try {
    body = await res.json()
  } catch {
    // no body
  }
  if (!res.ok) {
    throw new ApiRequestError(res.status, body?.error ?? `Request failed (${res.status})`)
  }
  return body
}

export async function apiGet<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  return parseJsonOrThrow(res)
}

export async function apiPost<T = any>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseJsonOrThrow(res)
}

export async function apiPatch<T = any>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseJsonOrThrow(res)
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' })
  return parseJsonOrThrow(res)
}

/**
 * Generic read hook: fetches `url` on mount (and whenever `url` changes),
 * exposing loading/error state plus a `refetch` you can call after a mutation.
 * Pass `url` as null to skip fetching (e.g. while a dependent id is unknown).
 */
export function useApiGet<T = any>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(!!url)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    apiGet<T>(url)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, version])

  return { data, loading, error, refetch }
}
