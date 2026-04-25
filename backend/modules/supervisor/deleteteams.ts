import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { githubrepos, invites, teams, TrelloBoard } from 'db.ts';
import { eq } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import deletetrellowebhook from 'modules/webhook/deletetrellowebhook.ts';
import deletegithubwebhook from 'modules/webhook/deletegithubwebhook.ts';

export default async function deleteteams(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const TeamID = req.body.TeamID;
        console.log("TeamID: ", TeamID);

        const getTrelloBoard = await db.select()
            .from(TrelloBoard)
            .where(eq(TrelloBoard.TeamID, TeamID))

        console.log("getTrelloBoard: ", getTrelloBoard);

        const getGithubRepo = await db.select()
            .from(githubrepos)
            .where(eq(githubrepos.TeamID, TeamID))

        console.log("getGithubRepo: ", getGithubRepo);


        let BoardID = null;
        let trelloaccesstoken = null;
        let RepoID = null;
        let githubaccesstoken = null;

        if (getTrelloBoard.length !== 0) {
            console.log("hello");
            BoardID = getTrelloBoard[0].BoardID;
            trelloaccesstoken = getTrelloBoard[0].access_token
        }

        if (getGithubRepo.length !== 0) {
            console.log("hello2");
            RepoID = getGithubRepo[0].RepoID;
            githubaccesstoken = getGithubRepo[0].access_token
        }

        console.log("BoardID: ", BoardID, "TRELLOACCESSTOKEN: ", trelloaccesstoken, "RepoID: ", RepoID, "githubaccesstoken: ", githubaccesstoken);

        //delete webhooks too but there may have to be modifications to the db for it to work right, 
        // like whoever manages to link the repo has their access_token put on the repo

        if (getTrelloBoard.length !== 0) {
            console.log("haidhasiodhaosidj");
            await deletetrellowebhook(getTrelloBoard[0].BoardID, getTrelloBoard[0].access_token ?? "")
        }
        else {
            console.log("failed to delete trello webhook")
        }

        if (getGithubRepo.length !== 0) {
            console.log("haidhasiodhaosidjsiamsodijasoidjoi");
            await deletetrellowebhook(getGithubRepo[0].RepoID, getGithubRepo[0].access_token ?? "")
        }
        else {
            console.log("failed to delete github webhook")
        }

        await db.delete(teams)
            .where(eq(teams.TeamID, TeamID))


        return res.status(201).json({ message: "Team and associated webhooks deleted" });
    }
    catch (error) {
        console.log("Error completing creating team process:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}