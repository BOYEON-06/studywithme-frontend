import { request } from "./client";

export type ChatMessageItem = {
    id: number;
    studyId: number;
    sender: string;
    message: string;
    timestamp: string;
};

export async function getChatHistory(studyId: number) {
    return request<ChatMessageItem[]>(`/api/chat/${studyId}/history`);
}
