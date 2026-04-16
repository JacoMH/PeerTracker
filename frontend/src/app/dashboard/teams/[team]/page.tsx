"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation'
import { supabase } from "@/lib/supabase";

// Modules
import ConnectGithub from "@/app/sharedComponents/ConnectGithub";
import DisplayApps from "@/app/dashboard/components/dashboard/DisplayApps"

// Student Modules
import ChooseGithubRepo from '@/app/dashboard/components/dashboard/chooseGithubRepo'

// Supervisor Modules

export default function DashboardPage() {
    const [role, setRole] = useState<String | null>(null);
    const [TeamID, setTeamID] = useState<String>("");     //export const so it can be used for redirect when coming hack from github auth page
    const [toggleGithubIntegration, setToggleGithubIntegration] = useState<boolean>(false);
    const [toggleGithubRepo, setToggleGithubRepo] = useState<boolean>(false); //toggles on when the team has github repos
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

    function handleGithubRepoResponse(response: boolean) {
        setToggleGithubRepo(response);
    }

    useEffect(() => {
        if (toggleGithubIntegration === true) {
            // fetch if there is a github repo already assigned to the team
            FetchGithubRepo();
        }
    }, [toggleGithubIntegration])
    return (
        role === "Student" ? (
            <main>
                <section className='flex items-center justify-center h-screen'>
                    {/*Dashboard for student*/}
                    {/* connect your Github window*/}
                    {!toggleGithubIntegration ? (
                        <ConnectGithub TeamID={TeamID} /> // Pass TeamID to connectgithub to help with redirect https://www.youtube.com/watch?v=s6DGVtkX9R0
                    ) : (
                        <div>
                            {
                                toggleGithubRepo ? (
                                    <div>
                                        {/* all the main stuff goes here, put teamID into all the modules to get the right data */}
                                        github repo exists
                                        <DisplayApps TeamID={TeamID} />
                                    </div>
                                ) : (
                                    <div>
                                        {/* link here to module that allows user to select github repo for the team */}
                                        no github repo
                                        <ChooseGithubRepo TeamID={TeamID} response={handleGithubRepoResponse}/>
                                    </div>
                                )
                            }
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
                    {!toggleGithubIntegration ? (
                        <ConnectGithub TeamID={TeamID} />
                    ) : (
                        <div>
                            {
                                toggleGithubRepo ? (
                                    <div>
                                        modules here
                                    </div>
                                ) : (
                                    <div>
                                        {/* supervisor modules here, put teamid in for correct data */}
                                        no github repo for modules
                                    </div>
                                )
                            }
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

    async function FetchGithubRepo() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/auth/github/fetchgithubrepo?TeamID=${TeamID}`, {
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

        if (response.message === "Github Repos Exist") {
            setToggleGithubRepo(true);
        }
        console.log("response: ", response);
    }
}

