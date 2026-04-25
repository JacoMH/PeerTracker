
import { NextResponse, NextRequest } from "next/server";
import dotenv from 'dotenv'
dotenv.config()

export async function POST(req: NextRequest) {
    try {
        const access_token = req.headers.get("authorization")?.slice(7);
        if (!access_token) {
            return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
        }

        const body = await req.json();

        const notificationID = body.ReportID;

        const response = await fetch(`${process.env.API_URL}/router/deleteNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                ReportID: notificationID
            })
        })

        if (!response.ok) {
            console.log("Error response from backend:", response.status, response.statusText);
            return NextResponse.json({ error: "Error deleting notification" }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    }
    catch (error) {
        console.log("Error deleting notifications");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}