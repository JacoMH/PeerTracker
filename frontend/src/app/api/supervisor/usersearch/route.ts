import { NextResponse, NextRequest } from "next/server";
import dotenv from 'dotenv'
dotenv.config()

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const params = req.nextUrl.searchParams;
        const query = params.get("query"); // https://nextjs.org/docs/app/api-reference/functions/next-request

        const response = await fetch(`${process.env.API_URL}/router/usersearch?query=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        })

        if (!response.ok) {
            console.log("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error searching user" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error searching user");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}