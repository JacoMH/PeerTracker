"use client";
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";

export default function github() {
    const params = useSearchParams()
    const router = useRouter();

    console.log("parameters", params.values());

    const state = params.get("state");
    const code = params.get("code");

    const fetchGithubToken = async () => {

        // Get access token from session
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        const redirect_uri = `${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/auth/github`; // Where github redirects on response
        console.log("state_parameter:", state, "code_parameter:", code);

        // server side to recieve access_token and also store in db
        if (state === sessionStorage.getItem("latestCSRFToken")) {
            const res = await fetch("/api/github", {
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

            if (!res.ok) {
                console.log("Error fetching user teams:", res)
            }

            const response = await res.json();

            console.log("response:", response);

            //need a way to redirect back to the page and refresh it too
            router.back();
            return response.data;
        }
    }

    useEffect(() => {
        fetchGithubToken();
    }, [])
    return (
        <div>
            Authorizing connection...
        </div>
    )
}