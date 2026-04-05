"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";

export default function settings() {
    const [role, setRole] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchRole = async () => {
            const userRole = await FetchUserRole();
            setRole(userRole || "Unknown");
            console.log("User Role:", userRole);
            if (userRole === "Unknown") {
                router.push("/auth/login");
            }
        }
        fetchRole();
    }, [])

    return (
        role === "Student" ? (
            <main>
                Student Settings
            </main>
        ) : role === "Supervisor" ? (
            <main>
                Supervisor Settings
            </main>
        ) : (
            <div>
                Loading...
            </div>
        )
    )
}