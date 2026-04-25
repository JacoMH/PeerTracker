import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

interface Props {
    repoID: string,
    boardID: string,
    repoUrl: string,
    boardUrl: string,
    githubRepoState: boolean | null,
    trelloBoardState: boolean | null,
    responseGithub: (response: boolean) => void,
    responseTrello: (response: boolean) => void,
    TeamID: String
}
// https://medium.com/@ozhanli/passing-data-from-child-to-parent-components-in-react-e347ea60b1bb
export default function ChooseApps({ TeamID, responseGithub, responseTrello, repoUrl, boardUrl, repoID, boardID }: Props) {
    const [githubRepoUrl, setGithubRepoUrl] = useState("");
    const [trelloBoardUrl, setTrelloBoardUrl] = useState("");


    useEffect(() => {
        setGithubRepoUrl(repoUrl);
        setTrelloBoardUrl(boardUrl);
    },[repoUrl, boardUrl])

    useEffect(() => {
        console.log("current Repo: ", repoID);
        console.log("current Board: ", boardID);
    },[repoID])

    return (
        <div className="bg-gray-200 p-20 rounded-2xl">
            <span className="flex justify-center text-xl font-bold mb-10">Select Tools</span>
            <form className="flex flex-col" onSubmit={(e) => { { e.preventDefault(); getBoth() } }}>
                <div className="flex flex-row gap-15">
                    <div className="flex flex-col">
                        <label htmlFor="githubRepo" className="flex justify-center text-lg font-bold">Github Repo </label>
                        <label htmlFor="githubRepo" className="text-sm text-center">*Ensure the Repo is private</label>
                        <input className=' bg-gray-300 p-2 rounded-full' type='text' name='githubRepo' placeholder="Enter Repository URL" 
                        value={githubRepoUrl} onChange={(e) => setGithubRepoUrl(e.target.value)}></input>
                    </div>


                    <div className="flex flex-col">
                        <label htmlFor="githubRepo" className="flex justify-center text-lg font-bold">Trello Board: </label>
                        <label htmlFor="githubRepo" className="text-sm text-center">*Ensure the Board is public</label>
                        <input className=' bg-gray-300 p-2 rounded-full' type='text' name='githubRepo' placeholder="Enter Repository URL" 
                        value={trelloBoardUrl} onChange={(e) => setTrelloBoardUrl(e.target.value)}></input>
                    </div>
                </div>
                <button className="flex mt-10 place-self-center p-3 rounded-2xl hover:bg-gray-200 hover:text-black text-center hover:cursor-pointer bg-gray-600 text-white" type="submit">
                    Submit</button>
            </form>

        </div>
    )

    async function getBoth() {

        githubRepoUrl != repoUrl ? await linkRepo() : null

        trelloBoardUrl != boardUrl ? await linkTrelloBoard() : null

        location.reload();
    }


    async function linkRepo() {
        //Adds repo to db
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        console.log("TeamID", TeamID, "githubRepoUrl: ", githubRepoUrl);



        const res = await fetch(`/api/auth/github/linkgithubrepo?TeamID=${TeamID}&url=${githubRepoUrl}&currentRepo=${repoID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`

            }
        });

        if (!res.ok) {
            console.log("Error updating Invite", res.status, res.statusText)
        }
        const result = await res.json();

        if (result.message === "Repo Stored") {
            console.log("Successful");
            await updateRepoDatabase();
            responseGithub(true);
        }

    }

    async function linkTrelloBoard() {
        //Adds trello board to db
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        const res = await fetch(`/api/auth/trello/linktrelloboard?TeamID=${TeamID}&url=${trelloBoardUrl}&currentBoard=${boardID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`

            }
        });

        if (!res.ok) {
            console.log("Error updating Invite", res.status, res.statusText)
        }

        const result = await res.json();

        if (result.message === "Board Stored") {
            console.log("Successful");
            await updateTrelloDatabase();
            console.log("hello i made it here");
            responseTrello(true);
        }

    }

    async function updateTrelloDatabase() {
        //push all other trello data from trello to my db
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        console.log("rest of the trello updating here");



        console.log("right before");
        const res = await fetch(`/api/auth/trello/updateTrelloDatabase?TeamID=${TeamID}&url=${trelloBoardUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`

            }
        });


        console.log("hellooooajsodijasoidjaosidj");

        if (!res.ok) {
            console.log("Error updating Invite", res.status, res.statusText)
        }

        const result = await res.json();

        console.log("result: ", result);

        if (result.message === "Successful Database Update") {
            console.log("Successful here too");
            responseTrello(true);
        }
    }


    async function updateRepoDatabase() {

        //grabbing github commits and putting to db
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        console.log("TeamID", TeamID, "githubRepoUrl: ", githubRepoUrl);

        const res = await fetch(`/api/auth/github/updateDatabase?TeamID=${TeamID}&url=${githubRepoUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${access_token}`
            }
        });

        if (!res.ok) {
            console.log("Error updating Invite", res.status, res.statusText)
        }
        const result = await res.json();

        if (result.message === "Repo Stored") {
            console.log("Successful");
            responseGithub(true);
        }
    }
}