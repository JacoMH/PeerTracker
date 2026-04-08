import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface Props {
    response: (response: boolean) => void;
    TeamID: String;
}
// https://medium.com/@ozhanli/passing-data-from-child-to-parent-components-in-react-e347ea60b1bb
export default function StudentMenu({ TeamID, response }: Props) {
    const [githubRepoUrl, setGithubRepoUrl] = useState("");
    return (
        <div>
            <span>Select Tools</span>
            <form onSubmit={(e) => { { e.preventDefault(); linkRepo() } }}>
                <label htmlFor="githubRepo">Github Repo: </label>
                <label htmlFor="githubRepo">*Ensure the Repo is public</label>
                <input type='text' name='githubRepo' placeholder="Enter Repository URL" onChange={(e) => setGithubRepoUrl(e.target.value)}></input>
                <button type="submit">Submit</button>
            </form>

        </div>
    )


    async function linkRepo() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        console.log("TeamID", TeamID, "githubRepoUrl: ", githubRepoUrl);



        const res = await fetch(`/api/auth/github/linkgithubrepo?TeamID=${TeamID}&url=${githubRepoUrl}`, {
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
            response(true);
        }
 
        //do post to backend where github pulls api data for the repo using the users access token, where the repo info will be stored with their team id in the githubrepo table


    }

    async function updateRepoDatabase() {
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
            response(true);
        }
    }
}