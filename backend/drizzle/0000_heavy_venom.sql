CREATE TABLE "github_integrations" (
	"AccountID" varchar PRIMARY KEY NOT NULL,
	"UserID" uuid NOT NULL,
	"access_token" varchar NOT NULL,
	"refresh_token" varchar NOT NULL,
	"accountName" varchar NOT NULL,
	"url" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "githubcommits" (
	"CommitID" varchar PRIMARY KEY NOT NULL,
	"RepoID" varchar NOT NULL,
	"AccountID" varchar NOT NULL,
	"section" varchar,
	"name" varchar NOT NULL,
	"CommitUrl" varchar NOT NULL,
	"description" varchar,
	"date_created" TIMESTAMPTZ NOT NULL
);
--> statement-breakpoint
CREATE TABLE "githubrepos" (
	"RepoID" varchar PRIMARY KEY NOT NULL,
	"TeamID" uuid NOT NULL,
	"RepoName" varchar NOT NULL,
	"RepoUrl" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"InviteID" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"UserID" uuid NOT NULL,
	"TeamID" uuid NOT NULL,
	"SupervisorID" uuid NOT NULL,
	"status" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"TeamID" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"TeamName" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trello_integrations" (
	"AccountID" varchar PRIMARY KEY NOT NULL,
	"UserID" uuid NOT NULL,
	"access_token" varchar NOT NULL,
	"refresh_token" varchar NOT NULL,
	"accountName" varchar NOT NULL,
	"url" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"UserID" uuid PRIMARY KEY NOT NULL,
	"Role" varchar NOT NULL,
	"FirstName" varchar NOT NULL,
	"LastName" varchar NOT NULL,
	"Email" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_Email_unique" UNIQUE("Email")
);
--> statement-breakpoint
ALTER TABLE "github_integrations" ADD CONSTRAINT "github_integrations_UserID_users_UserID_fk" FOREIGN KEY ("UserID") REFERENCES "public"."users"("UserID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "githubcommits" ADD CONSTRAINT "githubcommits_RepoID_githubrepos_RepoID_fk" FOREIGN KEY ("RepoID") REFERENCES "public"."githubrepos"("RepoID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "githubrepos" ADD CONSTRAINT "githubrepos_TeamID_teams_TeamID_fk" FOREIGN KEY ("TeamID") REFERENCES "public"."teams"("TeamID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_UserID_users_UserID_fk" FOREIGN KEY ("UserID") REFERENCES "public"."users"("UserID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_TeamID_teams_TeamID_fk" FOREIGN KEY ("TeamID") REFERENCES "public"."teams"("TeamID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_SupervisorID_users_UserID_fk" FOREIGN KEY ("SupervisorID") REFERENCES "public"."users"("UserID") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trello_integrations" ADD CONSTRAINT "trello_integrations_UserID_users_UserID_fk" FOREIGN KEY ("UserID") REFERENCES "public"."users"("UserID") ON DELETE cascade ON UPDATE no action;