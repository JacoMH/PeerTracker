//Fetches specific team and the members in the team

import { Request, Response } from 'express';
import { db, supabaseClient } from '../index.ts'
import { invites, teams, users } from 'db.ts';
import { eq, and, ne } from 'drizzle-orm';

export default async function fetchteam(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); //Slices off Bearer leaving only the access_token https://stackoverflow.com/questions/44497550/how-to-retrieve-a-bearer-token-from-an-authorization-header-in-javascript-angul

        console.log("headers: ", req.headers);
        //verify supabase
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }



        const TeamID = req.query.TeamID || "";
        const UserID = userResponse.data.user.id;
        // check db for github repo related to the team

        const fetchteam = await db.select({
            TeamID: invites.TeamID,
            TeamName: teams.TeamName,
            UserID: invites.UserID,
            UserFirstName: users.FirstName,
            UserLastName: users.LastName,
            UserRole: users.Role
        }
        )
            .from(invites)
            .innerJoin(users, eq(users.UserID, invites.UserID))
            .innerJoin(teams, eq(teams.TeamID, invites.TeamID))
            .where(
                and(
                    eq(invites.status, "Accepted"),
                    eq(invites.TeamID, TeamID.toString()),
                    ne(invites.UserID, UserID)
                )
            )
            .execute();

     //   console.log("fetchTeam: ", fetchteam);

        if (fetchteam.length > 0) {
            return res.status(200).json({ message: "Fetched team info", data: fetchteam })
        }
        else {
            return res.status(500).json({ message: "Failed to fetch team info" })
        }
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}