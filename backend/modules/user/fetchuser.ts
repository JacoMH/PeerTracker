import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';


import { users } from 'db.ts';
import { eq } from 'drizzle-orm';
// Interface
import { User } from '../../interface/User.ts';


export default async function fetchuser(req: Request<User>, res: Response) {
    const access_token = req.headers.authorization?.slice(7); // access_token
    
    // Fetch user ID using access token which also validates the token
    const userResponse = await supabaseClient.auth.getUser(access_token);
    
    if (userResponse.error || !userResponse.data.user) {
        console.error("Error fetching user from Supabase:", userResponse.error);
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = userResponse.data.user.id;
    // Fetch user info using ID
    const result = await db.select().from(users).where(eq(users.UserID, userId.toString()));
    return res.status(200).json({ message: "Fetched User", data: result});
}