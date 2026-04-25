import { Request, Response } from 'express';
import { db, supabaseClient } from '../../index.ts'
import { github_integrations, githubrepos } from 'db.ts';
import { eq } from 'drizzle-orm';
import creategithubwebhook from 'modules/webhook/creategithubwebhook.ts';
import deletegithubwebhook from 'modules/webhook/deletegithubwebhook.ts';


export default async function linkgithubrepo(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7);
        const userResponse = await supabaseClient.auth.getUser(access_token);
        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = userResponse.data.user.id;
        const query = req.query;
        const currentRepoID = query.currentRepo as string

        console.log("currentRepoID", currentRepoID);
        console.log("query", query.currentRepo);

        const TeamID = query.TeamID as string;
        const url = query.url as string;

        //check they own the repo or have perms

        //split url for fetch
        //   console.log("url: ", url);
        const splitUrl = url.split('/');
        //   console.log("split url:", splitUrl);
        const owner = splitUrl[3];
        const repo = splitUrl[4];


        //check if the repo being linked is one owned by the user linking it
        const fetchgithubusername = await db.select()
            .from(github_integrations)
            .where(eq(github_integrations.UserID, userId))
            .execute();

        const githubusername = fetchgithubusername[0].accountName;

        if (githubusername !== owner) {
            return res.status(200).json({ message: "Linked Repo is not owned by the user, cannot be added" });
        }

        //fetch github access token
        const githubAccount = await db.select(
            {
                UserID: github_integrations.UserID,
                access_token: github_integrations.access_token
            }
        )
            .from(github_integrations)
            .where(eq(github_integrations.UserID, userId))
            .execute();

        const githubaccesstoken = githubAccount[0].access_token;
        //do post to backend where github pulls api data for the repo using the users access token, where the repo info will be stored with their team id in the githubrepo table

        const getRepo = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
                'X-GitHub-Api-Version': '2026-03-10',
                "Authorization": `Bearer ${githubaccesstoken}`
            }
        })

        if (!getRepo.ok) {
            console.log("failed to fetch repo");
            return res.status(500).json({ message: "Failed to fetch repo" })
        }
        //check ownership, public repos will make it through so have to use a field to determine access

        const parsedRepoData = await getRepo.json();
        console.log("parsed repo data: ", parsedRepoData);

        if (parsedRepoData.private === false) {
            return res.status(500).json({ message: "Private Repos Only" })
        }

        if (currentRepoID) {
            await deletegithubwebhook(currentRepoID, githubaccesstoken ?? "")
        }

        //store info in drizzle db
        type newRepo = typeof githubrepos.$inferInsert;

        const insertrepo: newRepo = {
            RepoID: parsedRepoData.id,
            TeamID: TeamID,
            RepoName: parsedRepoData.name,
            RepoUrl: url,
            access_token: githubaccesstoken
        };
        const storeRepo = await db.insert(githubrepos)
            .values(insertrepo)
            .returning();

        if (!storeRepo) {
            console.log("failed to store repo");
            return res.status(500).json({ message: "Failed to store repo" });
        }

        await creategithubwebhook(owner, repo, parsedRepoData.id, githubaccesstoken)

        return res.status(200).json({ message: "Repo Stored" });
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}