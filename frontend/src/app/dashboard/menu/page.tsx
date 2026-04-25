"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase'

// Student modules
import StudentMenu from "@/app/dashboard/components/menu/StudentMenu";
import SupervisorMenu from "@/app/dashboard/components/menu/SupervisorMenu";
import { FadeLoader } from "react-spinners";


export default function DashboardMenu() {
    const [role, setRole] = useState<String | null>(null);
    const [gdpragreement, setGDPRAgreement] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const fetchRole = async () => {
            await fetchUser();
            const { data } = await supabase.auth.getSession();
            if (data.session?.user.id) {
                console.log("datasessionuserid: ", data.session?.user.id)
                const userRole = await FetchUserRole(data.session?.user.id);
                setRole(userRole);
                console.log("User Role:", userRole);
                fetchUser();
                if (userRole === null) {
                    router.push("/auth/login");
                }
            }
        }
        fetchRole();
        //
    }, [])

    useEffect(() => {
        console.log("gdpragreement: ", gdpragreement);
    }, [gdpragreement])


    return (
        role === "Student" ? (
            gdpragreement ? (
                <main className="bg-gray-200" >
                    <section className='flex flex-col items-center justify-center h-screen  rounded-4xl '>
                        {/*Menu for student teams and invites here*/}
                        <StudentMenu />
                        <div className="flex flex-row gap-2">
                            <button className="flex place-self-center p-3 mt-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={LogOut} >
                                Log Out
                            </button>
                            <button className="flex place-self-center p-3 mt-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={() => router.push('/dashboard/settings')} >
                                Settings
                            </button>
                        </div>
                    </section>
                </main>
            ) : (
                <div className='flex flex-col items-center justify-center h-screen  rounded-4xl'>
                    <div className='bg-gray-600 flex items-center flex-col p-5 justify-between w-full max-w-200 text-white h-full max-h-70 rounded-2xl'>
                        GDPR Statement Here
                        <button onClick={() => GDPRAgreement()}>
                            Agree
                        </button>
                    </div>
                </div>
            )
        ) : role === "Supervisor" ? (
            gdpragreement ? (
                <main className='bg-gray-200'>
                    <section className='flex flex-col items-center justify-center h-screen  rounded-4xl '>
                        {/*Menu for supervisor teams and create teams here*/}
                        <SupervisorMenu />
                        <div className="flex flex-row gap-2">
                            <button className="flex place-self-center p-3 mt-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={LogOut} >
                                Log Out
                            </button>
                            <button className="flex place-self-center p-3 mt-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black" onClick={() => router.push('/dashboard/settings')} >
                                Settings
                            </button>
                        </div>
                    </section>
                </main>
            ) : (
                <div className='flex flex-col items-center justify-center h-screen  rounded-4xl'>
                    <div className='bg-gray-600 flex items-center flex-col p-5 justify-between w-full max-w-200 text-white h-full max-h-70 rounded-2xl'>
                        <div>GDPR Statement Here</div>
                        <button onClick={() => GDPRAgreement()} className="hover:bg-gray-400 flex max-w-30 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl">
                            Agree
                        </button>
                    </div>
                </div>
            )
        ) : (
            <div className="flex justify-center w-full h-screen items-center">
                <FadeLoader color="#060606" speedMultiplier={2} />
            </div>
        )
    )

    async function LogOut() {
        const { error } = await supabase.auth.signOut()
        router.push('/auth/login/')
        if (error) {
            console.log("error signing out: ", error)
        }
    }

    async function fetchUser() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/account/fetchuser?UserID=${data.session?.user.id}`, {
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

        console.log("userid: sdasdasd", response);

        setGDPRAgreement(response.data[0].GDPR_Agreement);
    }

    async function GDPRAgreement() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/account/gdpragreement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching GDPR Agreement:", res)
        }
        else {
            setGDPRAgreement(true);
        }
    }
}

