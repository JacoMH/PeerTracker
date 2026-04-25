import { users } from '../../db.ts'
import { db } from '../../index.ts'
import { Request, Response } from 'express';

// Interface
import { User } from '../../interface/User.ts';

export default async function createuser(req: Request, res: Response) {
    try {
        // Create user in database with other information
        console.log('Creating user with data:', req.body);
        //https://orm.drizzle.team/docs/insert


        const userInsert = await db.insert(users).values({
            UserID: req.body.UserID,
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            Email: req.body.email,
            Role: req.body.Role
        }).returning()

        console.log("successful time to return: ", userInsert)
        console.log()
        return res.status(200).json({ message: "User created successfully", data: userInsert });
    }
    catch (err) {
        console.error('Error creating user or auth user:', err)
        return res.status(500).json({ error: "Error creating user" });
    }
}