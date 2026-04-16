import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { github_integrations, githubcommits, githubrepos, invites, teams, trello_integrations, TrelloAction, TrelloBoard, users } from 'db.ts';
import { eq, and, count, sql } from 'drizzle-orm';

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

            //countQuery
            const trelloActionWeek = sql`DATE_TRUNC('week', ${TrelloAction.date_created})`
            const actionsCount = await db.select({
                AccountID: TrelloAction.AccountID,
                date: trelloActionWeek.mapWith(String).as("date"),
                actionsCount: count().as("count")
            })
                .from(TrelloAction)
                .innerJoin(TrelloBoard, eq(TrelloBoard.BoardID, TrelloBoard.BoardID))
                .where(eq(TrelloBoard.TeamID, TeamID))
                .groupBy(TrelloAction.AccountID, trelloActionWeek.mapWith(String).as("date"))
                .as("actionCount")

            const trelloEngagementQuery = await db.select({
                AccountID: trello_integrations.AccountID,
                UserID: users.UserID,
                ActionsCount: actionsCount.actionsCount,
                date: actionsCount.date
            })
                .from(invites)
                .innerJoin(trello_integrations, eq(trello_integrations.UserID, invites.UserID))
                .innerJoin(users, eq(users.UserID, trello_integrations.UserID))
                .innerJoin(actionsCount, eq(actionsCount.AccountID, trello_integrations.AccountID))
                .where(
                    and(
                        eq(invites.status, "Accepted"),
                        eq(invites.UserID, UserID)
                    )
                )
                .groupBy(trello_integrations.AccountID, users.UserID, actionsCount.actionsCount, actionsCount.date)
                .execute();

            return res.status(200).json({ message: "returning data for top contributors", data: trelloEngagementQuery })
        }

        return res.status(200).json({ message: "TeamID or UserID doesnt exist" })

    }
    catch (error) {
        console.log("Error completing fetching actions for graph:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
