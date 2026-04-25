import { users } from '../../db.ts'
import { Request, Response } from 'express';
import { db, supabaseClient } from '../../index.ts'
import { eq } from 'drizzle-orm'

// Interface
import { User } from '../../interface/User.ts';

export default async function deleteuser(req: Request, res: Response) {
    try {
        // Create user in database with other information

        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        const userID = userResponse.data.user?.id as string;     
        
        const deleteUser = await db.delete(users)
            .where(eq(users.UserID, userID))
            .execute()

        //delete from supabase auth
        if (userID) {
            const { data, error } = await supabaseClient.auth.admin.deleteUser(
                userID
            )

            if (error) {
                console.log("error deleting user auth: ", error);
            }
        }

        return res.status(200).json({ message: "User deleted successfully"});
    }
    catch (err) {
        console.error('Error creating user or auth user:', err)
        return res.status(500).json({ error: "Error creating user" });
    }
}