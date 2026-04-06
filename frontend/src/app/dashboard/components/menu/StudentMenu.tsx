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
    return (
        <div className='flex p-10 bg-gray-600 rounded-4xl'>
            <div>
                <div className="text-5xl font-bold justify-self-center">Select Team</div>
                <div className="m-10 p-20 border rounded-4xl bg-gray-400">
                    {Array.isArray(userTeam) && userTeam.length > 0 ? (
                        userTeam.map((team: any) => (
                            <div key={team.TeamID} className="flex justify-between p-3 bg-gray-600 rounded-2xl">
                                <div>{team.TeamName}</div>
                                <div><User/>{team.MemberCount + "Members" || team.MemberCount === 1 ? "1 Member" : "0 Members"}</div>
                                <div>{team.SupervisorFirstname} {team.SupervisorLastname}</div>
                                <button onClick={() => router.push(`/dashboard/teams/${team.TeamID}`)}>View Team</button>
                            </div>
                        ))
                    ) : (
                        <div> No Teams found. </div>
                    )}
                </div>
            </div>

            <div>
                <div>
                    <div className="text-5xl font-bold justify-self-center">Team Invites</div>
                    {Array.isArray(userInvites) && userInvites.length > 0 ? (
                        userInvites.map((invite: any) => (
                            <div key={invite.InviteID} className={"flex justify-between p-3 bg-gray-600 rounded-2xl"}>
                                <div>{invite.TeamName}</div>
                                <div className='text-green-700 hover:text-green-500 hover:cursor-pointer' onClick={() => updateInvite("Accepted", invite.InviteID)}><Check /></div>
                                <div className='text-red-900 hover:text-red-600 hover:cursor-pointer' onClick={() => updateInvite("Denied", invite.InviteID)}><X /></div>
                                <div>{(`${invite.SupervisorFirstname} ${invite.SupervisorLastname}`) || "Unknown"}</div>
                            </div>
                        ))
                    ) : (
                        <div> No Invites found. </div>
                    )}
                </div>
            </div>
        </div >
    )

    async function fetchUserTeams() {
        try {
            const { data } = await supabase.auth.getSession();
            const access_token = data?.session?.access_token;

            const res = await fetch("/api/user/fetchuserteams", {
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
        const res = await fetch("/api/user/fetchuserinvites", {
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
        const res = await fetch("/api/user/updateuserinvites", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer: ${access_token}`
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