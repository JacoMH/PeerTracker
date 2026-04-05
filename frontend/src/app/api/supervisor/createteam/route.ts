
import { NextResponse, NextRequest } from "next/server";
import { User } from "@/interfaces/User";
import dotenv from 'dotenv'
dotenv.config()

export async function POST(req: NextRequest) {
    console.log("made it here");
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const body = await req.json();

        const TeamName = body.TeamName;
        const User: User[] = body.Users; 

        const response = await fetch(`${process.env.API_URL}/router/createteam`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                TeamName: TeamName,
                Users: User
            })
        })

        if (!response.ok) {
            console.log("Error response from backend:", response.status, response.statusText);
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error fetching user teams");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}