import { request } from "./client";

export type StudyListItem = {
    id: number;
    title: string;
    description: string;
    inviteCode: string;
    creatorName: string;
    participants: { id: number; name: string }[];
};

export type CreateStudyRequest = {
    title: string;
    description: string;
};

export type CreateStudyResponse = {
    id: number;
    title: string;
    inviteCode: string;
    message: string;
};

export type JoinStudyRequest = {
    inviteCode: string;
};

export type JoinStudyResponse = {
    message: string;
    studyTitle: string;
};

export async function getMyStudyList() {
    return request<StudyListItem[]>("/api/studies/mystudylist");
}

export async function createStudy(data: CreateStudyRequest) {
    return request<CreateStudyResponse>("/api/studies/create", {
        method: "POST",
        body: data,
    });
}

export async function joinStudy(data: JoinStudyRequest) {
    return request<JoinStudyResponse>("/api/studies/join", {
        method: "POST",
        body: data,
    });
}

export type RemoveMemberResponse = {
    message: string;
};

export async function removeStudyMember(studyId: number, memberId: number) {
    return request<RemoveMemberResponse>(`/api/studies/${studyId}/members/${memberId}`, {
        method: "DELETE",
    });
}

export async function deleteStudy(studyId: number) {
    return request<void>(`/api/studies/${studyId}`, {
        method: "DELETE",
    });
}