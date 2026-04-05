"use client";
// https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591 used this tutorial to help setup connection
export default function ConnectGithub() {
    // Check here if user is new or needs to get a new token by comparing their id with the github_integration access_token
    return (
        <div>
            <button onClick={() => redirectGithub()}>Connect github</button>
        </div>
    )


    async function redirectGithub() {
        //Github Client ID
        const clientID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

        const state = crypto.randomUUID(); // https://developer.mozilla.org/en-US/docs/Web/API/Crypto 
        
        const redirect_uri = `${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/auth/github`; // Where github redirects on response
        sessionStorage.setItem("latestCSRFToken", state);

        //redirect user to github which if successful then redirects back to /auth/github
        const link=`https://github.com/login/oauth/authorize?client_id=${clientID}&response_type=code&scope=repo&redirect_uri=${redirect_uri}&state=${state}`

        window.location.assign(link);
    }
}