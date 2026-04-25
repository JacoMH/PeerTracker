"use client";
import { useState, useEffect } from "react";
import { FetchUserRole } from "@/app/sharedComponents/FetchUserRole";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation'
import { supabase } from "@/lib/supabase";
import { FaEdit } from "react-icons/fa";
import { X } from 'lucide-react'

// Modules

//Connect
import ConnectGithub from "@/app/sharedComponents/ConnectGithub";
import ConnectTrello from "@/app/sharedComponents/ConnectTrello";
import DisplayApps from "@/app/dashboard/components/dashboard/shared/tools/DisplayApps"
import ReportUser from "@/app/dashboard/components/reportuser/ReportUser"

//Student
import StudentColumn from "@/app/dashboard/components/dashboard/student/StudentColumn";

//Supervisor 
import SupervisorColumn from "@/app/dashboard/components/dashboard/supervisor/SupervisorColumn";

//Shared

//Metrics
import ChooseApps from "@/app/dashboard/components/dashboard/shared/tools/ChooseApps"
import Engagement from '@/app/dashboard/components/dashboard/shared/metrics/Engagement'
import TopContributors from '@/app/dashboard/components/dashboard/shared/metrics/TopContributors'
import TrelloActionsUser from '@/app/dashboard/components/dashboard/shared/metrics/TrelloActionsUser'
import GithubHeatmap from '@/app/dashboard/components/dashboard/shared/metrics/GithubHeatmap';
import DisplayCard from '@/app/dashboard/components/dashboard/shared/metrics/DisplayCard'

//Interfaces
import { TrelloCards } from '@/interfaces/TrelloCards'
import { FadeLoader } from "react-spinners";

// Supervisor Modules

export default function DashboardPage() {
    const [role, setRole] = useState<String | null>(null);
    const [TeamID, setTeamID] = useState<String>("");     //export const so it can be used for redirect when coming hack from github auth page
    const [toggleGithubIntegration, setToggleGithubIntegration] = useState<boolean | null>(null);
    const [toggleTrelloIntegration, setToggleTrelloIntegration] = useState<boolean | null>(null);
    const [githubRepoState, setGithubRepoState] = useState<boolean | null>(null); //toggles on when the team has github repo
    const [trelloBoardState, setTrelloBoardState] = useState<boolean | null>(null); //toggles on when the team has trello board
    const [toggleMenu, settoggleMenu] = useState<boolean>(false);
    const [githubRepoID, setGithubRepoID] = useState("");
    const [trelloBoardID, setTrelloBoardID] = useState("");
    const [githubRepoUrl, setGithubRepoUrl] = useState("");
    const [trelloBoardUrl, setTrelloBoardUrl] = useState("");
    const [userIdForContributionModal, setUserIdForContributionModal] = useState<string | null>(null);
    const [userIdForHeatmpModal, setUserIdForHeatmapModal] = useState<string | null>(null);
    const [modalCard, setModalCard] = useState<TrelloCards | null>();
    const [descriptionresponse, setDescriptionResponse] = useState<string | null>("");
    const [userIDForReport, setUserIDForReport] = useState<string | null>(null);
    const [typeForReport, setTypeForReport] = useState("");


    const router = useRouter();
    const params = useParams();

    // Check to see if the account already has a github auth connection
    useEffect(() => {
        const fetchRole = async () => {
            const { data } = await supabase.auth.getSession();
            const userRole = await FetchUserRole(data.session?.user.id ?? null);
            setRole(userRole);
            console.log("User Role:", userRole);
            if (userRole === null) {
                router.push("/auth/login");
            }
        }

        const setTeam = async () => {
            setTeamID(params.team as String);
        }
        fetchRole();
        setTeam();
        checkgithubintegration();
        checktrellointegration();
    }, [])

    useEffect(() => {
        console.log("github repo url: ", githubRepoUrl)
    }, [githubRepoUrl])

    async function handleGithubRepoResponse(response: boolean) {
        setGithubRepoState(response);
        await FetchGithubRepo();
    }

    async function handleTrelloBoardResponse(response: boolean) {
        setTrelloBoardState(response);
        await fetchtrelloboard();
    }

    function toggleToolMenu() {
        settoggleMenu(!toggleMenu);
    }

    function contributionModal(response: string) {
        setUserIdForContributionModal(response);
    }

    function heatmapModal(response: string) {
        setUserIdForHeatmapModal(response);
    }

    function toggleHeatmapMenu() {
        setUserIdForHeatmapModal(null);
    }

    function toggleCardModalMenu(response: TrelloCards) {
        console.log("response: ", response);
        setModalCard(response)
        console.log("modalcard: ", modalCard);
    }

    function ToggleDescriptionResponse(response: string | null) {
        console.log("description: ", response);
        setDescriptionResponse(response);
    }

    function reportModalMenu(response: string, type: string) {
        console.log("made it to the modal: ", response, type);
        setUserIDForReport(response);
        setTypeForReport(type);
    }


    function closeWindow() {
        setUserIDForReport(null);
    }


    useEffect(() => {
        const fetchInfo = async () => {
            await FetchGithubRepo();
            await fetchtrelloboard();
        }
        if ((toggleGithubIntegration === true && toggleTrelloIntegration === true) && role === "Student") {
            // fetch if there is a github repo already assigned to the team
            fetchInfo();
        }
        else if (role === "Supervisor") {
            fetchInfo();
        }
    }, [toggleGithubIntegration, toggleTrelloIntegration, TeamID, role])


    useEffect(() => {
        console.log("trelloboardstate: ", trelloBoardState, "GithubRepoState: ", githubRepoState);
    }, [trelloBoardState, githubRepoState])

    return (

        role === "Student" && toggleGithubIntegration != null && toggleTrelloIntegration != null ? (
            <main className="flex min-w-screen w-full min-h-screen">
                <section className="flex w-full min-h-screen ">
                    {/*Dashboard for student*/}
                    {
                        !toggleGithubIntegration || !toggleTrelloIntegration ? (
                            <div className='z-100 flex items-center justify-center absolute w-full h-full bg-gray-200/40'>
                                <div className="flex flex-col justify-center items-center bg-gray-500 max-w-150 rounded-2xl max-h-70 h-full w-full gap-5">
                                    <div className="text-4xl font-bold flex justify-center mb-10 ">Connect Tools</div>
                                    <div className="flex gap-5">
                                        {!toggleGithubIntegration ? <ConnectGithub TeamID={TeamID} /> : <div className="text-center bg-gray-400 text-black p-2 rounded-2xl">Github Verified</div>}  {/* Pass TeamID to connectgithub to help with redirect https://www.youtube.com/watch?v=s6DGVtkX9R0*/}
                                        {!toggleTrelloIntegration ? <ConnectTrello TeamID={TeamID} /> : <div className="text-center bg-gray-400 text-black p-2 rounded-2xl">Trello Verified</div>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex w-full">
                                {
                                    githubRepoState && trelloBoardState ? (
                                        <section className="flex flex-row w-full min-h-screen">
                                            <div className="flex flex-col p-4 justify-content-start w-[30%] h-full bg-gray-400 rounded-sm">
                                                <StudentColumn TeamID={TeamID} ReportModal={reportModalMenu} />
                                            </div>
                                            {/* all the main stuff goes here, put teamID into all the modules to get the right data */}

                                            <div className="flex flex-col min-h-screen w-full">
                                                <div className="flex flex-row min-h-[45%] ">
                                                    <div className="flex p-5 rounded-2xl bg-gray-400 m-2 items-start"><TopContributors TeamID={TeamID}
                                                        contributionModal={contributionModal} heatmapModal={heatmapModal} />
                                                    </div>
                                                    <div className="flex rounded-2xl justify-center bg-gray-400 p-2 m-2 flex-1 w-[40%]"><Engagement
                                                        RepoID={githubRepoID} BoardID={trelloBoardID} TeamID={TeamID} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-row w-full min-h-[55%]">
                                                    <div className=" flex flex-row w-full rounded-2xl bg-gray-400 m-2 p-8">
                                                        <DisplayApps TeamID={TeamID} />
                                                        <button className="flex justify-end hover:text-gray-300 hover:cursor-pointer" onClick={() => toggleToolMenu()} ><FaEdit size={20} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            {

                                                //Menu for modifying github repo and trello board
                                                toggleMenu ? (
                                                    <div className="z-100 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                                        <ChooseApps repoID={githubRepoID} boardID={trelloBoardID} TeamID={TeamID}
                                                            responseGithub={handleGithubRepoResponse} responseTrello={handleTrelloBoardResponse} githubRepoState={githubRepoState} trelloBoardState={trelloBoardState} repoUrl={githubRepoUrl} boardUrl={trelloBoardUrl} />
                                                        <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                            <button className="flex h-[45%] hover:cursor-pointer" onClick={() => toggleToolMenu()}><X size={40} /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                    </div>
                                                )
                                            }

                                            {
                                                userIdForContributionModal ? (
                                                    <div className="z-100 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                                        <TrelloActionsUser TeamID={TeamID as string} UserID={userIdForContributionModal} BoardID={trelloBoardID} sendModal={toggleCardModalMenu} />
                                                        <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                            <button className="flex h-[45%] hover:cursor-pointer"
                                                                onClick={() => setUserIdForContributionModal(null)}>
                                                                <X size={40} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>

                                                    </div>
                                                )
                                            }

                                            {
                                                userIdForHeatmpModal ? (
                                                    <div className="z-100 flex justify-center absolute w-full h-full bg-gray-200/40">
                                                        <GithubHeatmap UserID={userIdForHeatmpModal} RepoID={githubRepoID} descriptionresponse={ToggleDescriptionResponse} />
                                                        <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                            <button className="flex h-[80%] hover:cursor-pointer" onClick={() => toggleHeatmapMenu()}><X size={40} /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>

                                                    </div>
                                                )
                                            }

                                            {
                                                modalCard?.CardID ? (
                                                    <div className="z-150 flex items-center justify-center absolute w-full h-full bg-gray-200/40 ">
                                                        <DisplayCard CardID={modalCard.CardID} ListID={modalCard.ListID} name={modalCard.name}
                                                            dueComplete={modalCard.dueComplete} dueDate={modalCard.dueDate} BoardID={modalCard.BoardID}
                                                            ListName={modalCard.ListName} ListClosed={modalCard.ListClosed} />
                                                        <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                            <button className="flex h-[45%] hover:cursor-pointer" onClick={() => setModalCard(null)}>
                                                                <X size={40} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                    </div>
                                                )
                                            }

                                            {
                                                descriptionresponse ? (
                                                    <div className="z-150 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                                        <div className='bg-gray-400 p-10 rounded-2xl max-w-200 m-2'>
                                                            <p className="max-w-200 p-10 m-2">{descriptionresponse}</p>
                                                        </div>
                                                        <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                            <button className="flex h-[45%] hover:cursor-pointer" onClick={() => setDescriptionResponse(null)}>
                                                                <X size={40} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>

                                                    </div>
                                                )
                                            }

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
                                        </section>
                                    ) : (
                                        <div className="z-100 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                            {/* link here to module that allows user to select github repo for the team */}
                                            <ChooseApps TeamID={TeamID} repoID={githubRepoID} boardID={trelloBoardID} responseGithub={handleGithubRepoResponse}
                                                responseTrello={handleTrelloBoardResponse} githubRepoState={githubRepoState} trelloBoardState={trelloBoardState}
                                                repoUrl={githubRepoUrl} boardUrl={trelloBoardUrl} />
                                        </div>
                                    )
                                }
                            </div>
                        )}
                </section>
            </main>
        ) : role === "Supervisor" ? (
            <main className="flex min-w-screen w-full min-h-screen">
                <section className="flex w-full min-h-screen ">
                    {/*Dashboard for supervisor*/}
                    {/* Connect your github window */}
                    {
                        githubRepoState && trelloBoardState ? (
                            <section className="flex flex-row w-full min-h-screen h-full">
                                <div className="flex flex-col p-4 justify-content-start w-[30%] h-full bg-gray-400 rounded-sm">
                                    <SupervisorColumn TeamID={TeamID} ReportModal={reportModalMenu} />
                                </div>
                                {/* all the main stuff goes here, put teamID into all the modules to get the right data */}

                                <div className="flex flex-col min-h-screen w-full">
                                    <div className="flex flex-row min-h-[45%] ">
                                        <div className="flex p-5 rounded-2xl bg-gray-400 m-2 items-start"><TopContributors TeamID={TeamID}
                                            contributionModal={contributionModal} heatmapModal={heatmapModal} />
                                        </div>
                                        <div className="flex rounded-2xl justify-center bg-gray-400 p-2 m-2 flex-1 w-[40%]"><Engagement RepoID={githubRepoID}
                                            BoardID={trelloBoardID} TeamID={TeamID} />
                                        </div>
                                    </div>
                                    <div className="flex flex-row w-full min-h-[55%]">
                                        <div className=" flex flex-row w-full rounded-2xl bg-gray-400 m-2 p-8">
                                            <DisplayApps TeamID={TeamID} />
                                        </div>
                                    </div>
                                </div>

                                {
                                    userIdForContributionModal ? (
                                        <div className="z-100 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                            <TrelloActionsUser TeamID={TeamID as string} UserID={userIdForContributionModal}
                                                BoardID={trelloBoardID} sendModal={toggleCardModalMenu} />
                                            <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                <button className="flex hover:cursor-pointer" onClick={() => setUserIdForContributionModal(null)}>
                                                    <X size={40} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>

                                        </div>
                                    )
                                }

                                {
                                    userIdForHeatmpModal ? (
                                        <div className="z-100 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                            <GithubHeatmap UserID={userIdForHeatmpModal} RepoID={githubRepoID} descriptionresponse={ToggleDescriptionResponse} />
                                            <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                <button className="flex h-[45%] hover:cursor-pointer" onClick={() => toggleHeatmapMenu()}>
                                                    <X size={40} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>

                                        </div>
                                    )
                                }

                                {
                                    descriptionresponse ? (
                                        <div className="z-150 flex items-center justify-center absolute w-full h-full bg-gray-200/40">
                                            <div className='bg-gray-400 p-10 rounded-2xl max-w-200 m-2'>
                                                <p className="max-w-200 p-10 m-2">{descriptionresponse}</p>
                                            </div>
                                            <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                <button className="flex h-[45%] hover:cursor-pointer" onClick={() => setDescriptionResponse(null)}>
                                                    <X size={40} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>

                                        </div>
                                    )
                                }

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

                                {
                                    modalCard?.CardID ? (
                                        <div className="z-150 flex items-center justify-center absolute w-full h-full bg-gray-200/40 ">
                                            <DisplayCard CardID={modalCard.CardID} ListID={modalCard.ListID} name={modalCard.name}
                                                dueComplete={modalCard.dueComplete} dueDate={modalCard.dueDate} BoardID={modalCard.BoardID}
                                                ListName={modalCard.ListName} ListClosed={modalCard.ListClosed} />
                                            <div className="z-100 absolute w-full flex justify-end place-self-start">
                                                <button className="flex h-[45%] hover:cursor-pointer" onClick={() => setModalCard(null)}>
                                                    <X size={40} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                        </div>
                                    )
                                }
                            </section>
                        ) : (
                            <div className="flex justify-center w-full h-screen items-center text-2xl">
                                There are currently no tools assigned, please notify students.
                            </div>
                        )
                    }
                </section>
            </main>
        ) : (toggleGithubIntegration === null || toggleTrelloIntegration === null) && role === "Student" ? (
            <div>
                <div className='z-100 flex items-center justify-center absolute w-full h-full bg-gray-200/40'>
                    <div className="flex flex-col justify-center items-center bg-gray-500 max-w-150 rounded-2xl max-h-70 h-full w-full gap-5">
                        <div className="text-4xl font-bold flex justify-center mb-10 ">Connect Tools</div>
                        <div className="flex gap-5">
                            {!toggleGithubIntegration ? <ConnectGithub TeamID={TeamID} /> : <div className="text-center bg-gray-400 text-black p-2 rounded-2xl">Github Verified</div>}  {/* Pass TeamID to connectgithub to help with redirect https://www.youtube.com/watch?v=s6DGVtkX9R0*/}
                            {!toggleTrelloIntegration ? <ConnectTrello TeamID={TeamID} /> : <div className="text-center bg-gray-400 text-black p-2 rounded-2xl">Trello Verified</div>}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex justify-center w-full h-screen items-center">
                <FadeLoader color="#060606" />
            </div>
        )
    )

    async function checkgithubintegration() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        //check if the user has an integrated github account
        const res = await fetch(`/api/auth/github/verifygithub`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error fetching supervisor teams:", res)
        }

        const response = await res.json();

        if (response.message === "Successful verification") {
            setToggleGithubIntegration(true);
        }
        console.log("response: ", response);
    }

    async function FetchGithubRepo() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        console.log("start of repo");


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

        console.log("response: ", response);

        if (response.message === "Github Repos Exist") {
            console.log("hello here too");
            console.log("REPO URL HERE: :::::", response.data[0].RepoUrl);
            setGithubRepoState(true);
            setGithubRepoID(response.data[0].RepoID)
            setGithubRepoUrl(response.data[0].RepoUrl)
        } else {
            setGithubRepoState(false);
        }
    }

    async function checktrellointegration() {
        //Fetch to see if trello account integrated
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/auth/trello/verifytrello`, {
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

        if (response.message === "Successful verification") {
            setToggleTrelloIntegration(true);
        }
        console.log("response: ", response);
    }

    async function fetchtrelloboard() {
        //Fetch to see if trello board exists
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

        //  console.log("response: ", res);


        const response = await res.json();

        if (response.message === "Trello Board Exists") {
            console.log("here made it too")
            console.log("BOARD URL HERE: :::::", response.data[0].BoardUrl);

            setTrelloBoardState(true);
            setTrelloBoardID(response.data[0].BoardID)
            setTrelloBoardUrl(response.data[0].BoardUrl)
        }
        else {
            setTrelloBoardState(false);
        }
        console.log("response: ", response);
    }
}

