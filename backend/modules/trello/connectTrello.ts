import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { trello_integrations } from 'db.ts';

export default async function connectTrello(req: Request, res: Response) {
    try {

      //  console.log("HEIDAJSODIJASOIDJASOIDJASIOFJWRUIOGNSIFNASO");
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = userResponse.data.user.id;

        const body = req.body;

        const Token = body.token as string;

      //  console.log("Tokensidaojsiodjaosidj: ", Token);



        //fetch other info for the backend
        const fetchInfo = await fetch(`https://api.trello.com/1/members/me?key=${process.env.TRELLO_API_KEY}&token=${Token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
            }
        })

        if (!fetchInfo.ok) {
            console.log("Failed to get info, ", fetchInfo.status, fetchInfo.statusText);
            return;
        }

        const parsedInfo = await fetchInfo.json();

        console.log("Parsed Info: ", parsedInfo);

        //put trello token in backend
        const insertTrelloAccount = await db.insert(trello_integrations).values({
            AccountID: parsedInfo.id,
            UserID: userId,
            accountName: parsedInfo.username,
            url: parsedInfo.url,
            access_token: Token
        }).returning()

        if (insertTrelloAccount.length > 0) {
            return res.status(200).json({ message: "Trello Account Inserted Into Database" })
        }
        else {
            return res.status(200).json({ message: "Failed to insert trello Account Into Database"})
        }


    }
    catch (error) {
        console.log("Error completing creating team process:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}