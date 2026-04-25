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

        const TeamID = body.TeamID;

        const response = await fetch(`${process.env.API_URL}/router/deleteteams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                TeamID: TeamID
            })
        })
        if (!response.ok) {
            console.error("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error deleting user from database" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error deleting user here:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}