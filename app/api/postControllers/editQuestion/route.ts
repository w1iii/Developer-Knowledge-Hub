// Update the editQuestion API Route (app/api/postControllers/editQuestion/route.ts):
//    - Implement POST handler to update the question in the DB.
//    - Validate user ownership using user_id from headers.
//    - Accept question_id, title, description in the request body.
//    - Return success/error responses.
//    - Use parameterized queries to prevent SQL injection.


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
    const { question_id, title, description } = body;

    try{
        const updateQuery = `
            UPDATE questions 
            SET title = $1, 
            description = $2 
            WHERE question_id = $3 
            AND user_id = $4 
            RETURNING *;
        `
        const result = await pool.query(updateQuery, [title, description, question_id, user_id])
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
