// Every few minutes query the repo that the team has assigned and update the database
// https://medium.com/@anubhav020909/system-design-day-14-polling-the-simplest-communication-pattern-in-distributed-systems-ebd78057e9eb

// only do the calling for users that are logged in, show old data first until new fetch, store and materialized view calculations are done then do a notification maybe saying "refresh for new data"