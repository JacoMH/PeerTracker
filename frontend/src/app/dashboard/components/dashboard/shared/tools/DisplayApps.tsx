//Displays the links to the places where the info is getting taken from, formatted like google drive
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { FaTrello, FaGithub } from "react-icons/fa"; //https://react-icons.github.io/react-icons/search/#q=github

interface Props {
    TeamID: String
}

export default function DisplayApps({ TeamID }: Props) {
    const [githubRepo, setGithubRepo] = useState([]);
    const [trelloBoard, setTrelloBoard] = useState([]);

    useEffect(() => {
        FetchGithubRepo();
        FetchTrelloBoard();
    }, [])

    useEffect(() => {
        console.log("githubrepo:dsaa ", githubRepo);
    }, [githubRepo])
    return (
        <div className="flex flex-col w-full gap-10">
            <span className=" text-2xl font-bold">Select Tools</span>
            <div className="flex flex-row gap-15">
                {Array.isArray(githubRepo) && githubRepo.length > 0 ? (
                    githubRepo.map((repo: any) => (
                        <div key={repo.RepoID} className="flex">
                            <div>
                                <a href={repo.RepoUrl} aria-label={repo.RepoName} target="_blank">
                                    <div>
                                        <FaGithub size={200} className="hover:bg-gray-300 rounded-xl" />
                                        <span className=" flex justify-center">{repo.RepoName}</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>
                        Github Unavailable
                    </div>
                )

                }

                {Array.isArray(trelloBoard) && trelloBoard.length > 0 ? (
                    trelloBoard.map((Board: any) => (
                        <div key={Board.BoardID} className="flex">
                            <div>
                                <a href={Board.BoardUrl} aria-label={Board.BoardName} target="_blank">
                                    <div>
                                        <FaTrello size={200} className="hover:bg-gray-300 rounded-xl" />
                                        <span className=" flex justify-center">{Board.BoardName}</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>
                        Trello Unavailable
                    </div>
                )

                }
            </div>
        </div>
    )




    //fetchgithubrepo
    async function FetchGithubRepo() {
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

        setGithubRepo(response.data);


        console.log("response: ", response);
    }

    async function FetchTrelloBoard() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

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

        setTrelloBoard(response.data);


        console.log("response: ", response);
    }
}