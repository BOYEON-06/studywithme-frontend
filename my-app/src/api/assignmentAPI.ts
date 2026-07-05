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
    dueDate: string;
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
    submittedContent?: string;
    submittedAt?: string;
    score?: number | null;
    feedback?: string | null;
    gradedAt?: string | null;
    modelAnswer?: string | null;
};

export type AssignmentSubmissionItem = {
    submissionId: number;
    memberId: number;
    memberName: string;
    content: string;
    submittedAt: string;
    score?: number | null;
    feedback?: string | null;
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

export type GradeSubmissionRequest = {
    score: number;
    feedback: string;
};

export type GradeSubmissionResponse = {
    message: string;
};

export async function gradeSubmission(
    submissionId: number,
    data: GradeSubmissionRequest
) {
    return request<GradeSubmissionResponse>(
        `/api/assignments/submissions/${submissionId}/grade`,
        {
            method: "POST",
            body: data,
        }
    );
}

export type ConfirmAIAssignmentRequest = {
    title: string;
    content: string;
    modelAnswer: string;
    dueDate: string;
};

export async function confirmAIAssignment(
    studyId: number,
    data: ConfirmAIAssignmentRequest
) {
    return request<CreateAssignmentResponse>(`/api/assignments/${studyId}/confirm-ai`, {
        method: "POST",
        body: data,
    });
}

export type LeaderAssignmentItem = {
    studyGroupId: number;
    studyTitle: string;
    assignmentGroups: {
        assignment: {
            studyId: number;
            assignmentId: number;
            creatorName: string;
            studyTitle: string;
            title: string;
            content: string;
            dueDate: string;
            isExpired: boolean;
            isSubmitted: boolean;
            submittedContent: string | null;
            submittedAt: string | null;
            score: number | null;
            feedback: string | null;
            gradedAt: string | null;
        };
        modelAnswer: string | null;
        submissions: {
            submissionId: number;
            memberId: number;
            memberName: string;
            content: string;
            submittedAt: string;
            score: number | null;
            feedback: string | null;
            gradedAt: string | null;
        }[];
    }[];
};

export async function getLeaderAssignments() {
    return request<LeaderAssignmentItem[]>("/api/assignments/leader");
}