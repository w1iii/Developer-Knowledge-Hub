
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET(request: NextRequest) {
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

    try{
          const query = `
              SELECT 
                 q.question_id,
                 q.user_id,
                 u.username,
                 q.title,
                 q.description,
                 q.upvote_count,
                 q.downvote_count,
                 q.views,
                 COALESCE(
                     (SELECT vote_type FROM votes 
                      WHERE user_id = $1 AND question_id = q.question_id),
                     NULL
                 ) as user_vote
             FROM questions q
            LEFT JOIN users u
                ON q.user_id = u.user_id
            ORDER BY (q.upvote_count - q.downvote_count) DESC, q.upvote_count DESC, q.views DESC
        `;

        const result = await pool.query(query, [user_id]);
        const data = result.rows;
        console.log("Data: ", data);
        return NextResponse.json(result.rows);

    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Server Error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }

}

