

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function POST(request: NextRequest) {
    const user_id = request.headers.get('x-user-id');
    const username = request.headers.get('x-username');
    console.log("user id: ", user_id)
    console.log("username: ", username)

    if(!user_id){
        console.log("No token, user_id: ", user_id)
        return NextResponse.json({ 
            error: 'No user_id (no jwt token)',
        }, { status: 401 });
    }

    const body = await request.json();
    const { question_id } = body;

    try{
        const selectQuery = `SELECT answer_id, content FROM answers WHERE question_id = $1`
        const result = await pool.query(selectQuery, [question_id])
        if(result.rows.length === 0){
            return NextResponse.json({ message: 'No comments/answers found'})
        }
        console.log(result.rows)
        return NextResponse.json({ 
            message: 'Answers get successfully',
            result: result.rows,
        }, { status: 201 });
    }catch(e){
        console.log("Error: ", e)
        return NextResponse.json(
            { message: 'Server Error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }

}

