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
    const { question_id, content } = body;
    console.log("Question id: ", question_id)
    console.log("Content: ", content)

    try{
        const addQuery = `
            INSERT INTO answers (question_id, user_id, content)
            VALUES ($1,$2,$3)
            RETURNING question_id, user_id, content;`;
        const result = await pool.query(addQuery, [question_id, user_id, content])
        console.log(result.rows[0])
        return NextResponse.json({ 
            message: 'Answer added successfully',
            result: result.rows[0]
        }, { status: 201 });
    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Insert answer error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }
}



