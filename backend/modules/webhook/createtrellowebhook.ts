import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { trello_integrations, TrelloBoard } from 'db.ts';

export default async function createtrellowebhook(BoardID: string, userid: string) {
    try {
        //console.log("BoardID: ", BoardID);
        //console.log("userid: ", userid);

        //fetch access token
        const fetchAccessToken = await db.select()
        .from(trello_integrations)
        .where(eq(trello_integrations.UserID, userid))

        const access_token = fetchAccessToken[0].access_token;


        //webhook link for the board
        const fetchInfo = await fetch(`https://api.trello.com/1/tokens/${access_token}/webhooks/?key=${process.env.TRELLO_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: "Trello Webhook",
                callbackURL: "https://repose-jailer-shininess.ngrok-free.dev/router/updatetrello",
                idModel: BoardID
            })
        })

        if (!fetchInfo.ok) {
            console.log("error creating trello webhook", fetchInfo.url)
        }

        const response = await fetchInfo.json();
        console.log("fetchInfo : ", response);

        if (response.id) {
            //save this id in database in the 
            // then update the field to include the webhook
            const setWebhook = await db.update(TrelloBoard)
                .set({ Webhook: response.id })
                .where(eq(TrelloBoard.BoardID, BoardID))

            if (setWebhook) {
                console.log("successful storage of id");
            }
        }

    }
    catch (error) {
        console.log("Error connecting webhook to trello:", error);
    }
}