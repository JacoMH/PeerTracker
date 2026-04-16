import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
dotenv.config()

export async function POST(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const body = await req.json();
        console.log("body:", body);
        const token = body.token;


        const response = await fetch(`${process.env.API_URL}/router/connecttrello`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`,
            },
            body: JSON.stringify({ //client secret is also needed but that is provided in the backend
                token: token
            })
        })

        if (!response.ok) {
            console.log("Response:dasdasdasdasdasd ", response)
            console.error("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error linking trello" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch {
        return NextResponse.json({ error: "failed to store token" }, { status: 500 });
    }
}
