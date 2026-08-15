import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Resolves the current authenticated user or throws a 401 ApiError.
 * Call this at the top of every protected route handler.
 */
export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new ApiError(401, 'You must be signed in to do this')
  }
  return session.user
}

/**
 * Wraps a route handler body, converting thrown errors into consistent
 * JSON error responses instead of leaking stack traces or crashing.
 */
export async function withErrorHandling(handler: () => Promise<NextResponse>) {
  try {
    return await handler()
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: err.flatten().fieldErrors },
        { status: 400 }
      )
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
      }
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'A record with these details already exists' }, { status: 409 })
      }
    }
    console.error('[API_ERROR]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
