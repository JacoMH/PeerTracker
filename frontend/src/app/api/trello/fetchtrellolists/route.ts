import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);

        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const params = req.nextUrl.searchParams;
        const BoardID = params.get("BoardID");


        const response = await fetch(`${process.env.API_URL}/router/fetchtrellolists?BoardID=${BoardID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        })

        if (!response.ok) {
            console.log("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error fetching trello lists" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        return NextResponse.json({ error: "failed to fetch trello lists" }, { status: 500 });
    }
}