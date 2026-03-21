import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function POST(request: NextRequest) {
    const user_id = request.headers.get('x-user-id');

    if (!user_id) {
        return NextResponse.json({ 
            error: 'No user_id (no jwt token)',
        }, { status: 401 });
    }

    const body = await request.json();
    const { question_id, answer_id, vote_type } = body;

    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
        return NextResponse.json({ 
            error: 'Invalid vote_type. Must be upvote or downvote',
        }, { status: 400 });
    }

    if (!question_id && !answer_id) {
        return NextResponse.json({ 
            error: 'Must provide either question_id or answer_id',
        }, { status: 400 });
    }

    if (question_id && answer_id) {
        return NextResponse.json({ 
            error: 'Cannot vote on both question and answer simultaneously',
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

        if (existingVote.rows.length > 0) {
            console.log("==============================")
            console.log("User has already voted on this")
            console.log("==============================")
            return NextResponse.json({ 
                error: 'User has already voted on this ' + (question_id ? 'question' : 'answer'),
            }, { status: 409 });
        }

        const addVote = await pool.query(
            `INSERT INTO votes (user_id, ${uniqueColumn}, vote_type)
             VALUES ($1, $2, $3)
             RETURNING vote_id, user_id, ${uniqueColumn}, vote_type, created_at`,
            [user_id, targetId, vote_type]
        );

        if (vote_type === 'upvote') {
            await pool.query(
                `UPDATE ${targetTable} SET upvote_count = upvote_count + 1 WHERE ${uniqueColumn} = $1`,
                [targetId]
            );
        } else {
            await pool.query(
                `UPDATE ${targetTable} SET downvote_count = downvote_count + 1 WHERE ${uniqueColumn} = $1`,
                [targetId]
            );
        }

        console.log("==============================")
        console.log("vote added successfully")
        console.log("==============================")

        return NextResponse.json({ 
            message: 'Vote added successfully',
            vote: addVote.rows[0]
        }, { status: 201 });

    } catch (e) {
        console.log("==============================")
        console.log(e);
        console.log("==============================")
        return NextResponse.json(
            { message: 'Add vote error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
        );
    } 
}
