"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { parseMaxPostponedStateSize } from "next/dist/server/config-shared";

export default function settings() {
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    // Error message timer for 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error])


    //Check Info
    useEffect(() => {
        const fetchInfo = async () => {
            const { data } = await supabase.auth.getSession();
            const userid = data?.session?.user.id;
            if (userid) {
                const userRole = await FetchUserRole(userid);
                console.log("User Role:", userRole);
                if (userRole === "Unknown") {
                    router.push("/auth/login");
                }
            }
        }
        fetchInfo();
    }, [])

    return (
        <main className="bg-gray-200 flex flex-col items-center justify-center h-screen  rounded-4xl gap-5">
            <form onSubmit={(e) => { e.preventDefault(); resetPassword() }} className="flex flex-col gap-5 p-15 bg-gray-600 rounded-2xl ">
                <div className="text-5xl mb-10 self-center text-white">Reset Password</div>
                <input type='password' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center"
                    onChange={(e) => setPassword(e.target.value)} placeholder="Enter New Password..."></input>
                <input type='password' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center"
                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password..."></input>
                <button className="hover:bg-gray-400 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl ">Submit new password</button>
                <div className="text-red-600 text-center">{error}</div>
            </form>
        </main>
    )


    async function resetPassword() {
        if (password === confirmpassword) {
            const { error } = await supabase.auth.updateUser({
                password: password
            })
            if (error) {
                console.log("error updating password: ", error);
            }
            router.push(`/auth/login`)

        }
        else {
            setError("Passwords do not match");
        }
    }
}