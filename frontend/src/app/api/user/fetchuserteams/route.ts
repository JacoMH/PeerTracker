import { NextRequest,NextResponse } from 'next/server'
import dotenv from 'dotenv'
dotenv.config()

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401});
        }

        const response = await fetch(`${process.env.API_URL}/router/fetchuserteams`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        })

        if (!response.ok) {
            console.log("Error response from backend:", response.status, response.statusText);
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error fetching user teams");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500});
    }
}