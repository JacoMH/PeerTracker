import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';


import { invites, teams, users } from 'db.ts';
import { eq, and, count } from 'drizzle-orm';
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

        const studentCountSubquery = await db.select({
            TeamID: invites.TeamID,
            StudentCount: count().as("count")
        })
            .from(invites)
            .innerJoin(users, eq(users.UserID, invites.UserID))
            .where(
                and(
                    eq(users.Role, "Student"),
                    eq(invites.status, "Accepted")
                ))
            .groupBy(invites.TeamID)
            .as("student_count");

        const supervisorTeam = await db.select({
            TeamID: invites.TeamID,
            TeamName: teams.TeamName,
            StudentCount: studentCountSubquery.StudentCount
        })
            .from(invites)
            .innerJoin(teams, eq(teams.TeamID, invites.TeamID))
            .leftJoin(studentCountSubquery, eq(studentCountSubquery.TeamID, invites.TeamID))
            .where(
                    eq(invites.SupervisorID, userId)
            )
            .execute();

        console.log("Supervisor Teams:", supervisorTeam);
        return res.status(200).json({ message: "Fetched User", data: supervisorTeam });
    }
    catch (error) {
        console.log("Error fetching teams:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}