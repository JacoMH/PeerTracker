import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }
        console.log("madeinauisdnaiusdhaiusod")

        const params = req.nextUrl.searchParams;
        const TeamID = params.get("TeamID");
        const url = params.get("url");
        console.log("TeamID", TeamID, "url", url);

        const response = await fetch(`${process.env.API_URL}/router/updateDatabase?TeamID=${TeamID}&url=${url}`, {
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
        return NextResponse.json({ error: "failed to verify github integration" }, { status: 500 });
    }
}