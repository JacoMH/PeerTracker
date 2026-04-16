import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
dotenv.config()

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const params = req.nextUrl.searchParams;
        const trelloBoardUrl = params.get("url");
        const TeamID = params.get("TeamID");


        const response = await fetch(`${process.env.API_URL}/router/updatetrellodatabase?TeamID=${TeamID}&url=${trelloBoardUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`,
            }
        })

        if (!response.ok) {
            console.error("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error fetching trello" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch {
        return NextResponse.json({ error: "failed to fetch trello board" }, { status: 500 });
    }
}
