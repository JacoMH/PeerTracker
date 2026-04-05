import { NextRequest,NextResponse } from 'next/server'
import dotenv from 'dotenv'
dotenv.config()

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }
        const response = await fetch(`${process.env.API_URL}/router/fetchuser`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        })
        if (!response.ok) {
            console.log("Response: ", response)
            console.error("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error fetching user from database" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error fetching user here:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}