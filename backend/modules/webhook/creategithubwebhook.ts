import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';
import { githubrepos, TrelloBoard } from 'db.ts';

// Interface
import { User } from '../../interface/User.ts';
import { github_integrations, trello_integrations } from 'db.ts';

export default async function creategithubwebhook(owner: string, repo: string, repoID: string, token: string) {
    try {
        //post request to github repo to store the ngrok url in
        console.log("hellooooooo");
        const githubRepoPost = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-GitHub-Api-Version': '2026-03-10'
            },
            body: JSON.stringify({
                name: 'web',
                active: true,
                events: [
                    'push',
                    'pull_request'
                ],
                config: {
                    url: 'https://repose-jailer-shininess.ngrok-free.dev/router/updategithub',
                    content_type: 'json',
                    insecure_ssl: '0'
                }
            })
        })

        if (!githubRepoPost.ok) {
            console.log("error creating github webhook: ", githubRepoPost)
            return;
        }

        console.log("the response for webhook:", githubRepoPost);

        const response = await githubRepoPost.json();

        console.log("hook id:", response.id);
        if (response.id) {
            //saves webhook to database
           // console.log("repoid:  ", repoID);
            const setWebhook = await db.update(githubrepos)
                .set({ Webhook: response.id })
                .where(eq(githubrepos.RepoID, repoID))

            if (setWebhook) {
                console.log("successful storage of id");
            }
        }


    }
    catch (error) {
        console.log("Error connecting webhook to trello:", error);
    }
}