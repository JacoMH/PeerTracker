
import { NextResponse } from "next/server";
import dotenv from 'dotenv'
dotenv.config()

export async function POST(req: Request, res: Response) {
  const body = await req.json();

  console.log("Data received in Next.js Bridge:", body);
  const response = await fetch(process.env.API_URL + '/router/createuser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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