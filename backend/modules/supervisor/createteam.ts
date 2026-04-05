import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { invites, teams } from 'db.ts';

// Interface
import { User } from '../../interface/User.ts';

export default async function fetchuserteams(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token
        
        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const supervisorId = userResponse.data.user.id;

        const TeamName = req.body.TeamName;
        const users: User[] = req.body.Users;

        //create team first
        const createTeam = await db.insert(teams).values({
            TeamName: TeamName,
        }).returning(); //fetches the row that was just inserted

        const teamID = createTeam[0].TeamID; //returns an array so have to specify which one to use

        //setup values for insert
        const userinvites = users.map(user => ({
            UserID: user.UserID,
            TeamID: teamID,
            SupervisorID: supervisorId,
            status: "pending"
        }));

        //create invites for users for the team https://orm.drizzle.team/docs/transactions
        const sendInvites = await db.transaction(async (tx) => {
            await tx.insert(invites).values(userinvites);
        })
           

        console.log("Supervisor Invites:", sendInvites, "Supervisor Teams:", createTeam);
        return res.status(201).json({ message: "Invites sent and team created"});
    }
    catch (error) {
        console.log("Error completing creating team process:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}