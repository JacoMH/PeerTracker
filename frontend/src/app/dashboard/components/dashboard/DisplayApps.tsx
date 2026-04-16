//Displays the links to the places where the info is getting taken from, formatted like google drive
import github from "@/app/auth/github/page";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

interface Props {
    TeamID: String;
}

export default function DisplayApps({TeamID}: Props) {
    const [githubRepo, setGithubRepo] = useState([]);

    useEffect(() => {
        FetchGithubRepo()
    }, [])
    return (
        <div>
            isajdosijdaoisjd
            {Array.isArray(githubRepo) && githubRepo.length > 0 ? (
                userTeam.map((team: any) => {
                    
                }
                <div>
                    <div>
                        <span></span>
                    </div>
                </div>
            ) : (
                <div>
                    empty
                </div>
            )
       
            }
        </div>
    )




    //fetchgithubrepo
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

        setGithubRepo(response);

        console.log("response: ", response);
    }
}