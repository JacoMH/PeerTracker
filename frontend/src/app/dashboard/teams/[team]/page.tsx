"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation'
import { supabase } from "@/lib/supabase";

// Student modules
import StudentMenu from "@/app/dashboard/components/menu/StudentMenu";
import SupervisorMenu from "@/app/dashboard/components/menu/SupervisorMenu";
import ConnectGithub from "@/app/sharedComponents/ConnectGithub";

export default function DashboardPage() {
    const [role, setRole] = useState<String | null>(null);
    const [TeamID, setTeamID] = useState<String>("");
    const [toggleGithubIntegration, setToggleGithubIntegration] = useState<boolean>(false);
    const router = useRouter();
    const params = useParams();

    // Check to see if the account already has a github auth connection
    useEffect(() => {
        const fetchRole = async () => {
            const userRole = await FetchUserRole();
            setRole(userRole);
            console.log("User Role:", userRole);
            if (userRole === null) {
                router.push("/auth/login");
            }
        }

        const setTeam = async () => {
            setTeamID(params.team as String);
        }
        fetchRole();
        setTeam();
        checkgithubintegration();
    }, [])
    return (
        role === "Student" ? (
            <main>
                <section className='flex items-center justify-center h-screen'>
                    {/*Dashboard for student*/}
                    {/* connect your Github window*/}
                    {!toggleGithubIntegration ? (
                        <ConnectGithub />

                    ) : (
                        <div>
                            {/* put teamID into all the modules to get the right data */}
                        </div>
                    )
                    }
                </section>
            </main>
        ) : role === "Supervisor" ? (
            <main>
                <section>
                    {/*Dashboard for supervisor*/}
                    {/* Connect your github window */}
                    <ConnectGithub />
                    {
                        !toggleGithubIntegration ? (
                            <ConnectGithub />
                        ) : (
                            <div>
                                {/* put teamID into all the modules to get the right data */}
                            </div>
                        )
                    }
                </section>
            </main>
        ) : (
            <div>
                Loading...
            </div>
        )
    )

    async function checkgithubintegration() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        //check if the user has an integrated github account

        const res = await fetch(`/api/auth/github/verifygithub`, {
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

        if (response.message === "Successful verification") {
            setToggleGithubIntegration(true);
        }
        console.log("response: ", response);
    }
}

