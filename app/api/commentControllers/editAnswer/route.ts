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
    const { answer_id, content } = body;
    console.log("Answer id: ", answer_id)
    console.log("Content: ", content)

    try{
        const updateQuery = `
            UPDATE answers 
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE answer_id = $2 
            AND user_id = $3 
            RETURNING answer_id, question_id, user_id, content, votes_count, is_accepted, created_at, updated_at;
        `
        const result = await pool.query(updateQuery, [content, answer_id, user_id])
        
        if (result.rows.length === 0) {
            return NextResponse.json({ 
                error: 'Answer not found or you are not the owner',
            }, { status: 403 });
        }

        console.log(result.rows[0])
        return NextResponse.json({ 
            message: 'Answer updated successfully',
            result: result.rows[0]
        }, { status: 201 });
    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Update answer error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }

}
