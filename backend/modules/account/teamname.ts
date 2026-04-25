//Fetches specific team and the members in the team

import { Request, Response } from 'express';
import { db, supabaseClient } from '../../index.ts'
import { invites, teams, users } from 'db.ts';
import { eq, and, ne } from 'drizzle-orm';

export default async function fetchteam(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); 
      //  console.log("headers: ", req.headers);
        //verify supabase
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }



        const TeamID = req.query.TeamID as string;
        // check db for github repo related to the team

        const team = await db.select(
            {
                name: teams.TeamName
            }
        )
            .from(teams)
            .where(eq(teams.TeamID, TeamID))
            .execute()

        console.log("Team Name: ", team, TeamID)
        return res.status(200).json({ message: "Fetched team name", data: team })
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}