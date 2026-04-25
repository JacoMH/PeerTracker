"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { UserRoundIcon } from "lucide-react";
import { FaTrello, FaGithub } from 'react-icons/fa'
import { PiStudent } from "react-icons/pi";
import { AiOutlineTeam } from "react-icons/ai";
import { X } from "lucide-react";

interface Props {
    TeamID: String;
    ReportModal: (response: string, type: string) => void;
}


export default function StudentColumn({ TeamID, ReportModal }: Props) {
    const [StudentData, setStudentData] = useState([]);
    const [TeamData, SetTeamData] = useState([]);
    const [TeamName, setTeamName] = useState("");
    const [Notifications, setNotifications] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const getInfo = async () => {
            const { data } = await supabase.auth.getSession();
            const access_token = data?.session?.access_token;
            await fetchallaccount();
            await fetchteaminfo();
            await getTeamName();
            if (data.session?.user.id) {
                await getStudentNotifications()
            }
        }
        getInfo();
    }, [])

    useEffect(() => {
        console.log("TeamData: ", TeamData);
    }, [TeamData])

    return (
        <>
            {
                Array.isArray(StudentData) && StudentData.length > 0 ? (
                    StudentData.map((Student: any) => (
                        <div key={Student.UserID}>
                            <span className="flex justify-center text-xl font-bold max-h-20">User</span>
                            <div className="m-1 p-3 rounded-2xl bg-gray-200 flex flex-col gap-1">
                                <div className="flex flex-row text-xl items-center gap-2"><AiOutlineTeam size={25} className="items-center flex" />{TeamName}</div>
                                <div className="flex flex-row text-xl items-center gap-2"><PiStudent size={25} className="items-center flex" />{Student.Role}</div>
                            </div>


                            <div className="flex m-1 p-3 flex-col gap-1">
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer hover:text-gray-200 hover:bg-gray-600 bg-gray-200 p-3"
                                    onClick={() => router.push(`/dashboard/teams/${TeamID}`)}>Dashboard</button>
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer bg-gray-200 hover:text-gray-200 hover:bg-gray-600 p-3"
                                    onClick={() => router.push(`/dashboard/reports/${TeamID}?UserID=${Student.UserID}`)}>Supervisor Reports</button>
                            </div>

                            <span className="flex justify-center mt-2 text-xl font-bold">Tool Accounts</span>
                            <div className="m-1 p-3 rounded-2xl bg-gray-200 flex flex-col gap-1">
                                <div className="flex flex-row text-xl items-center gap-5"><FaTrello size={20} className="items-center flex" />
                                    {Student.TrelloUsername}</div>
                                <div className="flex flex-row text-xl items-center gap-5"><FaGithub size={20} className="items-center flex" />
                                    {Student.GithubUsername}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="m-1 p-2 rounded-2xl bg-gray-200 text-center text-xl">
                        Information Unavailable
                    </div>
                )

            }

            <section>
                <span className="flex justify-center mt-5 text-xl font-bold">Notifications</span>
                <div className="m-1 p-2 rounded-2xl bg-gray-200 overflow-y-scroll max-h-25 h-full">
                    {
                        Array.isArray(Notifications) && Notifications.length > 0 ? (
                            Notifications.map((notification: any) => (
                                <div key={notification.ReportID}>
                                    <div className="flex justify-between gap-2">
                                        <div className="flex flex-row">
                                            <button type='button' className='z-100 mr-3' onClick={() => deleteNotification(notification.ReportID)}><X /></button>
                                            <div>{notification.ReporterUserFirstName} {notification.ReporterUserLastName}</div>
                                            <div className="flex flex-wrap max-w-30 wrap-break-word">{notification.Description}</div>
                                            <a href={`mailto:${notification.Email}`} className="flex place-self-center self-center text-sm p-3 rounded-2xl bg-blue-400 hover:text-white text-center hover:cursor-pointer hover:bg-blue-200 text-white"
                                                target="_blank">Email</a> {/* https://careerkarma.com/blog/html-email-link/#:~:text=The%20HTML%20mailto%20link%20opens,body%20with%20a%20mailto%20link. */}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="m-1 p-2 rounded-2xl bg-gray-200 text-center text-xl">
                                No notifications
                            </div>
                        )
                    }
                </div>
            </section>

            <section className="mt-5">
                <span className="flex justify-center mt-5 text-xl font-bold">Members</span>
                <div className="m-1 p-2 rounded-2xl bg-gray-200 overflow-y-scroll max-h-30 h-full">
                    {Array.isArray(StudentData) && StudentData.length > 0 ? (
                        StudentData.map((Student: any) => (
                            <div key={Student.UserID} className="flex flex-row">
                                <div className="flex justify-between gap-2">
                                    <div aria-label={`Github: ${Student.GithubUsername} Trello: ${Student.TrelloUsername} `} className="flex flex-row gap-5 text-xl align-center place-self-center">
                                        <UserRoundIcon size={20} className="text-yellow-500 items-center flex" /> {Student.FirstName} {Student.LastName}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="m-1 p-2 rounded-2xl bg-gray-200 text-center text-xl">
                            Your student info is unavailable
                        </div>
                    )}

                    <div className="flex h-20  flex-col">
                        {Array.isArray(TeamData) && TeamData.length > 0 ? (
                            TeamData.map((member: any) => (
                                <div key={member.UserID} className="flex flex-col gap-4">
                                    <div className="flex justify-between" >
                                        <div className="flex flex-row gap-5 text-xl align-center place-self-center">
                                            <UserRoundIcon size={20} className="items-center flex" />{member.UserFirstName} {member.UserLastName}</div>
                                        <button type='button' className="flex place-self-center self-center text-sm p-3 rounded-2xl bg-red-400 hover:text-white text-center hover:cursor-pointer hover:bg-red-200 text-black"
                                            onClick={() => ReportModal(member.UserID, "Supervisor")}>Report</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="m-2 p-4 rounded-2xl bg-gray-200 text-center text-xl">
                                Member info is unavailable
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-center gap-5">
                    <button className="flex place-self-center p-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black"
                        onClick={LogOut}>Logout</button>
                    <button className="flex place-self-center p-3 rounded-2xl hover:bg-gray-600 hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black"
                        onClick={() => router.push(`/dashboard/settings/`)}>Settings</button>
                </div>
            </section>


        </>

    )

    async function LogOut() {
        const { error } = await supabase.auth.signOut()
        router.push('/auth/login/')
        if (error) {
            console.log("error signing out: ", error)
        }
    }



    async function fetchallaccount() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/account/fetchallaccount`, {
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

        setStudentData(response.data);

    }

    async function fetchteaminfo() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/account/fetchteam?TeamID=${TeamID}`, {
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
        SetTeamData(response.data);

    }

    async function getTeamName() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/account/teamname?TeamID=${TeamID}`, {
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

        setTeamName(response.data[0].name);
    }


    async function getStudentNotifications() {
        //get notificiations specific for the student in this team

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const userID = data.session?.user.id

        console.log("User ID here: ", userID);

        const res = await fetch(`/api/notifications/fetchNotifications?TeamID=${TeamID}&UserID=${userID}`, {
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
        console.log("response for notifs: ", response);

        setNotifications(response.data)
    }

    async function deleteNotification(notificationID: string) {
        //get notificiations specific for the student in this team

        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        console.log("notificationid: ", notificationID);
        const res = await fetch(`/api/notifications/deleteNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                ReportID: notificationID
            })
        });

        if (!res.ok) {
            console.log("Error fetching github repo:", res)
        }

        getStudentNotifications();
    }
}