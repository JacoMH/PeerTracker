"use client";

interface Team {
    TeamID: String;
}
//https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/ used this tutorial to help setup connection
export default function ConnectTrello(Team: Team) {
    return (
            <button className="hover:bg-gray-400 max-h-10 h-full hover:text-white text-center hover:cursor-pointer bg-gray-200 text-black p-2 rounded-2xl" onClick={() => ConnectTrello()}>Connect Trello</button>
    )

    async function ConnectTrello() {
        //Trello API key
        const ApiKey = process.env.NEXT_PUBLIC_TRELLO_API_KEY;
        const redirect_uri = `${process.env.NEXT_PUBLIC_FRONTEND_API_URL}/auth/trello`; // Where trello redirects on response

        const link = `https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&key=${ApiKey}&return_url=${redirect_uri}?TeamID=${Team.TeamID}`

        window.location.assign(link);
    }
}