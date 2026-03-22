import { NextRequest, NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function POST(request: NextRequest) {
    const user_id = request.headers.get('x-user-id');
    if (!user_id) {
        return NextResponse.json({ 
            error: 'No user_id (no jwt token)',
        }, { status: 401 });
    }

    const body = await request.json()
    const { searchQuery } = body
    try{
        const query = 
          `
          SELECT question_id, title,
          ts_rank(
            to_tsvector(title),
            plainto_tsquery($1)
          ) AS rank,
          similarity(title, $1) AS sim
          FROM questions
          WHERE 
            to_tsvector(title) @@ plainto_tsquery($1)
            OR title ILIKE $1 || '%'
            OR similarity(title, $1) > 0.3
          ORDER BY rank DESC
          LIMIT 8
          `;
        const result = await pool.query(query, [searchQuery])
        console.log("Result: ", result.rows)
        return NextResponse.json({
            searchResult: result.rows,
            status:201
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
