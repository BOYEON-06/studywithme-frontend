import { request } from "./client";

export type CheckNameResponse = {
    data: boolean;
    success: boolean;
    userName: string;
    message: string;
};

export type AuthContinueRequest = {
    name: string;
    password: string;
};

export type AuthUser = {
    id: number;
    name: string;
    createdAt: string;
};

export type AuthContinueResponse = {
    message: string;
    user: AuthUser;
    isNewMember: boolean;
};

export async function checkName(name: string) {
    return request<CheckNameResponse>(
        `/api/auth/check-name?name=${encodeURIComponent(name)}`
    );
}

export async function authContinue(data: AuthContinueRequest) {
    return request<AuthContinueResponse>("/api/auth/continue", {
        method: "POST",
        body: data,
    });
}