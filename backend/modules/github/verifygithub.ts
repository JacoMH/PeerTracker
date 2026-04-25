import { github_integrations } from 'db.ts';
import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';

export default async function createuser(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); //Slices off Bearer leaving only the access_token https://stackoverflow.com/questions/44497550/how-to-retrieve-a-bearer-token-from-an-authorization-header-in-javascript-angul
        console.log("hello here");
     //   console.log("headers: ", req.headers);
        //verify supabase
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = userResponse.data.user.id;

        const githubAccount = await db.select(
            {
                AccountID: github_integrations.AccountID,
                UserID: github_integrations.UserID,
                accountName: github_integrations.accountName,
                url: github_integrations.url
            }
        )
            .from(github_integrations)
            .where(eq(github_integrations.UserID, userId))
            .execute();


    //    console.log("githubaccount: ", githubAccount);
        if (githubAccount.length > 0) {
            return res.status(200).json({ message: "Successful verification", data: githubAccount });
        }
        else {
            return res.status(200).json({ message: "No Github Integration", data: githubAccount });
        }
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}