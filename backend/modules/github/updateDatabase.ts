import { Request, Response } from 'express';
import { db, supabaseClient } from '../../index.ts'
import { github_integrations, githubcommits, githubrepos } from 'db.ts';
import { eq } from 'drizzle-orm';

interface githubCommits {
    CommitID: string,
    author: {
        id: string
    },
    commit: {
        description: string,
        author: {
            id: string;
            date_created: Date;
        }
    }
    RepoID: string,
    AccountID: string,
    name: string,
    CommitUrl: string,
    description: string,
    date_created: Date;
}

export default async function updateDatabase(req: Request, res: Response) {
    const access_token = req.headers.authorization?.slice(7);
    const userResponse = await supabaseClient.auth.getUser(access_token);
    if (userResponse.error || !userResponse.data.user) {
        console.error("Error fetching user from Supabase:", userResponse.error);
        return res.status(401).json({ error: "Unauthorized" });
    }

    //TeamID and github access token needed
    const userId = userResponse.data.user.id;
    const query = req.query;

    const TeamID = query.TeamID as string;
    const url = query.url as string;

    const splitUrl = url.split('/');
    console.log("split url:", splitUrl);
    const owner = splitUrl[3];
    const repo = splitUrl[4];

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

    //fetch repoId from database
    const getRepo = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            "Accept-Encoding": "application/json",
            'X-GitHub-Api-Version': '2026-03-10',
            "application": `Bearer ${githubaccesstoken}`
        }
    })

    if (!getRepo.ok) {
        console.log("failed to fetch repo");
    }

    const parsedRepoData = await getRepo.json();

    const repoId = parsedRepoData.id;

    let counter = 0;
    let lastPage = false;
    let nextPage = true
    let commitsArray: githubCommits[] = [];

    //fetch commits from github, it paginates so i will have to handle that somehow https://github.com/orgs/community/discussions/102883
    while (nextPage) {
        //recognises its the last page
        function LastPage(){
            lastPage = true;
        }


        if (lastPage != false) {
            nextPage = false;
            console.log("nextPage is now: ", nextPage);
        }

        counter++;
        let fetchCommits = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?page=${counter}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
                "Authorization": `token ${githubaccesstoken}`
            }
        })
        console.log("fetchCommits", fetchCommits);

        if (!fetchCommits.ok) {
            console.log("failed to fetch commits")
        }

        let parsedFetchedCommits = await fetchCommits.json();


      //potentially rename the data in db to fit the github field names
        let mapCommits = await parsedFetchedCommits.map((commit: any) => ({
            CommitID: commit.sha,
            RepoID: repoId,
            AccountID: commit.author.id,
            name: "remove this part",
            section: "remove this part",
            description: commit.commit.message,
            CommitUrl: commit.html_url,
            date_created: new Date(commit.commit.author.date)
        }))
          commitsArray.push(...mapCommits);


        let link = fetchCommits.headers.get("link");
        //check if it has more pages
        if (link != undefined) {
            //split the link up to get to rel, to find if it has a next or a last
            let splitLink = link.split(/[""]+/) //https://stackoverflow.com/questions/650022/how-do-i-split-a-string-with-multiple-separators-in-javascript
            console.log("splitLink: ", splitLink);
            if (splitLink[1] !== "next") {
                //next page is last
                LastPage();
            }
        }
    }

    console.log("commitsArray: ", commitsArray);
    const insertCommits = await db.insert(githubcommits)
    .values(commitsArray)
    .onConflictDoNothing(); //line that allows the inserted info to only be new 

    res.status(200).json({message: "Successfully added all commits from repo to database"});
}