import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, count, and } from 'drizzle-orm';
import createtrellowebhook from 'modules/webhook/createtrellowebhook.ts';

// Interface
import { User } from '../../interface/User.ts';
import { AssignedCard, trello_integrations, TrelloAction, TrelloBoard, TrelloCard, TrelloList } from 'db.ts';

export default async function updateTrelloDatabase(req: Request, res: Response) {
    try {
        const access_token = req.headers.authorization?.slice(7); // access_token

        // Fetch user ID using access token which also validates the token
        const userResponse = await supabaseClient.auth.getUser(access_token);

        if (userResponse.error || !userResponse.data.user) {
            console.error("Error fetching user from Supabase:", userResponse.error);
            return res.status(401).json({ error: "Unauthorized" });
        }

        //get stuff from query
        const userId = userResponse.data.user.id;
        const query = req.query;
        const TeamID = query.TeamID as string;
        const url = query.url as string;
        const urlID = url.split("/")[4];

        //get token from database 
        const fetchToken = await db.select()
            .from(trello_integrations)
            .where(eq(trello_integrations.UserID, userId))
            .execute();

        //get board id from database
        const fetchBoardID = await db.select()
            .from(TrelloBoard)
            .where(eq(TrelloBoard.TeamID, TeamID))
            .execute();

        const BoardID = fetchBoardID[0].BoardID;
        const token = fetchToken[0].access_token;

        //Grab Trello Lists

        const getTrelloList = await fetch(`https://api.trello.com/1/boards/${urlID}/lists?key=${process.env.TRELLO_API_KEY}&token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
            }
        })

        if (!getTrelloList.ok) {
            console.log("failed to fetch cards");
        }

        const parsedListData = await getTrelloList.json();

        let mapLists = await parsedListData.map((List: any) => ({
            ListID: List.id,
            BoardID: BoardID,
            name: List.name,
            closed: List.closed,
            position: List.pos
        }))

        if (mapLists.length > 0) {
            const insertList = await db.insert(TrelloList)
                .values(mapLists);
        }

        //Grab Trello Cards
        const getCards = await fetch(`https://api.trello.com/1/boards/${urlID}/cards/all?key=${process.env.TRELLO_API_KEY}&token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
            }
        })

        if (!getCards.ok) {
            console.log("failed to fetch cards");
        }

        const parsedCardsData = await getCards.json();
      //  console.log("PARSEDCARDDATA:", parsedCardsData);
        

        let mapCards = await parsedCardsData.map((Card: any) => ({
            CardID: Card.id,
            BoardID: BoardID,
            ListID: Card.idList,
            name: Card.name,
            dueComplete: Card.dueComplete,
            dueDate: Card.due ? new Date(Card.due) : null
        }))

      //  console.log("mapcards: ", mapCards);
        if (mapCards.length > 0) {
            const insertCards = await db.insert(TrelloCard)
                .values(mapCards);
        }

        // Insert Trello Assignments
        let mapAssignments = await parsedCardsData.flatMap((Card: any) =>
            Card.idMembers.map((memberId: any) => ({
                CardID: Card.id,
                AccountID: memberId
            }))
        );

      //  console.log("Map Assignments: ", mapAssignments);

        //insert trello assignments
        if (mapAssignments.length > 0) {
            const insertAssignments = await db.insert(AssignedCard)
                .values(mapAssignments)
                .onConflictDoNothing();
        }


        // Grab Trello Actions (Max 50 at once may have to paginate) https://developer.atlassian.com/cloud/trello/rest/api-group-boards/#api-boards-boardid-actions-get
        const getActions = await fetch(`https://api.trello.com/1/boards/${urlID}/actions?limit=1000&filter=createCard,commentCard,createList,deleteCard,addMemberToCard,updateCard:idList,updateCard:closed&key=${process.env.TRELLO_API_KEY}&token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
            }
        })

        if (!getActions.ok) {
            console.log("failed to fetch actions");
        }

        const parsedActionsData = await getActions.json();
      //  console.log("Board ID::::", BoardID);
       // console.log("getActions Info::::: ", parsedActionsData);

        //map data
        let mapActions = await parsedActionsData.map((Action: any) => ({
            ActionID: Action.id,
            BoardID: BoardID,
            CardID: Action.data.card?.id || null,
            AccountID: Action.idMemberCreator,
            type: Action.type,
            oldData: Action.data?.old || null,
            date_created: new Date(Action.date)
        }))

        //put actions data in db
        if (mapActions.length > 0) {
            const insertActions = await db.insert(TrelloAction)
                .values(mapActions)
                .onConflictDoNothing();
        }

        //call on trellowebhook to stay updated 
        createtrellowebhook(BoardID, userId)

        return res.status(200).json({ message: "Successful Database Update" })
    }
    catch (error) {
        console.log("Error updating trello db:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}