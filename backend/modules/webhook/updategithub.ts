import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';

import { githubcommits, githubrepos, trello_integrations } from 'db.ts';

export default async function updategithub(req: Request) {
    try {
        //  console.log("github update", req.body);

        //github id from request
        const githubid = req.body.sender.id;

        //https://docs.github.com/en/webhooks/webhook-events-and-payloads comes in as loop so have to iterate over it

        if (Array.isArray(req.body.commits) && req.body.commits.length > 0) {
            for (const item of req.body.commits) {
                if (item)
                    await db.insert(githubcommits)
                        .values({
                            CommitID: item.id,
                            RepoID: req.body.repository.id,
                            AccountID: githubid,
                            section: "empty",
                            name: "empty",
                            CommitUrl: item.url,
                            description: item.message,
                            date_created: new Date(item.timestamp)
                        })
            }
        }
    }
    catch (error) {
        console.log("Error updating github using webhook:", error);
    }


}
