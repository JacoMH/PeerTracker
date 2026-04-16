import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';

// Interface
import { User } from '../../interface/User.ts';
import { github_integrations, githubcommits, githubrepos, trello_integrations, TrelloBoard } from 'db.ts';

export default async function deletegithubwebhook(currentRepoID: string, githubaccesstoken: string) {
    try {
        //fetch rest of info
        const fetchRepoInfo = await db.select()
        .from(githubrepos)
        .where(eq(githubrepos.RepoID, currentRepoID))

        const githubRepo = fetchRepoInfo[0].RepoName
        const githubUrl = fetchRepoInfo[0].RepoUrl.split("/")

         const owner = githubUrl[3];

        console.log("repoid: ", currentRepoID, "githubaccesstoken: ", githubaccesstoken, "owner: ", owner);
        //fetch github webhook
        const fetchWebhook = await db.select()
            .from(githubrepos)
            .where(eq(githubrepos.RepoID, currentRepoID))

        console.log("fetchwebhook: ", fetchWebhook[0].Webhook);
        const webhookID = fetchWebhook[0].Webhook;

        //webhook link for the repo
        const deleteInfo = await fetch(`https://api.github.com/repos/${owner}/${githubRepo}/hooks/${webhookID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${githubaccesstoken}`,
                'X-GitHub-Api-Version': '2026-03-10'
            }
        })

       // console.log("response: ", deleteInfo);

        if (deleteInfo.ok) {
            const deleteRepo = await db.delete(githubrepos)
                .where(eq(githubrepos.RepoID, currentRepoID));
        }
        else {
            console.log("DeleteInfo : ", deleteInfo);
        }

    }
    catch (error) {
        console.log("Error deleting github webhook:", error);
    }
}