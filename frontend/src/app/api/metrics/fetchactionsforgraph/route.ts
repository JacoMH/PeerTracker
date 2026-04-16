import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);

        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const params = req.nextUrl.searchParams;
        const UserID = params.get("UserID");
        const TeamID = params.get("TeamID");
        const BoardID = params.get("BoardID");

        const response = await fetch(`${process.env.API_URL}/router/fetchactionsforgraph?UserID=${UserID}&TeamID=${TeamID}&BoardID=${BoardID}`, {
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
        return NextResponse.json({ error: "failed to fetch actions for graph" }, { status: 500 });
    }
}