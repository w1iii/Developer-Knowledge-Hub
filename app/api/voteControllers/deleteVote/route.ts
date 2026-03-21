import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function DELETE(request: NextRequest) {
    const user_id = request.headers.get('x-user-id');

    if (!user_id) {
        return NextResponse.json({ 
            error: 'No user_id (no jwt token)',
        }, { status: 401 });
    }

    const body = await request.json();
    const { question_id, answer_id } = body;

    if (!question_id && !answer_id) {
        return NextResponse.json({ 
            error: 'Must provide either question_id or answer_id',
        }, { status: 400 });
    }

    if (question_id && answer_id) {
        return NextResponse.json({ 
            error: 'Cannot specify both question_id and answer_id',
        }, { status: 400 });
    }

    try {

        let targetTable = '';
        let targetId = 0;
        let uniqueColumn = '';

        if (question_id) {
            targetTable = 'questions';
            targetId = question_id;
            uniqueColumn = 'question_id';
        } else {
            targetTable = 'answers';
            targetId = answer_id;
            uniqueColumn = 'answer_id';
        }

        const existingVote = await pool.query(
            `SELECT vote_id, vote_type FROM votes 
             WHERE user_id = $1 AND ${uniqueColumn} = $2`,
            [user_id, targetId]
        );

        if (existingVote.rows.length === 0) {
            return NextResponse.json({ 
                error: 'Vote not found',
            }, { status: 404 });
        }

        const vote_type = existingVote.rows[0].vote_type;

        await pool.query(
            `DELETE FROM votes WHERE user_id = $1 AND ${uniqueColumn} = $2`,
            [user_id, targetId]
        );

        if (vote_type === 'upvote') {
            await pool.query(
                `UPDATE ${targetTable} SET upvote_count = upvote_count - 1 WHERE ${uniqueColumn} = $1`,
                [targetId]
            );
        } else {
            await pool.query(
                `UPDATE ${targetTable} SET downvote_count = downvote_count - 1 WHERE ${uniqueColumn} = $1`,
                [targetId]
            );
        }

        return NextResponse.json({ 
            message: 'Vote deleted successfully',
        });

    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { message: 'Delete vote error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
}
