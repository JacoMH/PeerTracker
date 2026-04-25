import { users } from '../../db.ts'
import { db } from '../../index.ts'
import { Request, Response } from 'express';
import { supabaseClient } from '../../index.ts';
import { Notification } from '../../db.ts';
// Interface
import { User } from '../../interface/User.ts';

export default async function createuser(req: Request<User>, res: Response) {
    try {
        // Create user in database with other information
        console.log('Creating user with data:', req.body);

        const body = req.body;

        //id of person reporting 
        const access_token = req.headers.authorization?.slice(7); // access_token
        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        const reporterID = userResponse.data.user?.id as string
        const TeamID = body.TeamID;
        const UserID = body.UserID;
        const description = body.Description;
        const Type = body.Type;

        console.log("reporterid: ", reporterID, "teamid: ", TeamID, "UserID", UserID, "description: ", description);

        //student on report to this one
        const insertReport = await db.insert(Notification).values({
            UserID: reporterID,
            ReportedUserID: UserID,
            TeamID: TeamID,
            Description: description,
            Type: Type
        })
        .execute();



        return res.status(200).json({ message: "Report made successfully" })
    }
    catch (err) {
        console.error('Error creating user or auth user:', err)
        return res.status(500).json({ error: "Error creating user" });
    }
}