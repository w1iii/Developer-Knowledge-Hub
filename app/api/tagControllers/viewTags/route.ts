import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
    try{
        const query = `
            SELECT tag_id, tag_name, description
            FROM tags
            ORDER BY tag_name ASC;
        `;
        const result = await pool.query(query);
        return NextResponse.json(result.rows);
    }catch(e){
        console.log(e)
        return NextResponse.json(
            { message: 'Server Error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
}
