import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);

        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const params = req.nextUrl.searchParams;
        const RepoID = params.get("RepoID");
        const BoardID = params.get("BoardID");
        const TeamID = params.get("TeamID")

        console.log("Board ID: ", BoardID, "Repo ID: ", RepoID);

        const response = await fetch(`${process.env.API_URL}/router/engagement?RepoID=${RepoID}&BoardID=${BoardID}&TeamID=${TeamID}`, {
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
        return NextResponse.json({ error: "failed to fetch team info" }, { status: 500 });
    }
}