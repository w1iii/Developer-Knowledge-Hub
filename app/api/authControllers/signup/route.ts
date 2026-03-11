import {NextRequest, NextResponse} from "next/server";
import pool from '../../../lib/db'
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest){
    const body = await req.json();
    const { username, email, password } = body;
    
    if ( !username || !email || !password ) {
        return NextResponse.json(
            { error: "Please fill up the form" }, 
            { status: 400 }
        );
    }
    
    try{
        const checkDupQuery = `
            SELECT user_id FROM users WHERE email = $1 
        `;
        const existingEmail = await pool.query(checkDupQuery, [email]);
        
        if (existingEmail.rows.length > 0) {
            return NextResponse.json(
                { error: "Email already registered" }, 
                { status: 409 }
            );
        }
    }catch(e){
        return NextResponse.json(
            { message: 'Database query error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    
    try{
        const addQuery = `
            INSERT INTO users( username, email, password_hash )
            VALUES ($1, $2, $3)
            RETURNING user_id, username, email;
        `;
        const newuser = await pool.query(addQuery, [ username, email, password_hash ])
        
        return NextResponse.json({ 
            message: 'User added successfully',
            user: newuser.rows[0]
        }, { status: 201 });
        
    }catch(e){
        return NextResponse.json(
            { message: 'Insert user error', error: e instanceof Error ? e.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
}
