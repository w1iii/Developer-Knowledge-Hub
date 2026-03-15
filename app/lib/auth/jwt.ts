import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface User {
  user_id: string;
  username: string;
}

export function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Access token required' },
      { status: 401 }
    );
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as User;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.user_id);
    requestHeaders.set('x-username', user.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err: any) {
    console.log('Error name:', err.name);
    console.log('Error message:', err.message);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    '/api/protected/:path*',
    '/api/notes/:path*',
    '/api/folders/:path*',
    '/api/postControllers/:path*', 
  ],
};
