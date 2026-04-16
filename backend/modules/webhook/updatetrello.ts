import { db, supabaseClient } from '../../index.ts'
import { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm'

import { AssignedCard, github_integrations, trello_integrations, TrelloAction, TrelloBoard, TrelloCard, TrelloList } from 'db.ts';

export default async function updatetrello(req: Request) {
    try {

        //fetch action then use action type to decide where in the database it goes, then store the action aswell
        if (req.body.action.type === "updateCard") {

            if (req.body.action.data.list?.id) {
                console.log("update card")
                await db.update(TrelloCard)
                    .set({
                        ListID: req.body.action.data.list?.id,
                        name: req.body.action.data.card?.name,
                        dueComplete: req.body.action.data.card?.dueComplete,
                        dueDate: req.body.action.data.card?.due
                    })
                    .where(eq(TrelloCard.CardID, req.body.action.data.card?.id));
            }
            else {
                console.log("this one")
                await db.update(TrelloCard)
                    .set({
                        name: req.body.action.data.card?.name,
                        dueComplete: req.body.action.data.card?.dueComplete,
                        dueDate: req.body.action.data.card?.due
                    })
                    .where(eq(TrelloCard.CardID, req.body.action.data.card?.id));
            }
        }
        else if (req.body.action.type === "addMemberToCard") {
            console.log("Add member to card");
            await db.insert(AssignedCard).values({
                CardID: req.body.action.data.card?.id,
                AccountID: req.body.action.data?.idMember,
            })
        }
        else if (req.body.action.type === "removeMemberFromCard") {
            console.log("remove member from card")
            await db.delete(AssignedCard).where(
                and(
                    eq(AssignedCard.CardID, req.body.action.data.card?.id),
                    eq(AssignedCard.AccountID, req.body.action.data?.idMember)
                )
            )
        }
        else if (req.body.action.type === "createCard") {
            console.log("create card")
            await db.insert(TrelloCard).values({
                CardID: req.body.action.data.card?.id,
                BoardID: req.body.action.data.board?.id,
                ListID: req.body.action.data.list?.id,
                name: req.body.action.data.card?.name,
                dueComplete: req.body.action.data.card?.dueComplete,
                dueDate: req.body.action.data.card?.due,
            })
        }
        else if (req.body.action.type === "deleteCard") {
            console.log("delete card")
            await db.delete(TrelloCard).where(eq(TrelloCard.CardID, req.body.action.data.card?.id))
        }
        else if (req.body.action.type === "createList") {
            console.log("create list")
            await db.insert(TrelloList).values({
                ListID: req.body.action.data.list?.id,
                BoardID: req.body.action.data.board?.id,
                name: req.body.action.data.list?.name,
                closed: req.body.action.data.list?.closed,
                position: req.body.action.data.list?.pos,
            })
        }
        else if (req.body.action.type === "updateList") {
            console.log("update list")
            await db.update(TrelloList).set({
                ListID: req.body.action.data.list.id,
                BoardID: req.body.action.data.board.id,
                name: req.body.action.data.list?.name,
                closed: req.body.action.data.list?.closed,
                position: req.body.action.data.list?.pos,
            })
            .where(eq(TrelloList.ListID, req.body.action.data.list.id))
        }

        //insert into actions
        await db.insert(TrelloAction).values({
            ActionID: req.body.action.id,
            BoardID: req.body.action.data.board.id,
            CardID: req.body?.action?.data?.card?.id,
            AccountID: req.body.action.idMemberCreator,
            type: JSON.stringify(req.body.action.type),
            oldData: req.body.action.data?.old,
            date_created: new Date(req.body.action.date)
        })

        console.log("updated: ", req.body.action)
    }
    catch (error) {
        console.log("Error updating trello using webhook:", error);
    }
}