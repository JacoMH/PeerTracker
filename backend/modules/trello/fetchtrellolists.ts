import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { trello_integrations, TrelloBoard, TrelloList } from 'db.ts';

export default async function fetchtrelloboard(req: Request, res: Response) {
    try {

        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const query = req.query;

        const BoardID = query.BoardID as string

     //   console.log("TeamID: ", TeamID);



        //fetch trello lists from backend
        const fetchTrelloLists = await db.select({
            ListID: TrelloList.ListID,
            BoardID: TrelloList.BoardID,
            name: TrelloList.name,
            closed: TrelloList.closed,
            position: TrelloList.position,
        })
        .from(TrelloList)
        .where(eq(TrelloList.BoardID, BoardID))
        .execute();

        

        if (fetchTrelloLists.length > 0) {
            return res.status(200).json({ message: "Fetched Trello Lists ", data: fetchTrelloLists })
        }
        else {
            return res.status(200).json({ message: "Failed to fetch trello lists from database" })
        }


    }
    catch (error) {
        console.log("Error completing fetching trello lists:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}