"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function settings() {
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchRole = async () => {
            const { data } = await supabase.auth.getSession();
            const userid = data?.session?.user.id;
            if (userid) {
                const userRole = await FetchUserRole(userid);
                setRole(userRole || "Unknown");
                console.log("User Role:", userRole);
                if (userRole === "Unknown") {
                    router.push("/auth/login");
                }
            }
        }
        fetchRole();
    }, [])

    return (
        <form onSubmit={(e) => { e.preventDefault(); resetPassword() }}>
            <input type='password' onChange={(e) => setPassword(e.target.value)}></input>
            <input type='password' onChange={(e) => setConfirmPassword(e.target.value)}></input>
            <button>Submit new password</button>
        </form>
    )


    async function resetPassword() {
        if (password === confirmpassword) {
            await supabase.auth.updateUser({ password: password })
        }

        router.push(`dashboard/settings`)
    }
}