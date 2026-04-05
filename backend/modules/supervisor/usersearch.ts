import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';


import { users } from 'db.ts';
import { eq, or, and } from 'drizzle-orm';
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
        const SearchQuery = req.query.query || "";

        const searchUser = await db.select({
            UserID: users.UserID,
            Email: users.Email,
            FirstName: users.FirstName,
            LastName: users.LastName
        }
        )
            .from(users)
            .where(
                and(
                    eq(users.Role, "Student"),
                    or(
                        eq(users.Email, SearchQuery?.toString()),
                        eq(users.FirstName, SearchQuery?.toString()),
                        eq(users.LastName, SearchQuery?.toString())
                    )
                )
            )
            .execute();

        console.log("Supervisor Teams:", searchUser);
        return res.status(200).json({ message: "Search Results", data: searchUser });
    }
    catch (error) {
        console.log("Error fetching users:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}