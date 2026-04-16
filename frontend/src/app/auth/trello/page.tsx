"use client";
import { useSearchParams, useParams } from 'next/navigation'
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";

export default function github() {
    const SearchParams = useSearchParams()
    const router = useRouter();

    console.log("parameters", Array.from(SearchParams.values()));
    
    const TeamID = SearchParams.get("TeamID");
    console.log("TeamID", TeamID)

    useEffect(() => {
        getTrello();
    }, [])

    return (
        <div>
            Authorizing connection...
        </div>
    )

    async function getTrello() {

        // Get access token from session
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        // server side to recieve access_token and also store in db


        const trello_token = window.location.hash.split("=")[1]; // Source - https://stackoverflow.com/a/29934700
        
        // Posted by Downgoat, modified by community. See post 'Timeline' for change history
        // Retrieved 2026-04-09, License - CC BY-SA 4.0

        const res = await fetch("/api/auth/trello/connecttrello", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                token: trello_token
            })
        })

        if (!res.ok) {
            console.log("Error fetching user teams:", res)
        }

        const response = await res.json();

        console.log("response:", response);

        //redirects back using teamID
        router.push(`/dashboard/teams/${TeamID}`);
        return response.data;

    }
}