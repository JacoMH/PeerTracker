import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
dotenv.config()

export async function POST(req: NextRequest) {
    try {
        console.log("made it here");
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const body = await req.json();
        const code = body.code;
        const redirect_uri = body.redirect_uri;

        //    console.log("code here: ", code, "redirect_uri here: ", redirect_uri);


        const response = await fetch(`${process.env.API_URL}/router/githubconnect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`,
            },
            body: JSON.stringify({ //client secret is also needed but that is provided in the backend
                client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
                code: code,
                redirect_uri: redirect_uri
            })
        })
        if (!response.ok) {
            return NextResponse.json({ error: "Error linking github account" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch {
        return NextResponse.json({ error: "failed to connect github account" }, { status: 500 });
    }
}
