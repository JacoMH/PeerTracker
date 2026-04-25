//so checks last commits for unique accounts in commits, finds accounts that are tied to them if it can, then sends notification to the account if not done anything in beyond 2 weeks

//https://kevincunningham.co.uk/posts/node-cron/


import { github_integrations, githubcommits, githubrepos, Notification, teams, users } from "../../db.ts";
import { and, eq, desc } from 'drizzle-orm'
import cron from "node-cron";
import { db, supabaseClient } from '../../index.ts'

export async function workDoneGithub() {
    //runs daily
    cron.schedule("0 0 * * *", async () => {
        console.log("I will run every minute.")

        //fetch the individual last commits from each user, the repo that was in and then link it to the team

        //go through github connections
        const github_integrations_query = await db.select()
            .from(github_integrations)

        //map each integration
        const mapintegrations = github_integrations_query.map((integration: any) => (
            integration.AccountID
        ))

        console.log("mapintegrations: ", mapintegrations);

        //define what im populating
        const commits: any[] = [];

        for (const AccountID of mapintegrations) {
            //grabs latest commit for the user
            const fetchCommitUserTeam = await db.select({
                CommitID: githubcommits.CommitID,
                userID: users.UserID,
                RepoID: githubrepos.RepoID,
                TeamID: teams.TeamID,
                AccountID: githubcommits.AccountID,
                date_created: githubcommits.date_created
            })
                .from(githubcommits)
                .innerJoin(githubrepos, eq(githubrepos.RepoID, githubcommits.RepoID))
                .innerJoin(teams, eq(teams.TeamID, githubrepos.TeamID))
                .leftJoin(github_integrations, eq(github_integrations.AccountID, githubcommits.AccountID))
                .leftJoin(users, eq(users.UserID, github_integrations.UserID))
                .where(eq(githubcommits.AccountID, AccountID))
                .orderBy(desc(githubcommits.date_created))
                .limit(1)
                .execute()

            console.log("evidence: ", mapintegrations);


            //if exists then adds it to the list
            if (fetchCommitUserTeam) {
                commits.push(...fetchCommitUserTeam)
            }
        }

        //once done then go over the commit array and compare dates to now, sending out notifications if the last commit is over 2 weeks ago

        for (const usercommit of commits) {
            console.log("works: ", usercommit.AccountID)
            //https://stackabuse.com/javascript-get-number-of-days-between-dates/
            const oneday = 1000 * 60 * 60 * 24;
            const currentTime = new Date(Date.now())
            const date_created = new Date(usercommit.date_created);

            //difference between dates
            const difference = currentTime.getTime() - date_created.getTime();

            const dayDifference = Math.round(difference / oneday);
            console.log("difference: ", dayDifference)

            if (dayDifference >= 14) {
                console.log("commit to github now");

                //grab user 

                const notificationCommit = await db.insert(Notification)
                    .values({
                        ReportedUserID: usercommit.userID,
                        TeamID: usercommit.TeamID,
                        Description: "Over 2 weeks inactive",
                        Type: "Github"
                    }).returning()

                if (notificationCommit) {
                    console.log("successful", notificationCommit)
                }
            }
        }


    });
}
