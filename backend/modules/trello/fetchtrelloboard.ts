import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { trello_integrations, TrelloBoard } from 'db.ts';

export default async function fetchtrelloboard(req: Request, res: Response) {
    try {

        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = userResponse.data.user.id;

        const query = req.query;

        const TeamID = query.TeamID as string;

     //   console.log("TeamID: ", TeamID);



        //fetch trello board from backend
        const fetchTrelloBoardQuery = await db.select()
            .from(TrelloBoard)
            .where(
                eq(TrelloBoard.TeamID, TeamID)
            )

        if (fetchTrelloBoardQuery.length > 0) {
            return res.status(200).json({ message: "Trello Board Exists", data: fetchTrelloBoardQuery })
        }
        else {
            return res.status(200).json({ message: "Failed to fetch trello board from database" })
        }


    }
    catch (error) {
        console.log("Error completing fetching trello board:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}