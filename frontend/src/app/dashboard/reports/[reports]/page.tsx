"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";


// Modules
import SupervisorReports from '@/app/dashboard/components/dashboard/supervisor/SupervisorReports'
import StudentSupervisorReports from '@/app/dashboard/components/dashboard/student/StudentSupervisorReports'
import SupervisorColumn from "../../components/dashboard/supervisor/SupervisorColumn";
import StudentColumn from "../../components/dashboard/student/StudentColumn";
import ReportUser from "../../components/reportuser/ReportUser";
import { FadeLoader } from "react-spinners";

export default function reports() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [role, setRole] = useState("");
    const router = useRouter();
    const [RepoID, setRepoID] = useState("");
    const [BoardID, setBoardID] = useState("");
    const [userIDForReport, setUserIDForReport] = useState<string | null>(null);
    const [typeForReport, setTypeForReport] = useState("");


    const TeamID = params.reports as string;

    console.log("TeamID: ", TeamID);
    useEffect(() => {
        const fetchRole = async () => {
            const { data } = await supabase.auth.getSession();
            const userRole = await FetchUserRole(data.session?.user.id ?? null);
            setRole(userRole || "Unknown");
            console.log("User Role:", userRole);
            if (userRole === "Unknown") {
                router.push("/auth/login");
            }
        }
        fetchRole();

        const fetchRepoAndBoard = async () => {
            await getRepo();
            await getBoard();
        }
        fetchRepoAndBoard();
    }, [])

    function reportModalMenu(response: string, type: string) {
        console.log("made it to the modal: ", response, type);
        setUserIDForReport(response);
        setTypeForReport(type);
    }

    function closeWindow() {
        setUserIDForReport(null);
    }

    return (
        RepoID === "" || BoardID === "" ? (
            <div className="flex justify-center w-full h-screen items-center">
                <FadeLoader color="#060606" />
            </div>
        ) : (
            role === "Student" ? (
                <main className="bg-gray-200 justify-center flex flex-row w-full h-screen">
                    <div className="flex flex-col p-4 w-[30%] h-full bg-gray-400 rounded-sm">
                        <StudentColumn TeamID={TeamID} ReportModal={reportModalMenu} />
                    </div>

                    <div className="flex flex-col min-h-screen w-full justify-center h-screen rounded-4xl items-center">
                        <StudentSupervisorReports TeamID={TeamID} RepoID={RepoID} BoardID={BoardID} />
                    </div>
                    {
                        userIDForReport ? (
                            <div className="z-150 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                <div className='bg-gray-400 p-10 rounded-2xl max-w-200 m-2'>
                                    <ReportUser UserID={userIDForReport} TeamID={TeamID} closeWindow={closeWindow} />
                                </div>
                                <div className="z-100 absolute w-full flex justify-end place-self-start">
                                    <button className="flex h-[45%] hover:cursor-pointer" onClick={() => setUserIDForReport(null)}>
                                        <X size={40} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>

                            </div>
                        )
                    }
                </main>
            ) : role === "Supervisor" ? (
                <main className="bg-gray-200 justify-center flex flex-row w-full h-screen">
                    <div className="flex flex-col p-4 w-[30%] h-full bg-gray-400 rounded-sm">
                        <SupervisorColumn TeamID={TeamID} ReportModal={reportModalMenu} />
                    </div>
                    <div className="flex flex-col min-h-screen w-full justify-center h-screen rounded-4xl items-center">
                        <SupervisorReports TeamID={TeamID} RepoID={RepoID} BoardID={BoardID} />
                    </div>
                    {
                        userIDForReport ? (
                            <div className="z-150 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                <div className='bg-gray-400 p-10 rounded-2xl max-w-200 m-2'>
                                    <ReportUser UserID={userIDForReport} TeamID={TeamID} closeWindow={closeWindow} />
                                </div>
                                <div className="z-100 absolute w-full flex justify-end place-self-start">
                                    <button className="flex h-[45%] hover:cursor-pointer" onClick={() => setUserIDForReport(null)}>
                                        <X size={40} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>

                            </div>
                        )
                    }
                </main>
            ) : (
                <div className="flex justify-center w-full h-screen items-center">
                    <FadeLoader color="#060606" />
                </div>
            )
        )
    )


    async function getBoard() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        console.log("start of trello");


        const res = await fetch(`/api/auth/trello/fetchtrelloboard?TeamID=${TeamID}`, {
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

        if (response.message === "Trello Board Exists") {
            console.log("here made it too")
            console.log("BOARD URL HERE: :::::", response.data[0].BoardUrl);

            setBoardID(response.data[0].BoardID)
        }
    }


    async function getRepo() {
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

        if (response.message === "Github Repos Exist") {
            console.log("REPO URL HERE: :::::", response.data[0].RepoUrl);
            setRepoID(response.data[0].RepoID)
        }
    }
}