
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET(request: NextRequest) {
    const user_id = request.headers.get('x-user-id');
    if (!user_id) {
        return NextResponse.json({ 
            error: 'No user_id (no jwt token)',
        }, { status: 401 });
    }

    try{
        const getVotes = `
            SELECT 
            question_id, votes_count 
            FROM questions;
            `
        const result = await pool.query(getVotes)
        console.log(result)
        return NextResponse.json({
            votes: result.rows,
            message: "Votes retrieved successfully",
            status: 201
        })

    }catch (e) {
        console.log("==============================")
        console.log(e);
        console.log("==============================")
        return NextResponse.json(
            { message: 'Add vote error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
        );
    } 
}
