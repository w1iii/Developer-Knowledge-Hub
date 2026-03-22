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
    const { title, description, tag_ids } = body;

    console.log("============ SERVER DATA ================")
    console.log("Title: ", title, "Description: ", description, "Tags: ", tag_ids)
    try{
        const insertQuery = `
            WITH new_question AS (
                INSERT INTO questions (user_id, title, description) 
                VALUES ($1, $2, $3)
                RETURNING question_id
            )
            INSERT INTO question_tags (question_id, tag_id)
            SELECT new_question.question_id, unnest($4::int[])
            FROM new_question
            RETURNING question_id;
        `;
        const result = await pool.query(insertQuery, [user_id, title, description, tag_ids || []]);
        console.log(result.rows[0])
        return NextResponse.json({ 
            message: 'Question added successfully',
            result: result.rows[0]
        }, { status: 201 });
    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Insert user error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }

}

