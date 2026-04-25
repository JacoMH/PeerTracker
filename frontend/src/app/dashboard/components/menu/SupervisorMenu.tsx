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
    const [error, setError] = useState("");

    const router = useRouter();
    const supervisorInfo = async () => {
        const teams = await fetchSupervisedTeams();
        setSupervisorTeam(teams.data);
        console.log(teams);
        console.log("supervisor teams:", supervisorTeam);
    }

    // Error message timer for 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error])

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
        <div className='bg-gray-600 flex p-10 justify-between w-full max-w-300 h-full max-h-150 rounded-2xl'>
            <div className='flex flex-col max-w-[45%] w-full'>
                <div className="text-5xl font-bold flex justify-center mb-10">Select Team</div>
                <div className="border rounded-4xl bg-gray-400 w-full flex justify-self-center max-h-120 h-full px-10 py-5">
                    <div className='flex flex-col gap-5 justify-content-start overflow-y-scroll max-h-100 h-full w-full'>
                        {Array.isArray(supervisorTeam) && supervisorTeam.length > 0 ? (
                            supervisorTeam.map((team: any) => (
                                <div key={team.TeamID} className="flex self-center flex-row justify-between w-full p-3 bg-gray-600 rounded-2xl ">
                                    <div className='self-center'>{team.TeamName ?? "Unknown"}</div>
                                    <div className="self-center"><UserIcon /></div>
                                    <div className='self-center'>{team.MemberCount + "Members" || team.MemberCount === 1 ? "1 Member" : "0 Members"}</div>
                                    <button onClick={() => router.push(`/dashboard/teams/${team.TeamID}`)} className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl">View Team</button>
                                </div>
                            ))
                        ) : (
                            <div> No Teams found. </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='flex flex-col max-w-[45%] w-full h-full'>
                <div className="text-5xl font-bold  mb-10 self-center">Create Team</div>
                <div className="border rounded-4xl place-content-center bg-gray-400 w-full flex justify-self-center max-h-205 h-full px-5 py-5">
                    <form onSubmit={(e) => { e.preventDefault(); createTeam() }}>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="teamName" className="">Team Name</label>
                            <input type='text' name='teamName' className="p-2 bg-gray-500 rounded-2xl text-white flex justify-center" value={teamName} onChange={(e) => setTeamName(e.target.value)}></input>
                        </div>
                        <div className="flex p-1">Selected Users</div>
                        <div className="flex flex-row justify-between w-full">
                            <div className="flex flex-row">
                                {Array.isArray(selectedUsers) && selectedUsers.length > 0 ? (
                                    selectedUsers.map((result: User) => (
                                        <div key={result.UserID} className="flex p-3 bg-gray-500 rounded-2xl mt-2 w-full h-full">
                                            <div aria-label={`${result.FirstName} ${result.LastName} ${result.Email}`} title={`${result.FirstName} ${result.LastName} ${result.Email}`}
                                                onClick={() => setSelectedUsers(selectedUsers => selectedUsers.filter((user) => user.UserID !== result.UserID))}><UserIcon />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex p-3 bg-gray-500 rounded-2xl mt-2 max-h-30 w-full h-full">
                                        No-one selected
                                    </div>
                                )}
                            </div>
                        </div>
                        <label htmlFor="searchBar" className="flex p-1">Search For User</label>
                        <div className="flex flex-row gap-10">
                            <input type='search' name='searchBar' className=" bg-gray-500  p-2 rounded-2xl text-white flex justify-center"
                                value={searchUser} onChange={(e) => setSearchUser(e.target.value)}>
                            </input>
                            <button type='button' name='searchButton' onClick={() => userSearch()}
                                className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl ">
                                Search
                            </button>
                        </div>

                        <div className="flex flex-col my-2 justify-start bg-gray-500 rounded-2xl overflow-y-scroll w-full max-h-30 p-5 gap-2 h-full">
                            {Array.isArray(searchUserResults) && searchUserResults.length > 0 ? (
                                searchUserResults.map((result: any) => (
                                    //Add filter here
                                    <div key={result.UserID} className="flex self-center flex-row justify-between w-full p-3 bg-gray-600 rounded-2xl ">
                                        <div title={result.Email}>{result.FirstName} {result.LastName}</div>
                                        <button type="button" className="text-green-700 hover:text-green-500 hover:cursor-pointer"
                                            onClick={() => selectedUsers.some(user => user.UserID === result.UserID) ? setError("Already Added") : setSelectedUsers(selectedUsers => [...selectedUsers, result])}>
                                            <Check />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div>
                                    No Results
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center">
                            <button type='submit' className=" hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl">
                                Create Team
                            </button>
                        </div>
                        <div className="flex justify-center text-red-600 pb-4 pt-1">
                            {error}
                        </div>
                    </form>
                </div>
            </div>
        </div >
    )

    async function fetchSupervisedTeams() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        
        //call for fetching teams the supervisor is heading
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
        
        //searching for students to include in the team
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


        //validation
        if (selectedUsers.length <= 0 || teamName.trim() === "") {
            setError("Missing information")
            return;
        }

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

        const response = await res.json();

        if (response) {
            supervisorInfo();
        }
    }
}