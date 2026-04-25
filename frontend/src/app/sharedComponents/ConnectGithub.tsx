"use client";

interface Team {
    TeamID: String;
}
// https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591 used this tutorial to help setup connection
export default function ConnectGithub(Team: Team) {
    // Check here if user is new or needs to get a new token by comparing their id with the github_integration access_token
    return (
            <button className="hover:bg-gray-400 max-h-10 h-full hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl" onClick={() => redirectGithub()}>Connect github</button>
    )


    async function redirectGithub() {
        //Github Client ID
        const clientID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

        const state = crypto.randomUUID(); // https://developer.mozilla.org/en-US/docs/Web/API/Crypto 
        
        const redirect_uri = `${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/auth/github`; // Where github redirects on response
        sessionStorage.setItem("latestCSRFToken", state);

        //redirect user to github which if successful then redirects back to /auth/github
        // Use the state to keep teamid throughout the link https://github.com/orgs/community/discussions/61238
        const link=`https://github.com/login/oauth/authorize?client_id=${clientID}&response_type=code&scope=repo,admin:repo_hook&redirect_uri=${redirect_uri}&state=${state}+${Team.TeamID}`

        window.location.assign(link);
    }
}