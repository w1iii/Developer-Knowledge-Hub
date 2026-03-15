import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Dashboard routes - cookie-based redirect
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
    } catch {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // API routes - JWT verification + header injection
  if (pathname.startsWith('/api/postControllers')) {

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    try {

      console.log("TOKEN:", token)

      const secret = new TextEncoder().encode(process.env.JWT_SECRET)

      const { payload } = await jwtVerify(token, secret)

      console.log("DECODED USER:", payload)

      const requestHeaders = new Headers(request.headers)

      requestHeaders.set('x-user-id', String(payload.id))
      requestHeaders.set('x-username', String(payload.username))

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

    } catch (err) {

      console.log("JWT ERROR:", err)

      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/postControllers/:path*',
    '/api/postControllers'
  ],
}
