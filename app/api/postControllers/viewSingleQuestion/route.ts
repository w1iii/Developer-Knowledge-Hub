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
    const { question_id } = body

    try{
        const trackViewQuery = `
            INSERT INTO question_views (question_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (question_id, user_id) DO NOTHING
            RETURNING view_id
        `;
        const trackResult = await pool.query(trackViewQuery, [question_id, user_id]);

        if (trackResult.rows.length > 0) {
            const incrementQuery = `
                UPDATE 
                questions 
                SET 
                views = views + 1 
                WHERE 
                question_id = $1
                RETURNING views
            `;
            await pool.query(incrementQuery, [question_id]);
        }

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
                ) as user_vote,
                COALESCE(
                    (SELECT json_agg(json_build_object('tag_id', t.tag_id, 'tag_name', t.tag_name))
                     FROM question_tags qt
                     JOIN tags t ON qt.tag_id = t.tag_id
                     WHERE qt.question_id = q.question_id),
                    '[]'
                ) as tags
            FROM questions q
            LEFT JOIN users u
                ON q.user_id = u.user_id
            WHERE q.question_id = $2
        `;

        const result = await pool.query(query, [user_id, question_id]);
        
        if (result.rows.length === 0) {
            return NextResponse.json({ 
                error: 'Question not found',
            }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Server Error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
        );
    }

}
