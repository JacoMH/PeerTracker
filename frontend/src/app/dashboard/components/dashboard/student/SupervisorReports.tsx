interface Props{
    TeamID: String;
}

// Here i will use Chart.js to show weekly contributions
export default function SupervisorReports({ TeamID }: Props) {

    return(
        <div>
            <span>{/* Student name here */}</span>
            <div>{/* Team name here */}</div>

            <button> {/* dashboard button here */}</button>
            <button> {/* Supervisor Reports button here */}</button>

            <section>
                {/* Notifications here */}
            </section>
        

            <section>
                {/* List of members here, potentially also showing their usernames in the other apps if connected */}
            </section>
        </div>

    )
}