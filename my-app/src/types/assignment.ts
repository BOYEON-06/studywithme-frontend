export type Assignment = {
    id: number;
    studyId: number;
    title: string;
    content: string;
    due: string;
    status: "제출완료" | "미제출" | "마감";
};