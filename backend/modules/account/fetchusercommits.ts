import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';


import { githubcommits, githubrepos, github_integrations, users } from 'db.ts';
import { eq, and } from 'drizzle-orm';
// Interface
import { User } from '../../interface/User.ts';


export default async function fetchusercommits(req: Request<User>, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const UserID = req.query.UserID as string;
        const RepoID = req.query.RepoID as string;

        const fetchusercommits = await db.select({
            CommitID: githubcommits.CommitID,
            RepoID: githubcommits.RepoID,
            AccountID: githubcommits.AccountID,
            CommitUrl: githubcommits.CommitUrl,
            description: githubcommits.description,
            date_created: githubcommits.date_created
        })
            .from(githubcommits)
            .innerJoin(githubrepos, eq(githubrepos.RepoID, githubcommits.RepoID))
            .innerJoin(github_integrations, eq(github_integrations.AccountID, githubcommits.AccountID))
            .innerJoin(users, eq(users.UserID, github_integrations.UserID))
            .where(and(
                eq(users.UserID, UserID),
                eq(githubrepos.RepoID, RepoID)
            ))
            .execute();

        console.log("fetchusercommits: ", fetchusercommits);

        return res.status(200).json({ message: "Fetched User Commits", data: fetchusercommits })
    }
    catch (error) {
        console.log("Error fetching teams:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}