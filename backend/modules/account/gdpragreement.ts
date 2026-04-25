import { users } from '../../db.ts'
import { Request, Response } from 'express';
import { supabaseClient, db } from '../../index.ts';
import { eq } from 'drizzle-orm'

// Interface

export default async function gdpragreement(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); //Slices off Bearer leaving only the access_token https://stackoverflow.com/questions/44497550/how-to-retrieve-a-bearer-token-from-an-authorization-header-in-javascript-angul

        console.log("headers: ", req.headers);
        //verify supabase
        const userResponse = await supabaseClient.auth.getUser(access_token);

        const userID = userResponse.data.user?.id as string;

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        await db.update(users)
            .set({
                GDPR_Agreement: true,
            })
            .where(eq(users.UserID, userID))

            return res.status(200).json({ message: "GDPR agreement updated successfully" });   
    }
    catch (err) {
        console.error('Error creating user or auth user:', err)
        return res.status(500).json({ error: "Error creating user" });
    }
}