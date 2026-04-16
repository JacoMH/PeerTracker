//Interface
import { TrelloCards } from '@/interfaces/TrelloCards'
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from 'react';
import { trelloList } from '@/interfaces/TrelloList';


// Here i will use Chart.js to show weekly contributions
export default function DisplayCard({ CardID, ListID, name, dueComplete, dueDate, BoardID, ListName, ListClosed }: TrelloCards) {
    //query by having a where between two dates, then between those dates each column is an hour of the day where github commits are grouped into it
    return (
        <div className="flex flex-col bg-gray-200 p-15 rounded-2xl">
            <div>{ListName}</div>
            <div>{name}</div>
            <div>{dueComplete}</div>
            <div>{dueDate ?? "No Due Date"}</div>
            <div>{ListClosed ? "This list is closed" : "This list is open"}</div>
        </div>
    )

}