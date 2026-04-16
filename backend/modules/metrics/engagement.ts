
import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { invites, teams, githubcommits, users, github_integrations, githubrepos, TrelloAction, TrelloBoard, trello_integrations } from 'db.ts';
import { eq, count, and, sql } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';

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

        const RepoID = query.RepoID as string;

        const BoardID = query.BoardID as string;

        const TeamID = query.TeamID as string;

        console.log("repoID:", RepoID, "BoardID", BoardID);

        //for trello
        const trelloActionWeek = sql`DATE_TRUNC('week', ${TrelloAction.date_created})`

        const trelloQuery = await db.select({
            TeamID: TrelloBoard.TeamID,
            date: trelloActionWeek.mapWith(String).as("date"),
            TrelloAction: sql`COUNT(${TrelloAction.ActionID})`
        })
            .from(TrelloBoard)
            .innerJoin(teams, eq(teams.TeamID, TrelloBoard.TeamID))
            .leftJoin(TrelloAction, eq(TrelloAction.BoardID, TrelloBoard.BoardID))
            .where(
                and(
                    eq(teams.TeamID, TeamID),
                    eq(TrelloBoard.BoardID, BoardID)
                )
            )
            .groupBy(TrelloBoard.TeamID, trelloActionWeek.mapWith(String).as("date"))


        //for github
        const githubCommitsWeek = sql`DATE_TRUNC('week', ${githubcommits.date_created})`  //https://datareportive.com/tutorial/postgresql/how-to-group-by-time/#:~:text=To%20group%20by%20week%2C%20you,weeks%20based%20on%20the%20timestamp_column%20.
        const githubQuery = await db.select({
            TeamID: githubrepos.TeamID,
            date: githubCommitsWeek.mapWith(String).as("date"),
            CommitCount: sql`COUNT(${githubcommits.CommitID})`
        })
            .from(githubrepos)
            .innerJoin(teams, eq(teams.TeamID, githubrepos.TeamID))
            .leftJoin(githubcommits, eq(githubcommits.RepoID, githubrepos.RepoID))
            .where(
                and(
                    eq(teams.TeamID, TeamID),
                    eq(githubrepos.RepoID, RepoID)
                )
            )
            .groupBy(githubrepos.TeamID, githubCommitsWeek.mapWith(String).as("date"))


        console.log("trelloEngagementQuery: ", trelloQuery, "githubEngagementQuery", githubQuery)

        return res.status(200).json({ message: "Successfully fetched engagement metrics", data: { githubdata: githubQuery, trellodata: trelloQuery } })
    }
    catch (error) {
        console.log("Error completing creating team process:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}