import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    UserID: uuid("UserID").primaryKey().notNull(),
    Role: varchar("Role").notNull(),
    FirstName: varchar("FirstName").notNull(),
    LastName: varchar("LastName").notNull(),
    Email: varchar("Email").notNull().unique(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    GDPR_Agreement: boolean("GDPR_Agreement").default(false)
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
    SupervisorID: uuid("SupervisorID").references(() => users.UserID, { onDelete: "set null" }),
    status: varchar("status").notNull()
})

export const github_integrations = pgTable("github_integrations", {
    AccountID: varchar("AccountID").primaryKey().notNull(),
    UserID: uuid("UserID").notNull().references(() => users.UserID, { onDelete: "cascade" }),
    access_token: varchar("access_token").notNull(),
    accountName: varchar("accountName").notNull(),
    url: varchar("url").notNull(),

})

export const githubrepos = pgTable("githubrepos", {
    RepoID: varchar("RepoID").primaryKey().notNull(),
    TeamID: uuid("TeamID").notNull().references(() => teams.TeamID, { onDelete: "cascade" }),
    RepoName: varchar("RepoName").notNull(),
    RepoUrl: varchar("RepoUrl").notNull(),
    Webhook: varchar("Webhook"),
    access_token: varchar("access_token")
})

export const githubcommits = pgTable("githubcommits", {
    CommitID: varchar("CommitID").primaryKey().notNull(),
    RepoID: varchar("RepoID").notNull().references(() => githubrepos.RepoID, { onDelete: "cascade" }),
    AccountID: varchar("AccountID").notNull(),
    CommitUrl: varchar("CommitUrl").notNull(),
    description: varchar("description"),
    date_created: timestamp("date_created", { withTimezone: true, mode: 'date' }).notNull()
})

export const trello_integrations = pgTable("trello_integrations", {
    AccountID: varchar("AccountID").primaryKey().notNull(),
    UserID: uuid("UserID").notNull().references(() => users.UserID, { onDelete: "cascade" }),
    access_token: varchar("access_token").notNull(),
    accountName: varchar("accountName").notNull(),
    url: varchar("url").notNull(),
})

export const TrelloBoard = pgTable("TrelloBoard", {
    BoardID: varchar("BoardID").primaryKey().notNull(),
    TeamID: uuid("TeamID").notNull().references(() => teams.TeamID, { onDelete: "cascade" }),
    BoardName: varchar("BoardName").notNull(),
    BoardUrl: varchar("BoardUrl").notNull(),
    Webhook: varchar("Webhook"),
    access_token: varchar("access_token")
})

export const TrelloAction = pgTable("TrelloAction", {
    ActionID: varchar("ActionID").primaryKey().notNull(),
    BoardID: varchar("BoardID").notNull().references(() => TrelloBoard.BoardID, { onDelete: "cascade" }),
    CardID: varchar("CardID").references(() => TrelloCard.CardID, { onDelete: "cascade" }),
    AccountID: varchar("AccountID").notNull(),
    type: varchar("type").notNull(),
    oldData: varchar("oldData"),
    date_created: timestamp("date_created", { withTimezone: true, mode: 'date' }).notNull()
})

export const TrelloCard = pgTable("TrelloCard", {
    CardID: varchar("CardID").primaryKey().notNull(),
    BoardID: varchar("BoardID").notNull().references(() => TrelloBoard.BoardID, { onDelete: "cascade" }),
    ListID: varchar("ListID").notNull().references(() => TrelloList.ListID, { onDelete: "cascade" }),
    name: varchar("name"),
    dueComplete: varchar("dueComplete"),
    dueDate: varchar("dueDate"),
})

export const TrelloList = pgTable("TrelloList", {
    ListID: varchar("ListID").primaryKey().notNull(),
    BoardID: varchar("BoardID").notNull().references(() => TrelloBoard.BoardID, { onDelete: "cascade" }),
    name: varchar("name"),
    closed: varchar("closed"),
    position: varchar("position"),
})

export const AssignedCard = pgTable("AssignedCard", {
    AssignedID: uuid("AssignedID").primaryKey().defaultRandom().notNull(),
    CardID: varchar("CardID").notNull().references(() => TrelloCard.CardID, { onDelete: "cascade" }),
    AccountID: varchar("AccountID").notNull(),
})

export const Notification = pgTable("Notification", {
    ReportID: uuid("ReportID").primaryKey().defaultRandom().notNull(),
    UserID: uuid("UserID").references(() => users.UserID, { onDelete: "cascade" }),
    ReportedUserID: uuid("ReportedUserID").notNull().references(() => users.UserID, { onDelete: "cascade" }),
    TeamID: uuid("TeamID").notNull().references(() => teams.TeamID, { onDelete: "cascade" }),
    Description: varchar("Description").notNull(),
    Type: varchar("Type").notNull()
})


