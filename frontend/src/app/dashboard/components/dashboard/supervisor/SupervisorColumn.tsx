import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { PiStudent } from "react-icons/pi";
import { AiOutlineTeam } from "react-icons/ai";
import { UserRoundIcon } from "lucide-react";
import { X } from "lucide-react";



interface Props {
    TeamID: String;
    ReportModal: (response: string, type: string) => void;
}
export default function SupervisorColumn({ TeamID, ReportModal }: Props) {
    const [TeamName, setTeamName] = useState("");
    const [SupervisorData, setSupervisorData] = useState([]);
    const [TeamData, SetTeamData] = useState([]);
    const router = useRouter();
    const [Notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const getInfo = async () => {
            await fetchallaccount();
            await fetchteaminfo();
            await getTeamName();
            await getNotifications();
        }

        getInfo();
    }, [])

    useEffect(() => {
        console.log("teamData:", TeamData);
    }, [TeamData])

    return (
        <>
            {
                Array.isArray(SupervisorData) && SupervisorData.length > 0 ? (
                    SupervisorData.map((Supervisor: any) => (
                        <div key={Supervisor.UserID}>
                            <span className="flex justify-center text-xl font-bold max-h-20">User</span>
                            <div className="m-1 p-3 rounded-2xl bg-gray-200 flex flex-col gap-1">
                                <div className="flex flex-row text-xl items-center gap-2">
                                    <AiOutlineTeam size={25} className="items-center flex" />{TeamName}
                                </div>
                                <div className="flex flex-row text-xl items-center gap-2">
                                    <PiStudent size={25} className="items-center flex" />{Supervisor.Role}
                                </div>
                            </div>

                            <div className="flex m-1 p-3 flex-col gap-1">
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer hover:text-gray-200 hover:bg-gray-600 bg-gray-200 p-3"
                                    onClick={() => router.push(`/dashboard/teams/${TeamID}`)}>Dashboard</button>
                                <button className="flex flex-row text-xl items-center rounded-2xl hover:cursor-pointer bg-gray-200 hover:text-gray-200 hover:bg-gray-600 p-3"
                                    onClick={() => router.push(`/dashboard/reports/${TeamID}?UserID=${Supervisor.UserID}`)}>Supervisor Reports</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>
                        Information Unavailable
                    </div>
                )

            }

            <section className="mb-5 ">
                <span className="flex justify-center mt-5 text-xl font-bold">Notifications</span>
                <div className="m-1 p-2 rounded-2xl bg-gray-200 overflow-y-scroll max-h-25 h-full">
                    {
                        Array.isArray(Notifications) && Notifications.length > 0 ? (
                            Notifications.map((notification: any) => (
                                <div key={notification.ReportID}>
                                    <div className="flex flex-row">
                                        <button type='button' className='z-100 mr-3' onClick={() => deleteNotification(notification.ReportID)}><X /></button>
                                        <div>Reported: {notification.ReportedUserFirstName} {notification.ReportedUserLastName}</div>
                                        <div>{notification.Description}</div>
                                        <a href={`mailto:${notification.Email}`} className="flex place-self-center self-center text-sm p-3 rounded-2xl bg-blue-400 hover:text-white text-center hover:cursor-pointer hover:bg-blue-200 text-white" target="_blank">Email</a> {/* https://careerkarma.com/blog/html-email-link/#:~:text=The%20HTML%20mailto%20link%20opens,body%20with%20a%20mailto%20link. */}
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

            <section>
                <span className="flex justify-center mt-5 text-xl font-bold">Members</span>
                <div className="m-1 p-2 rounded-2xl bg-gray-200 overflow-y-scroll max-h-30 h-full">
                    {Array.isArray(SupervisorData) && SupervisorData.length > 0 ? (
                        SupervisorData.map((Supervisor: any) => (
                            <div key={Supervisor.UserID} className="flex flex-row">
                                <div className="flex justify-between gap-2">
                                    <div title={`Github: ${Supervisor.GithubUsername} Trello: ${Supervisor.TrelloUsername} `}
                                        className="flex flex-row gap-5 text-xl align-center place-self-center">
                                        <UserRoundIcon size={20} className="text-yellow-500 items-center flex" /> {Supervisor.FirstName} {Supervisor.LastName}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="m-1 p-2 rounded-2xl bg-gray-200 text-center text-xl">
                            No Supervisor Info
                        </div>
                    )}
                    <div className="flex  h-20  flex-col">
                        {Array.isArray(TeamData) && TeamData.length > 0 ? (
                            TeamData.map((member: any) => (
                                <div key={member.UserID} className="flex justify-between">
                                    <div title={`Github: ${member.GithubUsername} Trello: ${member.TrelloUsername} `}
                                        className="flex flex-row gap-5 text-xl align-center place-self-center"><UserRoundIcon size={20} className="items-center flex" />
                                        {member.UserFirstName} {member.UserLastName}
                                    </div>
                                    <button type='button' className="flex place-self-center self-center text-sm p-3 rounded-2xl bg-red-400 hover:text-white text-center hover:cursor-pointer hover:bg-red-200 text-black"
                                        onClick={() => ReportModal(member.UserID, "Student")}>Report</button>
                                </div>
                            ))
                        ) : (
                            <div className="m-2 p-4 rounded-2xl bg-gray-200 text-center text-xl">
                                No Other Members
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

        setSupervisorData(response.data);

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

    async function getNotifications() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/notifications/fetchNotifications?TeamID=${TeamID}&UserID=`, {
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

        console.log("supervisorNotifications: ", response);
        setNotifications(response.data);
    }

    async function deleteNotification(notificationID: string) {
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

        getNotifications();
    }
}