import { supabase } from "@/lib/supabase";

export async function FetchUserRole(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    
    // Checks if there is no session
    if (!data?.session) {
        console.log("No session found");
        return null;
    }

    const access_token = data?.session?.access_token;

    if (data?.session) {
        // backend api call for fetching user info
        try {
            const res = await fetch("/api/user/fetchuser", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${access_token}`
                }
            });
            if (!res.ok) {
                console.log("Error fetching user:", res)
                return null;
            }
            const response = await res.json();
            
            // get role from the response
            const responseUserRole = response.data[0].Role;

            return responseUserRole;

        }
        catch (error) {
            console.log("Error fetching user:", error);
            return null;
        }
    }

    return null;
}