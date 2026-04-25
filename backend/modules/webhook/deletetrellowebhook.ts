import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { githubrepos, trello_integrations, TrelloBoard } from 'db.ts';

export default async function deletetrellowebhook(currentBoardID: string, trelloaccesstoken: string) {
    try {


        //fetch webhook token
        const fetchWebhookID = await db.select()
            .from(TrelloBoard)
            .where(eq(TrelloBoard.BoardID, currentBoardID))

        const webhookID = fetchWebhookID[0].Webhook;

        console.log("webhook id", webhookID);

        //webhook link for the board
        const deleteInfo = await fetch(`https://api.trello.com/1/webhooks/${webhookID}?key=${process.env.TRELLO_API_KEY}&token=${trelloaccesstoken}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (!deleteInfo.ok) {
            console.log("error deleting trello webhook", deleteInfo)
        }
        console.log(deleteInfo);

    }
    catch (error) {
        console.log("Error deleting trello webhook:", error);
    }
}