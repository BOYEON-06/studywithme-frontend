export type StudyParticipant = {
    id: number;
    name: string;
};

export type Study = {
    id: number;
    name: string;
    role: string;
    description?: string;
    inviteCode?: string;
    creatorName?: string;
    participants?: StudyParticipant[];
};