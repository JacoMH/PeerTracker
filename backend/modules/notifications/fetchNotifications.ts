import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';


import { Notification, users } from 'db.ts';
import { eq, and, or } from 'drizzle-orm';
// Interface

export default async function fetchNotifications(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        const TeamID = req.query.TeamID as string;
        const UserID = req.query.UserID as string;

        console.log("UserID: ", UserID);
        console.log("UserID", UserID, "TeamID: ", TeamID);

        if (UserID === null) console.log("hello world")

        if (UserID === "") {
            const SupervisorNotifications = await db.select({
                ReportID: Notification.ReportID,
                ReportedUserID: Notification.ReportedUserID,
                ReportedUserFirstName: users.FirstName,
                ReportedUserLastName: users.LastName,
                ReportedUserEmail: users.Email,
                Description: Notification.Description,
                Type: Notification.Type
            })
                .from(Notification)
                .innerJoin(users, eq(users.UserID, Notification.ReportedUserID))
                .where(and(
                    eq(Notification.TeamID, TeamID),
                    eq(Notification.Type, "Supervisor")
                ))
                .execute();
            console.log("SupervisorNotifications: ",)
            return res.status(200).json({ message: "Fetched Supervisor Notifications", data: SupervisorNotifications });
        }
        else {
            const StudentNotifications = await db.select({
                ReportID: Notification.ReportID,
                ReportedUserID: Notification.UserID,
                ReporterUserFirstName: users.FirstName,
                ReporterUserLastName: users.LastName,
                ReportedUserEmail: users.Email,
                Description: Notification.Description,
                Type: Notification.Type
            })
                .from(Notification)
                .leftJoin(users, eq(users.UserID, Notification.UserID))
                .where(and(
                    eq(Notification.TeamID, TeamID),
                    eq(Notification.ReportedUserID, UserID),
                    or(
                        eq(Notification.Type, "Github"),
                        eq(Notification.Type, "Trello"),
                        eq(Notification.Type, "Student"),
                    )
                )
                )
                .execute();
            console.log("student notifications: ", StudentNotifications);
            return res.status(200).json({ message: "Fetched Student Notifications", data: StudentNotifications });
        }

    }
    catch (error) {
        console.log("Error fetching teams:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}