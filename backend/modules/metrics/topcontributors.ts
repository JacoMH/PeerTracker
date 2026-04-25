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

        const TeamID = query.TeamID as string;

        if (TeamID) {

            // github commits
            const countGithubQuery = await db.select({
                AccountID: githubcommits.AccountID,
                GithubUsername: github_integrations.accountName,
                RepoID: githubrepos.RepoID,
                CommitCount: count(githubcommits.CommitID).as("CommitCount")
            })
                .from(githubcommits)
                .innerJoin(github_integrations, eq(github_integrations.AccountID, githubcommits.AccountID))
                .innerJoin(githubrepos, eq(githubrepos.RepoID, githubcommits.RepoID))
                .groupBy(githubcommits.AccountID, githubrepos.RepoID, github_integrations.accountName)
                .as("commitCount");

            // trello actions
            const countTrelloQuery = await db.select({
                AccountID: TrelloAction.AccountID,
                TrelloUsername: trello_integrations.accountName,
                BoardID: TrelloBoard.BoardID,
                ActionCount: count(TrelloAction.ActionID).as("ActionCount")
            })
                .from(TrelloAction)
                .innerJoin(trello_integrations, eq(trello_integrations.AccountID, TrelloAction.AccountID))
                .innerJoin(TrelloBoard, eq(TrelloBoard.BoardID, TrelloAction.BoardID))
                .groupBy(TrelloAction.AccountID, TrelloBoard.BoardID, trello_integrations.accountName)
                .as("ActionCount");

            //main query
            const fetchTopContributors = await db.select({
                UserID: users.UserID,
                UserFirstname: users.FirstName,
                UserLastname: users.LastName,
                GithubRepoID: githubrepos.RepoID,
                GithubUsername: countGithubQuery.GithubUsername,
                TrelloUsername: countTrelloQuery.TrelloUsername,
                TrelloBoardID: TrelloBoard.BoardID,
                CommitCount: countGithubQuery.CommitCount,
                ActionCount: countTrelloQuery.ActionCount
            })
                .from(invites)
                .innerJoin(users, eq(users.UserID, invites.UserID))
                .leftJoin(github_integrations, eq(github_integrations.UserID, users.UserID))
                .leftJoin(trello_integrations, eq(trello_integrations.UserID, users.UserID))
                .innerJoin(teams, eq(teams.TeamID, invites.TeamID))
                .leftJoin(githubrepos, eq(githubrepos.TeamID, teams.TeamID))
                .leftJoin(TrelloBoard, eq(TrelloBoard.TeamID, teams.TeamID))
                .leftJoin(countGithubQuery, and(
                    eq(countGithubQuery.AccountID, github_integrations.AccountID),
                    eq(countGithubQuery.RepoID, githubrepos.RepoID)
                )
                )
                .leftJoin(countTrelloQuery, and(
                    eq(countTrelloQuery.AccountID, trello_integrations.AccountID),
                    eq(countTrelloQuery.BoardID, TrelloBoard.BoardID)
                ))
                .where(eq(invites.TeamID, TeamID))
                .groupBy(users.UserID, users.FirstName, users.LastName, countGithubQuery.CommitCount, TrelloBoard.BoardID, githubrepos.RepoID, countTrelloQuery.ActionCount, countGithubQuery.GithubUsername, countTrelloQuery.TrelloUsername)
                .limit(5)



            return res.status(200).json({ message: "returning data for top contributors", data: fetchTopContributors })
        }

        return res.status(200).json({ message: "TeamID doesnt exist" })

    }
    catch (error) {
        console.log("Error completing fetching top contributors:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
