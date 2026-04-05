import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { invites, teams, users } from 'db.ts';
import { eq, and } from 'drizzle-orm';
// Interface
import { User } from '../../interface/User.ts';

async function getUserIdFromRequest(req: Request<User>): Promise<string | null> {
    const access_token = req.headers.authorization?.slice(7); // access_token

    // Fetch user ID using access token which also validates the token
    const userResponse = await supabaseClient.auth.getUser(access_token);

    if (userResponse.error || !userResponse.data.user) {
        console.error("Error fetching user from Supabase:", userResponse.error);
        return null;
    }
    return userResponse.data.user.id;
}


export async function fetchuserinvites(req: Request<User>, res: Response) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return res.status(500).json({ message: "Failed to fetch Id" });
        }

        //Fetch supervisor name
        const supervisorSubquery = db.select({
            SupervisorID: invites.SupervisorID,
            SupervisorFirstName: users.FirstName,
            SupervisorLastName: users.LastName,
        })
            .from(invites)
            .innerJoin(users, eq(users.UserID, invites.SupervisorID))
            .as("supervisor_info");

        // Fetch user info using ID
        const userInvites = await db.select({
            InviteID: invites.InviteID,
            TeamID: invites.TeamID,
            TeamName: teams.TeamName,
            SupervisorFirstname: supervisorSubquery.SupervisorFirstName,
            SupervisorLastname: supervisorSubquery.SupervisorLastName
        })
            .from(invites)
            .innerJoin(users, eq(users.UserID, invites.UserID))
            .innerJoin(teams, eq(teams.TeamID, invites.TeamID))
            .leftJoin(supervisorSubquery, eq(supervisorSubquery.SupervisorID, invites.SupervisorID))
            .where(
                and(
                    eq(invites.UserID, userId.toString()),
                    eq(invites.status, "pending"))
            )
            .execute();

        console.log("User Invites:", userInvites);
        return res.status(200).json({ message: "Fetched User", data: userInvites });
    }
    catch (error) {
        console.log("Error fetching team invites:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function updateinvites(req: Request<User>, res: Response) {
    try {
        const userId = await getUserIdFromRequest(req);

        //find out which button was pressed via new status being "accepted" or "denied"
        const newStatus = req.body.newStatus;
        const InviteID = req.body.InviteID;
        console.log("newStatus:", newStatus, "InviteID:", InviteID);

        if (!userId) {
            return res.status(500).json({ message: "Failed to fetch Id" });
        }

        // Logic to accept invite via invite ID and user ID
        const updateInvite = await db.update(invites)
            .set({ status: newStatus.toString() })
            .where(
                and(
                    eq(invites.InviteID, InviteID),
                    eq(invites.UserID, userId?.toString()),
                    eq(invites.status, "pending")
                )
            )
            .execute();

        if (updateInvite) {
            return res.status(200).json({ message: `Invite record updated to: ${newStatus}` });
        }
        else {
            return res.status(500).json({ error: "Error updating invite" });
        }
    }
    catch (error) {
        return res.status(500).json({ error: "Error modifying invite status" });
    }
}