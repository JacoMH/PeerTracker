import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';


import { invites, teams, users } from 'db.ts';
import { eq, and, count } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
// Interface
import { User } from '../../interface/User.ts';


export default async function fetchuserteams(req: Request<User>, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = userResponse.data.user.id;

        //subquery
        const memberCountSubquery = db.select({
            MemberCount: count(invites.InviteID).as("MemberCount"),
            TeamID: invites.TeamID
        })
            .from(invites)
            .where(eq(invites.status, "Accepted"))
            .groupBy(invites.TeamID)
            .as("member_count");

        let supervisor = alias(users, "supervisor");

        //Fetch supervisor name
        /* const supervisorSubquery = db.select({
             SupervisorID: invites.SupervisorID,
             FirstName: users.FirstName,
             LastName: users.LastName,
         })
             .from(invites)
             .innerJoin(users, eq(users.UserID, invites.SupervisorID))
             .as("supervisor_info");*/


        const userTeams = await db.select({
            TeamID: invites.TeamID,
            TeamName: teams.TeamName,
         //   MemberCount: memberCountSubquery.count,
            SupervisorID: supervisor.UserID,
            SupervisorFirstname: supervisor.FirstName,
            SupervisorLastname: supervisor.LastName,
            MemberCount: memberCountSubquery.MemberCount
        })
            .from(invites)
            .innerJoin(users, eq(users.UserID, invites.UserID))
            .innerJoin(teams, eq(teams.TeamID, invites.TeamID))
            .leftJoin(memberCountSubquery, eq(memberCountSubquery.TeamID, invites.TeamID))
            .leftJoin(supervisor, eq(supervisor.UserID, invites.SupervisorID))
           // .leftJoin(memberCountSubquery, eq(memberCountSubquery.TeamID, teams.TeamID))
            .where(
                and(
                    eq(users.UserID, userId.toString()),
                    eq(invites.status, "Accepted")),
            )
            .groupBy(invites.TeamID, teams.TeamName, supervisor.UserID, supervisor.FirstName, supervisor.LastName, memberCountSubquery.MemberCount) 
            .execute();




        console.log("User Teams:", userTeams);
        return res.status(200).json({ message: "Fetched User", data: userTeams });
    }
    catch (error) {
        console.log("Error fetching teams:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}