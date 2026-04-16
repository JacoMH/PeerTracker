import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { github_integrations, githubcommits, githubrepos, invites, teams, trello_integrations, TrelloAction, TrelloBoard, users } from 'db.ts';
import { eq, and, count } from 'drizzle-orm';

export default async function engagement(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const query = req.query;

        const UserID = query.UserID as string;
        const TeamID = query.TeamID as string;

        if (UserID && TeamID) {
            // Do this query but include time in it
            const fetchActionsPerUser = await db.select({
                ActionID: TrelloAction.ActionID,
                CardID: TrelloAction.CardID,
                type: TrelloAction.type,
                oldData: TrelloAction.oldData,
                date_created: TrelloAction.date_created
            })
                .from(TrelloAction)
                .innerJoin(trello_integrations, eq(trello_integrations.AccountID, TrelloAction.AccountID))
                .innerJoin(users, eq(users.UserID, trello_integrations.UserID))
                .innerJoin(TrelloBoard, eq(TrelloBoard.BoardID, TrelloAction.BoardID))
                .innerJoin(teams, eq(teams.TeamID, TrelloBoard.TeamID))
                .where(
                    and(
                        eq(users.UserID, UserID),
                        eq(teams.TeamID, TeamID)
                    )
                )
                .execute();

            return res.status(200).json({ message: "returning data for top contributors", data: fetchActionsPerUser })
        }

        return res.status(200).json({ message: "TeamID and UserID doesnt exist" })

    }
    catch (error) {
        console.log("Error fetching actions per user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
