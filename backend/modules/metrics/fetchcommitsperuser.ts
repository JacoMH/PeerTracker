import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { github_integrations, githubcommits, githubrepos, invites, teams, trello_integrations, TrelloAction, TrelloBoard, users } from 'db.ts';
import { eq, and, count, sql } from 'drizzle-orm';

export default async function fetchcommitsperuser(req: Request, res: Response) {
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
        const RepoID = query.RepoID as string;

        //fetch account id of user here

        const Account = await db.select()
        .from(github_integrations)
        .where(eq(github_integrations.UserID, UserID))
        .execute();

        const AccountID = Account[0].AccountID;

        console.log("repoid: ", RepoID, "accountID: ", AccountID, "userID: ", UserID)


        //github
        const githubCommitHour = sql`DATE_TRUNC('hour', ${githubcommits.date_created})`
        if (UserID && RepoID) {
            const githubQuery = await db.select({
                UserID: users.UserID,
                date: githubCommitHour.mapWith(String).as("date"),
                //CommitCount: sql`COUNT(${githubcommits.CommitID})`,
                CommitCount: count(githubcommits.CommitID)
            })
                .from(githubcommits)
                .innerJoin(githubrepos, eq(githubrepos.RepoID, githubcommits.RepoID))
                .innerJoin(github_integrations, eq(github_integrations.AccountID, githubcommits.AccountID))
                .innerJoin(users, eq(users.UserID, github_integrations.UserID))
                .where(
                    and(
                        eq(githubcommits.RepoID, RepoID),
                        eq(github_integrations.AccountID, AccountID)
                    )
                )
                .groupBy(users.UserID, githubCommitHour.mapWith(String).as("date"))
                .execute();

                console.log("githubCommitHour: ", githubQuery)
            return res.status(200).json({ message: "returning data for commits per user", data: githubQuery })
        }

        return res.status(200).json({ message: "RepoID and AccountID doesnt exist" })

    }
    catch (error) {
        console.log("Error fetching actions per user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
