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
  // Tracks loading only for in-flight fetches; when `url` is null there is
  // nothing to load, so the public `loading` value below is derived instead
  // of being reset via setState inside the effect.
  const [fetchLoading, setFetchLoading] = useState<boolean>(!!url)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (!url) return

    let cancelled = false
    // Standard "fetch in an effect" pattern (react.dev/learn/synchronizing-with-effects#fetching-data):
    // kick off the request and track its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchLoading(true)
    setError(null)

    apiGet<T>(url)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong')
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [url, version])

  const loading = url ? fetchLoading : false

  return { data, loading, error, refetch }
}
