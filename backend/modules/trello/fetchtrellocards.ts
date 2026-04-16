import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { trello_integrations, TrelloBoard, TrelloCard, TrelloList } from 'db.ts';

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

        const BoardID = query.BoardID as string;
     //   console.log("BoardID", BoardID);

        //fetch trello board from backend
        const fetchTrelloCardsQuery = await db.select({
            CardID: TrelloCard.CardID,
            ListID: TrelloCard.ListID,
            ListName: TrelloList.name,
            ListClosed: TrelloList.closed,
            name: TrelloCard.name,
            dueComplete: TrelloCard.dueComplete,
            dueDate: TrelloCard.dueDate
        })
            .from(TrelloCard)
            .leftJoin(TrelloList, eq(TrelloList.ListID, TrelloCard.ListID))
            .where(eq(TrelloCard.BoardID, BoardID))
            .execute();

        console.log("fetchTrelloCards: ", fetchTrelloCardsQuery);

        return res.status(200).json({ message: "Fetched all Trello cards", data: fetchTrelloCardsQuery })
    }
    catch (error) {
        console.log("Error completing fetching trello cards:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}