import { request } from "./client";

export type GenerateAIAssignmentRequest = {
    topic: string;
    difficulty: string;
    additionalRequest: string;
};

export type GenerateAIAssignmentResponse = {
    title: string;
    content: string;
    modelAnswer: string;
};

export type CreateAssignmentRequest = {
    title: string;
    content: string;
};

export type CreateAssignmentResponse = {
    message: string;
    assignmentId: number;
    dueDate: string;
};

export type SubmitAssignmentRequest = {
    content: string;
};

export type SubmitAssignmentResponse = {
    submissionId: number;
    message: string;
};

export type MyAssignmentItem = {
    studyId: number;
    assignmentId: number;
    creatorName: string;
    studyTitle: string;
    title: string;
    content: string;
    dueDate: string;
    isExpired: boolean;
    isSubmitted: boolean;
};

export type AssignmentSubmissionItem = {
    submissionId: number;
    memberId: number;
    memberName: string;
    content: string;
    submittedAt: string;
};

export async function generateAIAssignment(data: GenerateAIAssignmentRequest) {
    return request<GenerateAIAssignmentResponse>("/api/assignments/generate-ai", {
        method: "POST",
        body: data,
    });
}

export async function createManualAssignment(
    studyId: number,
    data: CreateAssignmentRequest
) {
    return request<CreateAssignmentResponse>(`/api/assignments/${studyId}`, {
        method: "POST",
        body: data,
    });
}

export async function submitAssignment(
    studyId: number,
    assignmentId: number,
    data: SubmitAssignmentRequest
) {
    return request<SubmitAssignmentResponse>(
        `/api/assignments/${studyId}/submit/${assignmentId}`,
        {
            method: "POST",
            body: data,
        }
    );
}

export async function getAssignmentSubmissions(
    studyId: number,
    assignmentId: number
) {
    return request<AssignmentSubmissionItem[]>(
        `/api/assignments/${studyId}/submissions/${assignmentId}`
    );
}

export async function getMyAssignments() {
    return request<MyAssignmentItem[]>("/api/assignments/my-assignments");
}