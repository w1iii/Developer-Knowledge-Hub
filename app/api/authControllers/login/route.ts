import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface User {
  user_id: string;
  username: string;
  password_hash: string;
}

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const accessToken = jwt.sign({id: user.user_id}, process.env.JWT_SECRET!, {expiresIn: '15m'});

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        username: user.username,
      },
    })
    const refreshToken = jwt.sign(
      { id: user.user_id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    response.cookies.set('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',   
        maxAge: 60 * 15
      });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response


  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

async function authenticateUser(email: string, password: string): Promise<User | null> {
    try{
        const query = `SELECT user_id, username, password_hash FROM users WHERE email = $1`
        const result = await pool.query(query, [email])

        const user = result.rows[0]
        if (!user) return null

        const isMatch = await bcrypt.compare(password, user.password_hash)

        if(!isMatch) return null
        return user
    }catch(e){
        console.log(e, 'server error')
    }
  return null
}
