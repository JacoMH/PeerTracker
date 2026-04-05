"use client";
import { supabase } from "@/lib/supabase";
import { User as UserIcon, X, Check } from 'lucide-react'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupervisorTeam } from "@/interfaces/SupervisorTeam";
import { User } from "@/interfaces/User";

export default function SupervisorMenu() {
    const [supervisorTeam, setSupervisorTeam] = useState<SupervisorTeam[]>([]);
    const [teamName, setTeamName] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [searchUserResults, setSearchUserResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const router = useRouter();
    const supervisorInfo = async () => {
        const teams = await fetchSupervisedTeams();
        setSupervisorTeam(teams.data);
        console.log(teams);
        console.log("supervisor teams:", supervisorTeam);
    }

    useEffect(() => {
        //have calls for api for teams they manage
        supervisorInfo();
    }, [])

    useEffect(() => {
        console.log("supervisor: ", searchUserResults)
    }, [searchUserResults])

    useEffect(() => {
        console.log("Selected users:", selectedUsers);

    }, [selectedUsers])
    //useeeffect for searching
    return (
        <div>
            <div className='flex p-10 bg-gray-600 rounded-4xl'>
                <div>
                    <div className="text-5xl font-bold justify-self-center">Select Team</div>
                    <div className="m-10 p-20 border rounded-4xl bg-gray-400">
                        {Array.isArray(supervisorTeam) && supervisorTeam.length > 0 ? (
                            supervisorTeam.map((team: any) => (
                                <div key={team.TeamID} className="flex justify-between p-3 bg-gray-600 rounded-2xl">
                                    <div>{team.TeamName}</div>
                                    {Array.from({ length: team.MemberCount || 0 }).map((_, i) => (
                                        <span key={i}><UserIcon /></span>
                                    ))}
                                    <div>{team.MemberCount + "Members" || team.MemberCount === 1 ? "1 Member" : "0 Members"}</div>
                                    <button onClick={() => router.push(`/dashboard/teams/${team.TeamID}`)}>View Team</button>
                                </div>
                            ))
                        ) : (
                            <div> No Teams found. </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="text-5xl font-bold justify-self-center">Select Team</div>
                    <div className="m-10 p-20 border rounded-4xl bg-gray-400">
                        <form onSubmit={(e) => { e.preventDefault(); createTeam() }}>
                            <label htmlFor="teamName">Team Name:</label>
                            <input type='text' name='teamName' value={teamName} onChange={(e) => setTeamName(e.target.value)}></input>
                            <div>
                                <div>Section for selected Users</div>

                                {Array.isArray(selectedUsers) && selectedUsers.length > 0 ? (
                                    selectedUsers.map((result: User) => (
                                        <div key={result.UserID}>
                                            <div aria-label={`${result.FirstName} ${result.LastName} ${result.Email}`} title={`${result.FirstName} ${result.LastName} ${result.Email}`}><UserIcon /></div>
                                        </div>
                                    ))
                                ) : (
                                    <div>
                                        No-one selected
                                    </div>
                                )}
                            </div>
                            <label htmlFor="searchBar">Search For User:</label>
                            <input type='search' name='searchBar' className="bg-white" value={searchUser} onChange={(e) => setSearchUser(e.target.value)}></input>
                            <button type='submit'>Create Team</button>
                        </form>
                        <button name='searchButton' onClick={() => userSearch()}>Search</button>

                        <div>
                            {Array.isArray(searchUserResults) && searchUserResults.length > 0 ? (
                                searchUserResults.map((result: any) => (
                                    //Add filter here
                                    <div key={result.UserID}>
                                        <div>{result.Email}</div>
                                        <div>{result.FirstName}</div>
                                        <div>{result.LastName}</div>
                                        <div className="text-red-900 hover:text-red-600 hover:cursor-pointer" onClick={() => setSelectedUsers(selectedUsers => selectedUsers.filter((user) => user.UserID !== result.UserID))}><X /></div>
                                        <button className="text-green-700 hover:text-green-500 hover:cursor-pointer" onClick={() => selectedUsers.some(user => user.UserID === result.UserID) ? console.log("Already Added") : setSelectedUsers(selectedUsers => [...selectedUsers, result])}><Check /></button>
                                    </div>
                                ))
                            ) : (
                                <div>
                                    No Results
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )

    async function fetchSupervisedTeams() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        //call for fetching supervised teams
        const res = await fetch("/api/supervisor/fetchsupervisorteams", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
        });

        if (!res.ok) {
            console.log("Error fetching supervisor teams:", res)
        }

        const response = await res.json();

        console.log("response:", response);
        return response;
    }

    async function userSearch() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        //call for fetching supervised teams
        const res = await fetch(`/api/supervisor/usersearch?query=${searchUser}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching supervisor teams:", res)
        }

        const response = await res.json();

        console.log("response:", response.data);
        setSearchUserResults(response.data);
    }

    async function createTeam() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        console.log("creating team...");

        //call for fetching supervised teams
        const res = await fetch(`/api/supervisor/createteam`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                TeamName: teamName,
                Users: selectedUsers
            })
        });

    }
}