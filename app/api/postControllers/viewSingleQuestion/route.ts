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
        const query = `
            UPDATE 
            questions 
            SET 
            views = views + 1 
            WHERE 
            question_id = $1
            RETURNING views
;`
        const result = await pool.query(query, [question_id])
        return NextResponse.json({
            views: result.rows[0].views
        })
    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Server Error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }

}

