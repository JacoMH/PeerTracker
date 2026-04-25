import { Request, Response } from 'express';
import { db, supabaseClient } from '../../index.ts'
import { github_integrations, githubrepos, trello_integrations, TrelloBoard } from 'db.ts';
import { eq } from 'drizzle-orm';

import deletetrellowebhook from 'modules/webhook/deletetrellowebhook.ts';
import createtrellowebhook from 'modules/webhook/createtrellowebhook.ts'


export default async function linktrelloboard(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7);
        const userResponse = await supabaseClient.auth.getUser(access_token);
        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = userResponse.data.user.id;
        const query = req.query;
        const currentBoard = query.currentBoard as string

        //  console.log("query: ", query);

        const TeamID = query.TeamID as string;
        const url = query.url as string;

        //parse the link for info needed for the board
        const urlID = url.split("/")[4];
        //    console.log("UrlID::::::::::: ", urlID);

        const fetchToken = await db.select()
            .from(trello_integrations)
            .where(eq(trello_integrations.UserID, userId))
            .execute();

        const token = fetchToken[0].access_token;

        console.log("token:::::::::::::::::::", fetchToken[0].access_token);


        // board pulled
        const getBoard = await fetch(`https://api.trello.com/1/boards/${urlID}?key=${process.env.TRELLO_API_KEY}&token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
            }
        })

        if (!getBoard.ok) {
            console.log("failed to fetch board");
            return res.status(500).json({ message: "failed to fetch Board" })
        }

        //since the call returned we can delete current trello board

        if (currentBoard) {
            deletetrellowebhook(currentBoard, token)

            const deleteBoard = await db.delete(TrelloBoard)
                .where(eq(TrelloBoard.BoardID, currentBoard));
        }

        //   console.log("down here");

        const parsedBoardData = await getBoard.json();


        ////if getrepo is success, store new info in db alongside TeamID
        const insertboard: any = {
            BoardID: parsedBoardData.id,
            TeamID: TeamID,
            BoardName: parsedBoardData.name,
            BoardUrl: url,
            access_token: token
        };
        const storeBoard = await db.insert(TrelloBoard)
            .values(insertboard)
            .returning();

        createtrellowebhook(parsedBoardData.id, userId)

        if (!storeBoard) {
            console.log("failed to store board");
            return res.status(500).json({ message: "Failed to store Board" });
        }
        else {
            return res.status(200).json({ message: "Board Stored" });
        }
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}