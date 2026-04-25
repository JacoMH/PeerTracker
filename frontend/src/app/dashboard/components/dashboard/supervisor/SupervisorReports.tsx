"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { FadeLoader } from 'react-spinners';

interface Props {
    TeamID: String
    RepoID: String,
    BoardID: String
}


interface githubdata {
    AccountID: string,
    CommitCount: string,
    UserID: string,
    date: string
}

interface trellodata {
    AccountID: string,
    UserID: string,
    TrelloAction: string,
    date: string
}

interface engagementMetricsInterface {
    githubdata: githubdata[],
    trellodata: trellodata[]
}

export default function SupervisorReports({ TeamID, RepoID, BoardID }: Props) {
    const [engagementMetrics, setEngagementMetrics] = useState<engagementMetricsInterface>();
    const [teamName, setTeamName] = useState("");
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    useEffect(() => {
        getEngagement();
        fetchTeamMembers();
    }, [])

    useEffect(() => {
        console.log("teammembers: ", teamMembers, "teamName: ", teamName);
    }, [teamMembers, teamName])

    const styles = StyleSheet.create({
        overall: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            paddingBottom: 20,
        },
        table: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        row: {
            borderBottom: '1px solid black',
            display: 'flex',
            flexDirection: 'row',
        }

    });

    // Create Document Component
    const MyFile = ({ engagementMetrics, teamMembers, teamName }: any) => (
        <Document>
            <Page size="A4" style={styles}>
                <View>
                    <Text>Team: {teamName ? teamName : "Unknown Team"}</Text>
                </View>
                <View style={styles.table}>
                    <Text style={styles.title}>Members</Text>
                    {
                        Array.isArray(teamMembers) && teamMembers.length > 0 ? (
                            teamMembers.map((member: any) => (
                                <View key={member.UserFirstName} style={styles.row}>
                                    <Text>{member.UserFirstName} {member.UserLastName} | {member.UserRole}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No Data</Text>
                        )
                    }
                </View>
                <View style={styles.table}>
                    <Text style={styles.title}>Github Commit Metrics</Text>
                    {
                        Array.isArray(engagementMetrics?.githubdata) && engagementMetrics.githubdata.length > 0 ? (
                            engagementMetrics.githubdata.map((metrics: any) => (
                                <View key={metrics.date} style={styles.row}>
                                    <Text>{metrics.date.slice(0, 10)} | {metrics.CommitCount}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No Data</Text>
                        )
                    }
                </View>
                <View style={styles.table}>
                    <Text style={styles.title}>Trello Action Metrics</Text>
                    <View style={styles.table}>
                        {
                            Array.isArray(engagementMetrics?.trellodata) && engagementMetrics.trellodata.length > 0 ? (
                                engagementMetrics.trellodata.map((metrics: any) => (
                                    <View key={metrics.date} style={styles.row}>
                                        <Text>{metrics.date.slice(0, 10)} | {metrics.TrelloAction}</Text>
                                    </View>
                                ))
                            ) : (
                                <View>
                                    <Text>No Data</Text>
                                </View>
                            )
                        }
                    </View>
                </View>
            </Page>
        </Document>
    );
    return (
        <div className="flex flex-col items-center gap-10">
            {engagementMetrics && teamMembers.length > 0 ? (
                <div className='flex hover:cursor-pointer items-center gap-10 text-2xl p-10 bg-gray-300 rounded-2xl'>
                    <PDFDownloadLink document={<MyFile engagementMetrics={engagementMetrics} teamMembers={teamMembers} teamName={teamName} />} fileName="report.pdf">Download PDF</PDFDownloadLink>
                </div>
            ) : (
                <div className="flex justify-center w-full h-screen items-center">
                    <FadeLoader color="#060606" />
                </div>
            )
            }
        </div >
    )

    async function getEngagement() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;
        console.log("repoid: ", RepoID, "boardid: ", BoardID, "teamid: ", TeamID);

        const res = await fetch(`/api/metrics/engagement?RepoID=${RepoID}&BoardID=${BoardID}&TeamID=${TeamID}`, {
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

        console.log("engagement metrics: ", response.data)

        setEngagementMetrics(response.data);
    }

    async function fetchTeamMembers() {
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        console.log("TeamID:", TeamID);

        const res = await fetch(`/api/account/fetchteammembers?TeamID=${TeamID}`, {
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


        console.log("Team: ", response)
        setTeamName(response.data[0].TeamName);

        setTeamMembers(response.data);

    }
}



