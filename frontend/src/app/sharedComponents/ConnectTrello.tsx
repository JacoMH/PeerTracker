"use client";

interface Team {
    TeamID: String;
}
// https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591 used this tutorial to help setup connection
export default function ConnectTrello(Team: Team) {
    // Check here if user is new or needs to get a new token by comparing their id with the github_integration access_token
    return (
        <div>
            <button onClick={() => ConnectTrello()}>Connect Trello</button>
        </div>
    )

    async function ConnectTrello() {
        //Trello API key
        const ApiKey = process.env.NEXT_PUBLIC_TRELLO_API_KEY;
        const redirect_uri = `${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/auth/trello`; // Where trello redirects on response

        const link = `https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&key=${ApiKey}&return_url=${redirect_uri}?TeamID=${Team.TeamID}`

        window.location.assign(link);
    }
}