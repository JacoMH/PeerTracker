import { users } from '../../db.ts'
import { db } from '../../index.ts'
import { Request, Response } from 'express';

// Interface
import { User } from '../../interface/User.ts';

export default async function createuser(req: Request<User>, res: Response) {
    try {
        // Create user in database with other information
        console.log('Creating user with data:', req.body);
        
        type NewUser = typeof users.$inferInsert; //https://orm.drizzle.team/docs/insert
        const insertUser = async (user: NewUser) => {
            return db.insert(users).values(user);
        }
        const newUser: NewUser = { 
            UserID: req.body.UserID,
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            Email: req.body.email,
            Role: req.body.Role 
        };
        const result = await insertUser(newUser);
        return res.status(200).json({ message: "User created successfully", data: result});
    }
    catch (err) {
        console.error('Error creating user or auth user:', err)
        return res.status(500).json({ error: "Error creating user" });
    }
}