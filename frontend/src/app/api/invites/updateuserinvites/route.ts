import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
dotenv.config()


export async function POST(req: NextRequest) {
    //Updates invite from pending to "accepted" or "denied"
    try {
        const access_token = req.headers.get("authorization")?.slice(7);

        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const body = await req.json();

        const newStatus = body.newStatus;
        const InviteID = body.InviteID;

        const response = await fetch(`${process.env.API_URL}/router/updateinvites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                newStatus: newStatus,
                InviteID: InviteID,
            })
        })

        if (!response.ok) {
            console.log("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error updating user invites" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);


    }
    catch (error) {
        console.log("Error fetching user invites");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}