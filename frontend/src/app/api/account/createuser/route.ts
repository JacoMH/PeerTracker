
import { NextResponse } from "next/server";
import dotenv from 'dotenv'
dotenv.config()

export async function POST(req: Request, res: Response) {
  try {
    const access_token = req.headers.get("authorization")?.slice(7);
    if (!access_token) {
      return NextResponse.json({ error: "No Access Token Provided" }, { status: 401 });
    }
    const body = await req.json();

    console.log("hedijasoijdaoisjdeeeeeeeee");
    const response = await fetch(process.env.API_URL + '/router/createuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error("Error response from backend:", response.statusText);
      return NextResponse.json({ error: "Error creating user in database" }, { status: 500 });
    }

    res = await response.json();

    return NextResponse.json(res);
  }
  catch (error) {
    console.log("Error creating user here:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}