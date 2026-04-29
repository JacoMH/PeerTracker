"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { SupervisorTeam } from "@/interfaces/SupervisorTeam";
import { supabase } from "@/lib/supabase";
import { FadeLoader } from "react-spinners";

export default function settings() {
    const [role, setRole] = useState("");
    const router = useRouter();
    const [supervisorTeams, setSupervisorTeams] = useState<SupervisorTeam[]>([]);
    const [info, setInfo] = useState("");

    //On load
    useEffect(() => {
        const fetchRole = async () => {
            const { data } = await supabase.auth.getSession();
            const userRole = await FetchUserRole(data.session?.user.id ?? null);
            setRole(userRole || "Unknown");
            console.log("User Role:", userRole);
            if (userRole === "Unknown") {
                router.push("/auth/login");
            }

            if (userRole === "Supervisor") {
                fetchSupervisorTeams();
            }
        }
        fetchRole();
    }, [])

    // Error message timer for 5 seconds
    useEffect(() => {
        if (info) {
            const timer = setTimeout(() => {
                setInfo('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [info])


    useEffect(() => {
        console.log("Supervisor Teams: ", supervisorTeams);
    }, [supervisorTeams])

    return (
        role === "Student" ? (
            <main className="bg-gray-200 flex flex-col items-center justify-center h-screen  rounded-4xl text-white ">
                <div className="flex justify-center flex-col items-center place-content-center h-screen max-h-40 bg-gray-600 p-20 rounded-2xl">
                    <div className="text-5xl font-bold  mb-10 self-center">Student Settings</div>
                    <div className="flex gap-2">
                        <button onClick={() => resetPassword()} className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl ">
                            Reset Password
                        </button>

                        <button onClick={() => DeleteAccount()} className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl ">
                            Delete account
                        </button>
                    </div>
                    <div className="text-center text-white">{info}</div>
                </div>
                <button className="flex place-self-center p-3 mt-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={() => router.back()} >Back</button>
            </main>
        ) : role === "Supervisor" ? (
            <main className="bg-gray-200 flex flex-col items-center justify-center h-screen  rounded-4xl gap-5 text-white">

                <div className="flex justify-center flex-col items-center place-content-center h-screen max-h-120 bg-gray-600 p-20 rounded-2xl">
                    <div className="text-4xl font-bold  mb-5 self-start">Supervisor Settings</div>

                    <div className="flex gap-2">
                        <button onClick={() => resetPassword()} className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl ">
                            Reset Password
                        </button>

                        <button onClick={() => DeleteAccount()} className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl ">
                            Delete account
                        </button>
                    </div>


                    {/* Supervisors Teams */}
                    <div className="bg-gray-300 w-full h-full overflow-y-auto p-3 rounded-2xl mt-5 ">
                        {Array.isArray(supervisorTeams) && supervisorTeams.length > 0 ? (
                            supervisorTeams.map((teams: SupervisorTeam) => (
                                <div key={teams.TeamID} className="flex self-center flex-row justify-between w-full p-3 bg-gray-600 rounded-2xl ">
                                    <div>
                                        <div className="self-center">{teams.TeamName}</div>
                                        <div className='self-center'>{teams.StudentCount > 1 ? teams.StudentCount + " Students" : teams.StudentCount === 1 ? "1 Students" : "0 Students"}</div>

                                    </div>
                                    <button className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl" onClick={() => deleteTeam(teams.TeamID)}>
                                        Delete Team
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-black">
                                No Teams
                            </div>
                        )
                        }
                    </div>
                    <div className="text-center text-white">{info}</div>
                </div>
                <button className="flex place-self-center p-3 mt-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={() => router.back()} >
                    Back
                </button>
            </main>
        ) : (
            <div className="flex justify-center w-full h-screen items-center">
                <FadeLoader color="#060606" speedMultiplier={2} />
            </div>
        )
    )

    async function resetPassword() {
        const { data } = await supabase.auth.getSession();
        const email = data?.session?.user?.email;

        //reset password in supabase auth
        if (email) {
            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/dashboard/resetpassword`,
            })
        }
        else {
            console.log("failed to reset password")
        }
        setInfo("Password Reset Link Sent To Your Email")
    }

    async function DeleteAccount() {
        const { data } = await supabase.auth.getSession();
        const access_token = data.session?.access_token;
        const userID = data.session?.user?.id;

        //delete from db first
        const res = await fetch(`/api/account/deleteAccount`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error deleting :", res)
        }

        //redirect
        router.push("/auth/login");
    }

    async function fetchSupervisorTeams() {
        const { data } = await supabase.auth.getSession();
        const access_token = data.session?.access_token;

        const res = await fetch(`/api/supervisor/fetchsupervisorteams`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error deleting :", res)
        }

        const response = await res.json();

        setSupervisorTeams(response.data);

    }

    async function deleteTeam(TeamID: string) {
        const { data } = await supabase.auth.getSession();
        const access_token = data.session?.access_token;
        const userID = data.session?.user?.id;

        const res = await fetch(`/api/account/deleteTeam`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                TeamID: TeamID
            })
        });

        if (!res.ok) {
            console.log("Error deleting :", res)
        }

        fetchSupervisorTeams();
    }
}