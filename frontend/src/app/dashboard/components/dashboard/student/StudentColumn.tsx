"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { UserRoundIcon } from "lucide-react";
import { FaTrello, FaGithub } from 'react-icons/fa'
import { PiStudent } from "react-icons/pi";
import { AiOutlineTeam } from "react-icons/ai";


interface Props {
    TeamID: String;
}


export default function StudentColumn({ TeamID }: Props) {
    const [StudentData, setStudentData] = useState([]);
    const [TeamData, SetTeamData] = useState([]);
    const [TeamName, setTeamName] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchallaccount();
        fetchteaminfo();
        getTeamName();
    }, [])

    return (
        <>
            {
                Array.isArray(StudentData) && StudentData.length > 0 ? (
                    StudentData.map((Student: any) => (
                        <div key={Student.UserID}>
                            <span className="flex justify-center text-xl font-bold">User</span>
                            <div className="m-2 p-4 rounded-2xl bg-gray-200 flex flex-col gap-5">
                                <div className="flex flex-row text-xl items-center gap-5"><AiOutlineTeam size={25} className="items-center flex" />{TeamName}</div>
                                <div className="flex flex-row text-xl items-center gap-5"><PiStudent size={25} className="items-center flex" />{Student.Role}</div>
                            </div>

                            <div className="flex m-2 p-4 flex-col gap-5">
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer hover:text-gray-200 hover:bg-gray-600 bg-gray-200 p-4" onClick={() => router.push(`/dashboard/teams/${TeamID}`)}>Dashboard</button>
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer bg-gray-200 hover:text-gray-200 hover:bg-gray-600 p-4" onClick={() => router.push(`/dashboard/settings/`)}>Settings</button>
                            </div>

                            <span className="flex justify-center mt-5 text-xl font-bold">Tool Accounts</span>
                            <div className="m-2 p-4 rounded-2xl bg-gray-200 flex flex-col gap-5">
                                <div className="flex flex-row text-xl items-center gap-5"><FaTrello size={20} className="items-center flex" /> {Student.TrelloUsername}</div>
                                <div className="flex flex-row text-xl items-center gap-5"><FaGithub size={20} className="items-center flex" /> {Student.GithubUsername}</div>
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
                    {Array.isArray(StudentData) && StudentData.length > 0 ? (
                        StudentData.map((Student: any) => (
                            <div key={Student.UserID} className="flex flex-row">
                                <div>
                                    <div aria-label={`Github: ${Student.GithubUsername} Trello: ${Student.TrelloUsername} `} className="flex flex-row gap-5 text-xl align-center"><UserRoundIcon size={20} className="text-yellow-500 items-center flex" /> {Student.FirstName} {Student.LastName}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="m-2 p-4 rounded-2xl bg-gray-200 text-center text-xl">
                            No Student Info
                        </div>
                    )}

                    {Array.isArray(TeamData) && TeamData.length > 0 ? (
                        TeamData.map((member: any) => (
                            <div key={member.UserID}>
                                <div>{member.FirstName}</div>
                                <div>{member.LastName}</div>
                                <div>{member.Role}</div>
                                <div>{member.GithubUsername}</div>
                                <div>{member.GithubAccountID}</div>
                            </div>
                        ))
                    ) : (
                        <div className="m-2 p-4 rounded-2xl bg-gray-200 text-center text-xl">
                            No Other Members
                        </div>
                    )}
                </div>
                <button className="flex place-self-center p-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={LogOut}>Logout</button>
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

        setStudentData(response.data);

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