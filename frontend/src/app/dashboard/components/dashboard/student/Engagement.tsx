import { supabase } from "@/lib/supabase";
import { useState, useEffect } from 'react';
import { subWeeks, startOfWeek } from "date-fns";

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



interface Props {
    RepoID: String,
    BoardID: String,
    TeamID: String
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

interface githubdata {
    AccountID: string,
    CommitCount: string,
    UserID: string,
    date: string
}

interface trellodata {
    AccountID: string,
    UserID: string,
    TrelloAction: string,
    date: string
}

interface engagementMetrics {
    githubdata: githubdata[],
    trellodata: trellodata[]
}


interface displayMetrics {
    TrelloAction: number
    CommitCount: number,
    labelDate: string
}


// Here i will use Chart.js to show weekly contributions
export default function Engagement({ RepoID, BoardID, TeamID }: Props) {
    const [engagementMetrics, setEngagementMetrics] = useState<engagementMetrics>();
    const [displayMetrics, setDisplayMetrics] = useState<displayMetrics[]>([]);

    const dataSetup = {
        labels: displayMetrics.map(label => new Date(label.labelDate).toISOString().slice(2,10)),
        datasets: [
            {
                label: 'Github Commits',
                data: displayMetrics.map(metrics => Number(metrics.CommitCount)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Trello Actions',
                data: displayMetrics.map(metrics => Number(metrics.TrelloAction)),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
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


    console.log("displayMetrics:", displayMetrics);
    useEffect(() => {
        engagement();
        //sort out chartjs stuff here
        //determine what data can go onto the screen
    }, [])

    useEffect(() => {
        //fill this with the labels, then change the commitcounts alongside those labels to its corresponding week https://medium.com/@wisecobbler/4-ways-to-populate-an-array-in-javascript-836952aea79f
        const labelArray = Array.from({ length: 7 }, (_, i) => ({
            TrelloAction: 0,
            CommitCount: 0,
            labelDate: startOfWeek(subWeeks(Date.now(), i)).toISOString() // weeks going back 7 weeks
        }))
        //set github data
        if (engagementMetrics) {

            console.log("github data:", engagementMetrics)
            for (const githubdata of engagementMetrics.githubdata) {
                console.log("engagement metrics", engagementMetrics);
                //set commit value to the week
                let matchedDate = labelArray.find(label => label.labelDate === startOfWeek(githubdata.date).toISOString())

                if (matchedDate) {
                    matchedDate.CommitCount = Number(githubdata.CommitCount);
                }
            }

            for (const trellodata of engagementMetrics.trellodata) {
                console.log("trelloData: ", trellodata);
                //set commit value to the week
                let matchedDate = labelArray.find(label => label.labelDate === startOfWeek(trellodata.date).toISOString())
                console.log("trello date: ", trellodata.date);
                if (matchedDate) {
                    matchedDate.TrelloAction = Number(trellodata.TrelloAction)
                }

                console.log("matchedDate: ", matchedDate);
            }

            setDisplayMetrics(labelArray.reverse());
        }
    }, [engagementMetrics])

    useEffect(() => {
        console.log("displayed github metrics: ", displayMetrics);
    }, [displayMetrics])

    return (
        <>
            <Line options={options} data={dataSetup} />
        </>

    )


    async function engagement() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/metrics/engagement?RepoID=${RepoID}&BoardID=${BoardID}&TeamID=${TeamID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching github repo:", res)
        }

        const response = await res.json();

        console.log("engagement metrics: ", response.data)

        setEngagementMetrics(response.data);
    }
}