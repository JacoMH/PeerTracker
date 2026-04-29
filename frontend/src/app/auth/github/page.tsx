"use client";
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";
import { useState } from 'react';

export default function github() {
    const SearchParams = useSearchParams()
    const router = useRouter();
    const [error, setError] = useState("");

    const stateParam = SearchParams.get("state");

    if (stateParam === null || stateParam.length < 1) {
        console.log("State param is empty");
    }

    const state = stateParam?.split(' ')[0];
    const TeamID = stateParam?.split(' ')[1];

    //console.log("state param", state);
    //console.log("Team ID", TeamID);

    const code = SearchParams.get("code");

    const fetchGithubToken = async () => {
        //https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591
        // Get access token from session
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        const redirect_uri = `${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/auth/github`; // Where github redirects on response
      //  console.log("state_parameter:", state, "code_parameter:", code);

        // server side to recieve access_token and also store in db
        if (state === sessionStorage.getItem("latestCSRFToken")) {
            const res = await fetch("/api/auth/github/connectgithub", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
                    code: code,
                    redirect_uri: redirect_uri
                })
            })

            const response = await res.json();
            if (!res.ok) {
              //  console.log("Error connecting github:", res)
                if (response.message) {
                    setError("Another user has connected this Github account")
                }
            }

         //   console.log("response:", response);

            //redirects back using teamID
            router.push(`/dashboard/teams/${TeamID}`);
            return response.data;
        }
    }

    useEffect(() => {
        fetchGithubToken();
    }, [])
    return (
        <div className='flex items-center justify-center rounded-4xl text-black p-10'>
            Authorizing connection...

            <div className='text-red-400'>{error}</div>
        </div>
    )
}