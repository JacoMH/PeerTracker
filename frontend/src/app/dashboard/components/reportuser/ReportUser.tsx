"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FadeLoader } from "react-spinners";


interface Props {
    UserID: string | null,
    TeamID: String | null,
    closeWindow: (response: void) => void;
}


export default function ReportUser({ UserID, TeamID, closeWindow }: Props) {
    const [role, setRole] = useState("");
    const router = useRouter();
    const [user, setUser] = useState<any[]>([]);
    const [teamName, setTeamName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("")

    console.log("TeamID: ", TeamID);
    useEffect(() => {
        const fetchInfo = async () => {
            const { data } = await supabase.auth.getSession();
            const userRole = await FetchUserRole(data.session?.user.id ?? null);
            await fetchTeamName();
            setRole(userRole || "Unknown");
            console.log("User Role:", userRole);
            if (userRole === "Unknown") {
                router.push("/auth/login");
            }
            await fetchUser();
        }
        fetchInfo();
    }, [])

    useEffect(() => {
        console.log("TeamName: ", teamName)
    }, [teamName])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error])

    return (
        role === "Student" ? (
            <main >
                <div>
                    {
                        Array.isArray(user) && user.length > 0 ? (
                            user.map((user: any) => (
                                <form key={user.UserID} onSubmit={(e) => { e.preventDefault(); reportUser(TeamID, user.UserID, description, "Supervisor") }}>
                                    <div>
                                        <div className="">Role: {user.Role}</div>
                                        <div>{user.FirstName} {user.LastName}</div>
                                        <div>In Team: {teamName}</div>
                                        <div>Report Description: </div>
                                        <input type='text' name='description' className="p-2 bg-gray-600 rounded-2xl text-white flex justify-center" value={description} onChange={(e) => setDescription(e.target.value)} />
                                        <input type="Submit" />
                                    </div>
                                </form>
                            ))
                        ) : (
                            <div>
                                No User
                            </div>
                        )
                    }
                    <div className="text-red-500 flex justify-center">{error}</div>
                </div>
            </main>
        ) : role === "Supervisor" ? (
            <main>
                {
                    Array.isArray(user) && user.length > 0 ? (
                        user.map((user: any) => (
                            <form key={user.UserID} className="flex flex-col p-5 gap-2" onSubmit={(e) => { e.preventDefault(); reportUser(TeamID, user.UserID, description, "Student") }}>
                                <div >Role: {user.Role}</div>
                                <div>{user.FirstName} {user.LastName}</div>
                                <div>In Team: {teamName}</div>
                                <div>Report Description: </div>
                                <input type='text' name='description' className="p-2 bg-gray-600 rounded-2xl text-white flex justify-center" value={description} onChange={(e) => setDescription(e.target.value)} />
                                <input type="Submit" />
                            </form>
                        ))
                    ) : (
                        <div>
                            No User
                        </div>
                    )
                }
            </main>
        ) : (
            <div>
                <FadeLoader color="#060606" />
            </div>
        )
    )

    async function fetchUser() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/account/fetchuser?UserID=${UserID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching user info:", res)
        }

        const response = await res.json();

        setUser(response.data);
    }

    async function fetchTeamName() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/account/teamname?TeamID=${TeamID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching team name:", res)
        }

        const response = await res.json();

        console.log("Team: ", response);

        setTeamName(response.data[0].name)
    }

    async function reportUser(teamid: any, userid: any, description: any, type: any) {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        console.log("UserID: ", UserID, "teamid", TeamID, "description", description);
        const res = await fetch(`/api/account/reportUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                TeamID: teamid,
                UserID: userid,
                Description: description,
                Type: type
            })
        });

        if (!res.ok) {
            console.log("Error reporting user:", res)
        }

        const result = await res.json();

        if (result.message !== "Report made successfully") {
            setError("Report Unsuccessful")
        }

        closeWindow();
    }
}