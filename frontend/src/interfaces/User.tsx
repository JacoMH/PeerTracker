export interface User {
    UserID: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Role: string;
    access_token?: string;
}