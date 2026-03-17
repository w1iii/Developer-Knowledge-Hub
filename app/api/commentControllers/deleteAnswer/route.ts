
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
    const { answer_id } = body;
    console.log("Answer id: ", answer_id)

    //CHECK IF USER IF USER_ID === ANSWER'S USER_ID
    try{
        const deleteQuery = `
            DELETE FROM answers WHERE answer_id = $1
        `
        const result = await pool.query(deleteQuery, [answer_id])
        console.log(result.rows[0])
        return NextResponse.json({ 
            message: 'Answer deleted successfully',
            result: result.rows[0]
        }, { status: 201 });

    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Delete error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }
}



