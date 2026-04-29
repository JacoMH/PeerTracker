import { Request, Response } from 'express';
import { db } from '../../index.ts'
import { githubrepos } from 'db.ts';
import { eq } from 'drizzle-orm';

export default async function fetchgithubrepo(req: Request, res: Response) {
    try {
        const TeamID = req.query.TeamID as String;

       // console.log("TeamID", TeamID);

        const result = await db.select({
            RepoID: githubrepos.RepoID,
            RepoName: githubrepos.RepoName,
            RepoUrl: githubrepos.RepoUrl
        }).from(githubrepos)
            .where(eq(githubrepos.TeamID, TeamID?.toString()))
            .execute();

       // console.log("result of github repos: ", result);
        if (result.length > 0 ) {
            return res.status(200).json({ message: "Github Repos Exist", data: result });
        }
        else {
            return res.status(200).json({ message: "No Github Repos", data: result})
        }
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}