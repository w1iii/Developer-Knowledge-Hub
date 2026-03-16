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
    const { title, description } = body;

    console.log("============ SERVER DATA ================")
    console.log("Title: ", title, "Description: ", description)
    try{
        const insertQuery = `
            INSERT INTO questions (user_id, title, description) 
            VALUES ($1,$2, $3)
            RETURNING question_id, user_id, title, description;`;
        const result = await pool.query(insertQuery, [user_id, title, description])
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

