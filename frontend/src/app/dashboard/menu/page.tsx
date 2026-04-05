"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";

// Student modules
import StudentMenu from "@/app/dashboard/components/menu/StudentMenu";
import SupervisorMenu from "@/app/dashboard/components/menu/SupervisorMenu";


export default function DashboardMenu() {
    const [role, setRole] = useState<String | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchRole = async () => {
            const userRole = await FetchUserRole();
            setRole(userRole);
            console.log("User Role:", userRole);
            if (userRole === null) {
                router.push("/auth/login");
            }
        }
        fetchRole();
    }, [])

    
    return (
        role === "Student" ? (
            <main>
                <section className='flex items-center justify-center h-screen'>
                    {/*Menu for student teams and invites here*/}
                    <StudentMenu/>
                </section>
            </main>
        ) : role === "Supervisor" ? (
            <main>
                <section>
                    {/*Menu for supervisor teams and create teams here*/}
                    <SupervisorMenu/>
                </section>
            </main>
        ) : (
            <div>
                Loading...
            </div>
        )
    )
}

