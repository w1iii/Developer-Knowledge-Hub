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
    const { answer_id, question_id } = body;
    console.log("Answer id: ", answer_id)
    console.log("Question id: ", question_id)

    try{
        const checkValidQuestion = `
            SELECT question_id FROM questions
            WHERE question_id = $1;
        `
        const checkValidQuestionResult = await pool.query(checkValidQuestion, [question_id])
        if (checkValidQuestionResult .rows.length === 0) {
            return NextResponse.json({ 
                error: 'No question_id found in the database',
            }, { status: 403 });
        }

        const checkOwnership = `
            SELECT question_id FROM questions 
            WHERE question_id = $1 AND user_id = $2;
        `
        const ownershipResult = await pool.query(checkOwnership, [question_id, user_id])

        if (ownershipResult.rows.length === 0) {
            return NextResponse.json({ 
                error: 'You are not the owner of this question',
            }, { status: 403 });
        }

        try {
            await pool.query(
                `UPDATE answers SET is_accepted = FALSE WHERE question_id = $1;`,
                [question_id]
            );

            const result = await pool.query(
                `UPDATE answers 
                SET is_accepted = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE answer_id = $1 
                RETURNING answer_id, question_id, user_id, content, votes_count, is_accepted, created_at, updated_at;`,
                [answer_id]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ 
                    error: 'Answer not found',
                }, { status: 404 });
            }

            console.log(result.rows[0])
            return NextResponse.json({ 
                message: 'Answer marked as accepted',
                result: result.rows[0]
            }, { status: 201 });

        } catch (e) {
            console.log(e)
        } 
    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Mark accepted error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
       );
    }

}
