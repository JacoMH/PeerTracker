import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { githubrepos, invites, Notification, teams, TrelloBoard } from 'db.ts';
import { eq } from 'drizzle-orm';

// Interface


export default async function deleteNotification(req: Request, res: Response) {
    try {
        console.log("hello");
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const ReportID = req.body.ReportID;

        console.log("ReportID: ", ReportID);

        const deleteNotification = await db.delete(Notification)
            .where(eq(Notification.ReportID, ReportID))
            .execute();



        return res.status(201).json({ message: "Notification Deleted" });
    }
    catch (error) {
        console.log("Error completing creating team process:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}