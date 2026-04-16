import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { FaTrello, FaGithub } from 'react-icons/fa'
import { PiStudent } from "react-icons/pi";
import { AiOutlineTeam } from "react-icons/ai";
import { UserRoundIcon } from "lucide-react";



interface Props {
    TeamID: String;
}

// Here i will use Chart.js to show weekly contributions
export default function SupervisorColumn({ TeamID }: Props) {
    const [TeamName, setTeamName] = useState("");
    const [SupervisorData, setSupervisorData] = useState([]);
    const [TeamData, SetTeamData] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchallaccount();
        fetchteaminfo();
        getTeamName();
    }, [])

    useEffect(() => {
        console.log("teamData:", TeamData);
    }, [TeamData])

    return (
        <>
            {
                Array.isArray(SupervisorData) && SupervisorData.length > 0 ? (
                    SupervisorData.map((Supervisor: any) => (
                        <div key={Supervisor.UserID}>
                            <span className="flex justify-center text-xl font-bold">User</span>
                            <div className="m-2 p-4 rounded-2xl bg-gray-200 flex flex-col gap-5">
                                <div className="flex flex-row text-xl items-center gap-5"><AiOutlineTeam size={25} className="items-center flex" />{TeamName}</div>
                                <div className="flex flex-row text-xl items-center gap-5"><PiStudent size={25} className="items-center flex" />{Supervisor.Role}</div>
                            </div>

                            <div className="flex m-2 p-4 flex-col gap-5">
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer hover:text-gray-200 hover:bg-gray-600 bg-gray-200 p-4" onClick={() => router.push(`/dashboard/teams/${TeamID}`)}>Dashboard</button>
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer bg-gray-200 hover:text-gray-200 hover:bg-gray-600 p-4" onClick={() => router.push(`/dashboard/SupervisorReports/`)}>Supervisor Reports</button>
                            </div>

                            <span className="flex justify-center mt-5 text-xl font-bold">Tool Accounts</span>
                            <div className="m-2 p-4 rounded-2xl bg-gray-200 flex flex-col gap-5">
                                <div className="flex flex-row text-xl items-center gap-5"><FaTrello size={20} className="items-center flex" /> {Supervisor.TrelloUsername}</div>
                                <div className="flex flex-row text-xl items-center gap-5"><FaGithub size={20} className="items-center flex" /> {Supervisor.GithubUsername}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>
                        Information Unavailable
                    </div>
                )

            }

            <section>
                <span className="flex justify-center mt-5 text-xl font-bold">Members</span>
                <div className="m-2 p-4 rounded-2xl bg-gray-200">
                    {Array.isArray(SupervisorData) && SupervisorData.length > 0 ? (
                        SupervisorData.map((Supervisor: any) => (
                            <div key={Supervisor.UserID} className="flex flex-row">
                                <div>
                                    <div title={`Github: ${Supervisor.GithubUsername} Trello: ${Supervisor.TrelloUsername} `} className="flex flex-row gap-5 text-xl align-center"><UserRoundIcon size={20} className="text-yellow-500 items-center flex" /> {Supervisor.FirstName} {Supervisor.LastName}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="m-2 p-4 rounded-2xl bg-gray-200 text-center text-xl">
                            No Supervisor Info
                        </div>
                    )}
                    <div className="flex overflow-y-auto h-20">
                        {Array.isArray(TeamData) && TeamData.length > 0 ? (
                            TeamData.map((member: any) => (
                                <div key={member.UserID}>
                                    <div title={`Github: ${member.GithubUsername} Trello: ${member.TrelloUsername} `} className="flex flex-row gap-5 text-xl align-center"><UserRoundIcon size={20} className="items-center flex" /> {member.UserFirstName} {member.UserLastName}</div>
                                </div>
                            ))
                        ) : (
                            <div className="m-2 p-4 rounded-2xl bg-gray-200 text-center text-xl">
                                No Other Members
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-center gap-5">
                    <button className="flex place-self-center p-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={LogOut}>Logout</button>
                    <button className="flex place-self-center p-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={() => router.push(`/dashboard/settings/`)}>Settings</button>
                </div>
            </section>
        </>
    )

    async function LogOut() {
        const { error } = await supabase.auth.signOut()
        router.push('/auth/login/')
        if (error) {
            console.log("error signing out: ", error)
        }
    }

    async function fetchallaccount() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/fetchallaccount`, {
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

        setSupervisorData(response.data);

    }

    async function fetchteaminfo() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;


        const res = await fetch(`/api/fetchteam?TeamID=${TeamID}`, {
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
        SetTeamData(response.data);

    }

    async function getTeamName() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/teamname?TeamID=${TeamID}`, {
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

        setTeamName(response.data[0].name);
    }
}