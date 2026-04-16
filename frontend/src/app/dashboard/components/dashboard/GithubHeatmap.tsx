interface Props{
    TeamID: string;
    UserID: string;
}

export default function GithubHeatmap({ TeamID, UserID }: Props) {
 //query by having a where between two dates, then between those dates each column is an hour of the day where github commits are grouped into it
    return(
        <div>
            Heatmap Here
        </div>

    )
}