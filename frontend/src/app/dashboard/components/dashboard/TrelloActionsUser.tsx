import { supabase } from "@/lib/supabase";
import { useState, useEffect } from 'react';
import { subWeeks, startOfWeek, format } from "date-fns";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

//Interfaces
import { TrelloCards } from '@/interfaces/TrelloCards'
import { trelloActionForGraph } from "@/interfaces/TrelloActionForGraph";
import { DisplayMetrics } from "@/interfaces/DisplayMetrics";
import { trelloList } from "@/interfaces/TrelloList";
import { TrelloAction } from '@/interfaces/TrelloAction'

interface Props {
    TeamID: string,
    UserID: string,
    BoardID: string,
    sendModal: (response: TrelloCards) => void;
}

ChartJS.register( //https://react-chartjs-2.js.org/examples/line-chart/ this for chart.js in react and also fix the loading issues with the link repos and board and also cycling through everything on each load, fix it 
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Here i will use Chart.js to show weekly contributions
export default function OverdueTasks({ TeamID, UserID, BoardID, sendModal }: Props) {
    const [trelloActionForGraph, setTrelloActionForGraph] = useState<trelloActionForGraph[]>([]);
    const [trelloActionMetrics, setTrelloActionMetrics] = useState<TrelloAction[]>([])
    const [displayMetrics, setDisplayMetrics] = useState<DisplayMetrics[]>([]);
    const [trelloLists, setTrelloLists] = useState<trelloList[]>([]);
    const [TrelloCards, setTrelloCards] = useState<TrelloCards[]>([]);

    const dataSetup = {
        labels: displayMetrics.map(label => label.labelDate),
        datasets: [
            {
                label: 'Trello Actions',
                data: displayMetrics.map(metrics => Number(metrics.ActionsCount)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ],
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Engagement Chart',
            },
        },
    };

    useEffect(() => {
        fetchTrelloActions();
        //user actions over the past 7 weeks
        fetchTrelloActionsForGraph();
        fetchTrelloCards();
        fetchTrelloLists();
    }, [])

    function toggleModalHandler(response: string) {
        //toggles modal for viewing the card
        let currentCard = TrelloCards.find(card => card.CardID === response)
        if (currentCard) {
            console.log("found and set: ", currentCard);
            sendModal(currentCard)
        }
        else {
            //do error message here that pops up on screen
        }
    }

    useEffect(() => {
        const labelArray = Array.from({ length: 7 }, (_, i) => ({
            ActionsCount: 0,
            labelDate: format(startOfWeek(subWeeks(Date.now(), i)), "dd-MM-yy") // weeks going back 7 weeks
        }))
        //set github data
        if (trelloActionForGraph) {

            for (const action of trelloActionForGraph) {
                //set action value to the week
                let matchedDate = labelArray.find(label => label.labelDate === format(startOfWeek(action.date), "dd-MM-yy"))

                if (matchedDate) {
                    matchedDate.ActionsCount = Number(action.ActionsCount);
                    console.log("value being added:", action.ActionsCount);
                }
            }


            setDisplayMetrics(labelArray.reverse());
        }
    }, [trelloActionForGraph])

    const parsedData = (data: any) => {
        let parsedData = JSON.parse(data);

        if (!parsedData) {
            return "Empty"
        }
        else if (parsedData.idList) {
            let list = trelloLists?.find(list => list.ListID === parsedData.idList)
            console.log("trellolists", trelloLists);
            return `Moved from ${list?.name}`;
        }
        else if (parsedData.closed === false) {
            return "Archived Card";
        }
        else {
            return "Empty"
        }

    }


    return (

        <div className="flex flex-col bg-gray-200 p-15 rounded-2xl">

            <div className="flex justify-center h-70 ">
                {/* Graph here showing actions over the timeframe but for this user only */}
                <Line options={options} data={dataSetup} />
            </div>

            <div className="flex h-96 flex-col items-start justify-start">
                {/* Log of all actions in a scrollable format */}
                {
                    Array.isArray(trelloActionMetrics) && trelloActionMetrics.length > 0 ? (
                        <table className="table-auto flex flex-col items-center">
                            <thead className="self-center flex justify-between gap-5">
                                <tr className="flex flex-row justify-between">
                                    <th className="px-20">Type</th>
                                    <th className="px-20">Old Data</th>
                                    <th className="px-20">Card</th>
                                    <th className="px-20">Date Created</th>
                                </tr>
                            </thead>

                            <tbody className="flex flex-col w-full items-center overflow-y-auto max-h-70">
                                {trelloActionMetrics.map((action: TrelloAction) => (
                                    <tr key={action.ActionID} className="flex flex-row  w-full justify-between">
                                        <td className=" px-2 items-center" >{action.type}</td>
                                        <td className=" px-2 items-center" aria-label={action.oldData} >
                                            <div>{parsedData(action.oldData)}</div>
                                        </td>
                                        <td onClick={() => toggleModalHandler(action.CardID)}>View Card</td>
                                        <td className=" px-2 items-center" >{action.date_created.slice(2, 10)}</td>
                                    </tr>

                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div>
                            No Data
                        </div>
                    )
                }
            </div>
        </div >

    )

    async function fetchTrelloActions() {
        //fetch the trello actions for this specific user

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/metrics/fetchactionsperuser?UserID=${UserID}&TeamID=${TeamID}&BoardID=${BoardID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching trello actions:", res)
        }

        const response = await res.json();

        console.log("trello actions: ", response.data)

        setTrelloActionMetrics(response.data);
    }

    async function fetchTrelloActionsForGraph() {
        //fetch the trello actions for this specific user

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/metrics/fetchactionsforgraph?UserID=${UserID}&TeamID=${TeamID}&BoardID=${BoardID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching trello actions:", res)
        }

        const response = await res.json();

        console.log("trello actions for graph: ", response.data)

        setTrelloActionForGraph(response.data);
    }



    async function fetchTrelloCards() {

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/fetchtrellocards?BoardID=${BoardID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching trello cards:", res)
        }

        const response = await res.json();

        setTrelloCards(response.data)
    }

    async function fetchTrelloLists() {

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/fetchtrellolists?BoardID=${BoardID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching trello cards:", res)
        }

        const response = await res.json();

        setTrelloLists(response.data)
    }
}