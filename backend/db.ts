import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    UserID: uuid("UserID").primaryKey().notNull(),
    Role: varchar("Role").notNull(),
    FirstName: varchar("FirstName").notNull(),
    LastName: varchar("LastName").notNull(),
    Email: varchar("Email").notNull().unique(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const teams = pgTable("teams", {
    TeamID: uuid("TeamID").primaryKey().defaultRandom().notNull(),
    TeamName: varchar("TeamName").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const invites = pgTable("invites", {
    InviteID: uuid("InviteID").primaryKey().defaultRandom().notNull(),
    UserID: uuid("UserID").notNull().references(() => users.UserID, { onDelete: "cascade" }),
    TeamID: uuid("TeamID").notNull().references(() => teams.TeamID, { onDelete: "cascade" }),
    SupervisorID: uuid("SupervisorID").notNull().references(() => users.UserID, { onDelete: "set null" }),
    status: varchar("status").notNull()
})

export const github_integrations = pgTable("github_integrations", {
    AccountID: varchar("AccountID").primaryKey().notNull(),
    UserID: uuid("UserID").notNull().references(() => users.UserID, { onDelete: "cascade" }),
    access_token: varchar("access_token").notNull(),
    refresh_token: varchar("refresh_token").notNull(),
    accountName: varchar("accountName").notNull(),
    url: varchar("url").notNull(),

})

export const githubrepos = pgTable("githubrepos", {
    RepoID: varchar("RepoID").primaryKey().notNull(),
    TeamID: uuid("TeamID").notNull().references(() => teams.TeamID, { onDelete: "cascade" }),
    RepoName: varchar("RepoName").notNull(),
    RepoUrl: varchar("RepoUrl").notNull(),
})

export const githubcommits = pgTable("githubcommits", {
    CommitID: varchar("CommitID").primaryKey().notNull(),
    RepoID: varchar("RepoID").notNull().references(() => githubrepos.RepoID, { onDelete: "cascade" }),
    AccountID: varchar("AccountID").notNull(),
    section: varchar("section"),
    name: varchar("name").notNull(),
    CommitUrl: varchar("CommitUrl").notNull(),
    description: varchar("description"),
    date_created: timestamp("date_created").notNull().defaultNow(),
})

export const trello_integrations = pgTable("trello_integrations", {
    AccountID: varchar("AccountID").primaryKey().notNull(),
    UserID: uuid("UserID").notNull().references(() => users.UserID, { onDelete: "cascade" }),
    access_token: varchar("access_token").notNull(),
    refresh_token: varchar("refresh_token").notNull(),
    accountName: varchar("accountName").notNull(),
    url: varchar("url").notNull(),
})

