"use client";
import { User, Check, X } from 'lucide-react'
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from 'react';
import { UserTeam } from '@/interfaces/UserTeam';
import { useRouter } from 'next/navigation';

export default function StudentMenu() {
    const [userTeam, setUserTeam] = useState<UserTeam[]>([]);
    const [userInvites, setUserInvites] = useState<UserTeam[]>([]);
    const router = useRouter();


    const userInfo = async () => {
        // Fetch user teams
        const teams = await fetchUserTeams();
        console.log("User teams:", teams);
        setUserTeam(teams);

        // Fetch user invites
        const invites = await fetchUserInvites();
        console.log("User Invites:", invites);
        setUserInvites(invites);
        console.log("User teams state:", teams);
    }

    useEffect(() => {
        userInfo();
    }, [])

    useEffect(() => {
        console.log("User Invites: ", userInvites);
    }, [userInvites])
    return (
        <div className='bg-gray-600 flex p-10 justify-between w-full max-w-300 h-full max-h-150 rounded-2xl'>
            <div className='flex flex-col max-w-[45%] w-full'>
                <div className="text-5xl font-bold flex justify-center mb-10">Select Team</div>
                <div className="border rounded-4xl bg-gray-400 w-full flex justify-self-center max-h-120 h-full px-10 py-5">
                    <div className='flex flex-col gap-5 justify-content-start overflow-y-scroll max-h-100 h-full w-full'>
                        {Array.isArray(userTeam) && userTeam.length > 0 ? (
                            userTeam.map((team: any) => (
                                <div key={team.TeamID} className="flex self-center flex-row justify-between w-full p-3 bg-gray-600 rounded-2xl">
                                    <div className='self-center'>
                                        {team.TeamName ?? "Unknown"}
                                    </div>
                                    <div className='self-center'>
                                        <User />
                                    </div>
                                    <div className=" self-center">
                                        {team.MemberCount > 1 ? team.MemberCount + " Members" : team.MemberCount === 1 ? "1 Member" : "0 Members"}
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <button className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl" onClick={() => router.push(`/dashboard/teams/${team.TeamID}`)}>View Team</button>
                                        <div className='self-center text-xs'>
                                            {team.SupervisorFirstname ?? "Unknown"} {team.SupervisorLastname ?? "Unknown"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div> No Teams found. </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='flex flex-col justify-start max-w-[45%] w-full h-full'>
                <div className="text-5xl font-bold  mb-10 self-center">Team Invites</div>
                <div className='border rounded-4xl bg-gray-400 w-full flex max-h-205 h-full px-5 py-5'>
                    {Array.isArray(userInvites) && userInvites.length > 0 ? (
                        userInvites.map((invite: any) => (
                            <div key={invite.InviteID} className="flex self-center flex-row justify-between w-full p-3 bg-gray-600 rounded-2xl">
                                <div>{invite.TeamName}</div>
                                <div className='text-green-700 hover:text-green-500 hover:cursor-pointer' onClick={() => updateInvite("Accepted", invite.InviteID)}>
                                    <Check />
                                </div>
                                <div className='text-red-900 hover:text-red-600 hover:cursor-pointer' onClick={() => updateInvite("Denied", invite.InviteID)}>
                                    <X />
                                </div>
                                <div>{(`${invite.SupervisorFirstname} ${invite.SupervisorLastname}`) || "Unknown"}</div>
                            </div>
                        ))
                    ) : (
                        <div className='items-center'> No Invites found. </div>
                    )}
                </div>
            </div>
        </div >
    )

    async function fetchUserTeams() {
        try {
            const { data } = await supabase.auth.getSession();
            const access_token = data?.session?.access_token;

            const res = await fetch("/api/account/fetchuserteams", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${access_token}`
                },
            });

            if (!res.ok) {
                console.log("Error fetching user teams:", res)
            }

            const response = await res.json();

            console.log("response:", response);

            return response.data;

        }
        catch (error) {
            console.log("Error fetching user teams:", error);
        }
    }

    async function fetchUserInvites() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        const res = await fetch("/api/invites/fetchuserinvites", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
        });

        if (!res.ok) {
            console.log("Error fetching user teams:", res)
        }

        const response = await res.json();

        return response.data;
    }

    async function updateInvite(newStatus: String, inviteID: String) {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        const res = await fetch("/api/invites/updateuserinvites", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                newStatus: newStatus,
                InviteID: inviteID,
            })
        });

        if (!res.ok) {
            console.log("Error updating Invite", res.status, res.statusText)
        }
        const result = await res.json();

        if (result) {
            userInfo();
        }

        console.log("result: ", result);
    }
}