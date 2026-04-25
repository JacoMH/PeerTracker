import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import express from 'express'
import router from './router/routes.js'
import { workDoneGithub } from 'modules/cronjob/workdonegithub.ts'

import { drizzle } from 'drizzle-orm/node-postgres';
import { workDoneTrello } from 'modules/cronjob/workdonetrello.ts'

dotenv.config()


//drizzle database connection
export const db = drizzle(process.env.DATABASE_URL!);


// //Supabase client for admin tasks
const supabase_url = process.env.SUPABASE_URL || ''
const service_role_key = process.env.SERVICE_ROLE || ''
const publishable_key = process.env.SUPABASE_PUBLISHABLE_KEY || ''

const supabase = createClient(supabase_url, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
export const adminAuthClient = supabase.auth.admin

export const supabaseClient = createClient(supabase_url, publishable_key);

// express server
const app = express()
app.use(express.json());
const port = 3000
app.use(express.json())

//routes
app.use('/router', router)

app.get('/', (req: any, res: any) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

workDoneGithub();
workDoneTrello();
