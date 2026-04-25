import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Chart from "react-apexcharts";




interface Props {
    UserID: string;
    RepoID: string;
    descriptionresponse: (response: string) => void;
}

interface CommitsPerHour {
    date: string;
    CommitCount: number;
}

interface displayMetrics {
    CommitCount: number,
    labelHour: string
}

interface githubCommits {
    CommitID: string,
    RepoID: string,
    AccountID: string,
    section: string,
    name: string,
    CommitUrl: string,
    description: string,
    date_created: string
}



export default function GithubHeatmap({ UserID, RepoID, descriptionresponse }: Props) {
    const [commitsForGraph, setCommitsForGraph] = useState<CommitsPerHour[]>([]);
    const [displayMetrics, setDisplayMetrics] = useState<displayMetrics[]>([]);
    const [githubCommits, setGithubCommits] = useState<[]>([]);
    //query by having a where between two dates, then between those dates each column is an hour of the day where github commits are grouped into it


    //link the docs and the stackoverflow that helped
    const state = {
        options: {
            chart: {
                height: 350,
                id: "heatmap"
            }
        },
        series: [
            {
                name: "Commits",
                data: Array.from({ length: 24 }, (_, i) => ({
                    x: i < 10 ? `0${i}:00` : `${i}:00`,
                    y: displayMetrics.find(metric => metric.labelHour === (i < 10 ? `0${i}:00` : `${i}:00`))?.CommitCount || 0
                }))
            },
        ],
    };


    useEffect(() => {
        const fetchInfo = async () => {
            await fetchHeatmapGithubCommits();
            await getUserCommits();
        }
        fetchInfo();
    }, [])

    useEffect(() => {
        console.log("commits for graph: ", commitsForGraph);

        const labelArray = Array.from({ length: 24 }, (_, i) => ({
            CommitCount: 0,
            labelHour: i < 10 ? `0${i}:00` : `${i}:00`
        }))

        if (commitsForGraph) {

            for (const commitData of commitsForGraph) {
                let matchedHour = labelArray.find(label => label.labelHour.toString() === commitData.date.split(" ")[1].slice(0, 5).toString())
                if (matchedHour) {
                    console.log("commitCount: ", commitData.CommitCount, "Number(commitData.commitCount): ", Number(commitData.CommitCount));
                    matchedHour.CommitCount += Number(commitData.CommitCount);
                }
            }
        }

        console.log("label array: ", labelArray);
        setDisplayMetrics(labelArray);

    }, [commitsForGraph])

    useEffect(() => {
        console.log("displayMetricsddd: ", githubCommits);
    }, [githubCommits])

    return (
        <div className="flex flex-col gap-30 bg-gray-200 p-10 rounded-2xl">
            <section className="flex justify-center items-center gap-5">
                {
                    displayMetrics ? (
                        <div className="flex justify-center h-70 ">
                            <Chart
                                options={state.options}
                                series={state.series}
                                type="heatmap"
                                width="600"
                            />
                        </div>
                    ) : (
                        <div>
                            No data
                        </div>
                    )
                }
            </section>

            <section className="flex flex-col items-center justify-center max-h-70 w-full">
                {
                    Array.isArray(githubCommits) && githubCommits.length > 0 ? (
                        <table className="table-auto flex flex-col items-center justify-center">
                            <thead className="self-center flex justify-between gap-5 w-full">
                                <tr className="flex justify-between w-full">
                                    <th className="">Description</th>
                                    <th className="">Date Created</th>
                                    <th className="">Link</th>
                                </tr>
                            </thead>
                            <tbody className="flex flex-col w-full max-w-[600] items-center overflow-y-auto max-h-70 gap-3">
                                {githubCommits.map((commit: githubCommits) => (
                                    <tr key={commit.CommitID} className="flex flex-row w-full bg-gray-300 px-3 py-1 rounded-2xl justify-between gap-25">
                                        <td className="hover:cursor-pointer px-2 items-center max-w-60 text-center  bg-gray-400 hover:bg-gray-600 rounded-2xl" 
                                        onClick={() => descriptionresponse(commit.description)} >Description</td>
                                        <td className=" px-2 items-center max-w-60 text-center"  >{commit.date_created.toString().slice(0, 10)}</td>
                                        <td className="px-2 items-center max-w-60 text-center bg-green-300 hover:bg-green-500 rounded-2xl">
                                            <a href={commit.CommitUrl}>Go to commit</a></td>
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
            </section>
        </div>
    )


    async function fetchHeatmapGithubCommits() {
        //fetch the github commits for this specific user

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/github/fetchcommitsforuser?UserID=${UserID}&RepoID=${RepoID}`, {
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

        console.log("response:asdadsasdasgef ddfsdf:: ", response.data)

        setCommitsForGraph(response.data);
    }

    async function getUserCommits() {
        //fetch the github commits for this specific user

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/github/fetchusercommits?UserID=${UserID}&RepoID=${RepoID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching github commits:", res)
        }

        const response = await res.json();


        setGithubCommits(response.data);
    }
}