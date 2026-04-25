//so checks last commits for unique accounts in commits, finds accounts that are tied to them if it can, then sends notification to the account if not done anything in beyond 2 weeks

//https://kevincunningham.co.uk/posts/node-cron/


import { github_integrations, githubcommits, githubrepos, Notification, teams, trello_integrations, TrelloAction, TrelloBoard, users } from "../../db.ts";
import { and, eq, desc } from 'drizzle-orm'
import cron from "node-cron";
import { db, supabaseClient } from '../../index.ts'



export async function workDoneTrello() {

    //runs daily
    cron.schedule("0 0 * * *", async () => {
        //fetch the individual last commits from each user, the repo that was in and then link it to the team

        //go through github connections
        const trello_integrations_query = await db.select()
            .from(trello_integrations)

        //map each integration
        const mapintegrations = trello_integrations_query.map((integration: any) => (
            integration.AccountID
        ))

        console.log("mapintegrations: ", mapintegrations);

        //define what im populating
        const actions: any[] = [];

        for (const AccountID of mapintegrations) {
            //grabs latest commit for the user
            const fetchActionsUserTeam = await db.select({
                CommitID: TrelloAction.ActionID,
                userID: users.UserID,
                RepoID: TrelloBoard.BoardID,
                TeamID: teams.TeamID,
                AccountID: TrelloAction.AccountID,
                date_created: TrelloAction.date_created
            })
                .from(TrelloAction)
                .innerJoin(TrelloBoard, eq(TrelloBoard.BoardID, TrelloAction.BoardID))
                .innerJoin(teams, eq(teams.TeamID, TrelloBoard.TeamID))
                .leftJoin(trello_integrations, eq(trello_integrations.AccountID, TrelloAction.AccountID))
                .leftJoin(users, eq(users.UserID, trello_integrations.UserID))
                .orderBy(desc(TrelloAction.date_created))
                .limit(1)
                .execute()

            console.log("evidence: ", mapintegrations);


            //if exists then adds it to the list
            if (fetchActionsUserTeam) {
                actions.push(...fetchActionsUserTeam)
            }
        }

        //once done then go over the commit array and compare dates to now, sending out notifications if the last commit is over 2 weeks ago

        for (const useraction of actions) {
            console.log("works: ", useraction.AccountID)

            const oneday = 1000 * 60 * 60 * 24;
            const currentTime = new Date(Date.now())
            const date_created = new Date(useraction.date_created);

            //difference between dates
            const difference = currentTime.getTime() - date_created.getTime();

            const dayDifference = Math.round(difference / oneday);

            console.log("difference", dayDifference, "useraction: ", useraction);

            if (dayDifference >= 14) {
                console.log("commit to github now");

                //grab user 

                const notificationAction = await db.insert(Notification)
                    .values({
                        ReportedUserID: useraction.userID,
                        TeamID: useraction.TeamID,
                        Description: "Over 2 weeks inactive",
                        Type: "Trello"
                    }).returning()

                if (notificationAction) {
                    console.log("successful", notificationAction)
                }
            }
        }
    })
}
