export type Assignment = {
    id: number;
    studyId: number;
    title: string;
    content: string;
    due: string;
    status: "제출완료" | "미제출" | "마감";
    submittedContent?: string;
    submittedAt?: string;
    score?: number | null;
    feedback?: string | null;
    gradedAt?: string | null;
    modelAnswer?: string | null;
};