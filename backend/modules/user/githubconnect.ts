import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';


import { github_integrations } from 'db.ts';
import { eq, and, count } from 'drizzle-orm';
// Interface
import { User } from '../../interface/User.ts';


export default async function githubConnect(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token
        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        const UserId = userResponse.data.user?.id;
        

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        //parse request
        const body = await req.body;
        console.log("body: ", body);

        const client_id = body.client_id;
        const code = body.code;
        const redirect_uri = body.redirect_uri;

        console.log(client_id, code, redirect_uri, process.env.GITHUB_CLIENT_SECRET);

        //do the token exchange
        const tokenExchange = await fetch('https://github.com/login/oauth/access_token', { //https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
            },
            body: JSON.stringify({
                client_id: client_id,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: redirect_uri
            })
        })

        if (!tokenExchange.ok) {
            console.log("error: ", tokenExchange);
            return res.json({ message: "Error fetching github token"});
        }

        const response = await tokenExchange.json();
        console.log("access stuff:", response);
        const github_access_token = response.access_token;

        console.log("ACCESS TOKEN LOOK HERE", github_access_token);


        const githubUserInfo = await fetch('https://api.github.com/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
                "Authorization": `Bearer ${github_access_token}`,
                'X-GitHub-Api-Version': '2026-03-10',
            }
        })

        if (!githubUserInfo.ok) {
            console.log("error: ", githubUserInfo);
            return res.json({ message: "Error fetching user info" });
        }

        const userInfo = await githubUserInfo.json();

        const InsertInfo = await db.insert(github_integrations).values({
            AccountID: userInfo.id,
            UserID: UserId || "no user",
            access_token: github_access_token,
            refresh_token: "included later",
            accountName: userInfo.login,
            url: userInfo.html_url
        });

        return res.status(200).json({ message: "Github Integrated successfully" });
        //put user info + token into db, maybe later on change it to include refresh token so this process doesnt need repeating often.

        //if successful then use this token to fetch user info from github, and alongside the token 
    }
    catch (error) {
        console.log("Error fetching github access token:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}