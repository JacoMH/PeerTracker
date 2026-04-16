import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

//Interfaces 
import {Contributors} from '@/interfaces/Contributors'


interface Props {
    TeamID: String;
    contributionModal: (response: string) => void;
    heatmapModal: (response: string) => void;
}
 
// Here i will use Chart.js to show weekly contributions
export default function TopContributors({ TeamID, contributionModal, heatmapModal }: Props) {
    const [topContributions, setTopContributions] = useState<Contributors[]>([])
    const [sortedGithubContributions, setSortedGithubContributions] = useState<Contributors[]>([]);
    const [sortedTrelloContributions, setSortedTrelloContributions] = useState<Contributors[]>([]);
    const [dropDownVal, setDropDownVal] = useState<string>("1"); // 1 = Github 2 = Trello

    useEffect(() => {
        TopContributors();
    }, [])

    useEffect(() => {
        // FIX THIS SORT HERE
        const sortedGithubArray = Array.prototype.toSorted.call(topContributions, (a, b) => a.CommitCount - b.CommitCount)
        const sortedTrelloArray = Array.prototype.toSorted.call(topContributions, (a, b) => a.ActionCount - b.ActionCount)
        setSortedGithubContributions(sortedGithubArray)
        setSortedTrelloContributions(sortedTrelloArray)
    }, [topContributions])

    useEffect(() => {
        console.log("sorted contributions: ", sortedGithubContributions);
    }, [sortedGithubContributions])

    const setDropDown = (e: any) => {
        setDropDownVal(e.target.value)
    }

    return (
        <div className="flex flex-col items-start justify-start">
            <div className="flex flex-col items-start">
                <select name="topcontributions" value={dropDownVal} onChange={setDropDown} id="topcontributions">
                    <option value="1" >Github</option>
                    <option value="2" >Trello</option>
                </select>
            </div>
            {Array.isArray(sortedGithubContributions) && sortedGithubContributions.length > 0 ? (
                dropDownVal === "1" ? (
                    <table className="table-auto">
                        <thead>
                            <tr>
                                <th className="p-2">Username</th>
                                <th className="p-2">First name</th>
                                <th className="p-2">Last name</th>
                                <th className="p-2">Total Commits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedGithubContributions.map((user: any) => (
                                <tr key={user.UserID}>
                                    <td className=" text-center">{user.GithubUsername}</td>
                                    <td className=" text-center">{user.UserFirstname}</td>
                                    <td className=" text-center">{user.UserLastname}</td>
                                    <td className=" text-center hover:text-white hover:cursor-pointer" onClick={() => heatmapModal(user.UserID)}>{user.CommitCount}</td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                ) : (
                    <> </>
                )
            ) : (
                <div>
                    No Contributions
                </div>
            )
            }
        

            {Array.isArray(sortedTrelloContributions) && sortedTrelloContributions.length > 0 ? (
                dropDownVal === "2" ? (
                    <table className="table-auto">
                        <thead>
                            <tr>
                                <th className="p-2">Username</th>
                                <th className="p-2">First name</th>
                                <th className="p-2">Last name</th>
                                <th className="p-2">Total Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTrelloContributions.map((user: any) => (
                                <tr key={user.UserID}>
                                    <td className=" text-center">{user.TrelloUsername}</td>
                                    <td className=" text-center">{user.UserFirstname}</td>
                                    <td className=" text-center">{user.UserLastname}</td>
                                    <td className=" text-center hover:text-white hover:cursor-pointer" onClick={() => contributionModal(user.UserID)}>{user.ActionCount}</td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                ) : (
                    <> </>
                )
            ) : (
                <div>
                    No Contributions
                </div>
            )
            }
        </div>
    )

    async function TopContributors() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/metrics/topContributors?TeamID=${TeamID}`, {
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
        console.log("responseddddddd: ", response);

        setTopContributions(response.data);
    }
}