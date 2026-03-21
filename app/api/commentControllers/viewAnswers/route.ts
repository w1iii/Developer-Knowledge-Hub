

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
        const selectQuery = `
            SELECT 
                a.answer_id, 
                a.user_id, 
                a.content, 
                a.upvote_count,
                a.downvote_count,
                COALESCE(
                    (SELECT vote_type FROM votes 
                     WHERE user_id = $1 AND answer_id = a.answer_id),
                    NULL
                ) as user_vote
            FROM answers a 
            WHERE a.question_id = $2
        `
        const result = await pool.query(selectQuery, [user_id, question_id])
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

