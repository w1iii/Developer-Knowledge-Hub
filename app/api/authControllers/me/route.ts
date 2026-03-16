import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const user_id = request.headers.get('x-user-id');
    const username = request.headers.get('x-username');

    console.log("Me route: user_id header:", user_id, "username:", username);

    if (!user_id || !username) {
        console.log("Me route: Not authenticated");
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log("Me route: Returning user_id:", parseInt(user_id), "username:", username);
    return NextResponse.json({ user_id: parseInt(user_id), username });
}