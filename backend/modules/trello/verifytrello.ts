import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { trello_integrations } from 'db.ts';

export default async function connectTrello(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = userResponse.data.user.id;

        const fetchTrelloIntegration = await db.select()
        .from(trello_integrations)
        .where(eq(trello_integrations.UserID, userId))
        .execute();

    //    console.log("integration: ", fetchTrelloIntegration);

        if (fetchTrelloIntegration.length > 0) {
            return res.status(200).json({ message: "Successful verification" })
        }
        else {
            return res.status(200).json({ message: "Failed to fetch trello account"})
        }
    }
    catch (error) {
        console.log("Error verifying trello acount exists in db:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}