import { Request, Response } from 'express';
import { db, supabaseClient } from '../index.ts'
import { github_integrations, githubrepos, teams, trello_integrations, users } from 'db.ts';
import { eq } from 'drizzle-orm';

export default async function fetchgithubaccount(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); //Slices off Bearer leaving only the access_token https://stackoverflow.com/questions/44497550/how-to-retrieve-a-bearer-token-from-an-authorization-header-in-javascript-angul

        //console.log("headers: ", req.headers);
        //verify supabase
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = userResponse.data.user.id;
        const TeamID = req.query.TeamID as String;
        // check db for github repo related to the team
        const fetchgithub = await db.select({
            UserID: users.UserID,
            FirstName: users.FirstName,
            LastName: users.LastName,
            Email: users.Email,
            Role: users.Role,
            GithubUsername: github_integrations.accountName, 
            GithubAccountID: github_integrations.AccountID,
            TrelloUsername: trello_integrations.accountName,
            TrelloAccountID: trello_integrations.AccountID
        })
            .from(users)
            .leftJoin(github_integrations, eq(github_integrations.UserID, users.UserID))
            .leftJoin(trello_integrations, eq(trello_integrations.UserID, users.UserID))
            .where(eq(users.UserID, userId))
            .execute();

        if (fetchgithub.length > 0) {
            return res.status(200).json({ message: "Fetched All Accounts", data: fetchgithub })
        }
        else {
            return res.status(500).json({ message: "Failed to fetch All Accounts"})
        }
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}