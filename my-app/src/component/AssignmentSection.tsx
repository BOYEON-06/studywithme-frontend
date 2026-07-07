import React from "react";
import type { Assignment } from "../types/assignment";

export type MemberWithProgress = {
    id: number;
    name: string;
    progressRate: number | null;
    isCreator: boolean;
};

type AssignmentSectionProps = {
    assignments: Assignment[];
    loading: boolean;
    isLeader: boolean;
    onOpenSubmitModal: (assignment: Assignment) => void;
    onOpenSubmissionListModal: (assignment: Assignment) => void;
    onOpenAllAssignmentsModal: () => void;
    members: MemberWithProgress[];
};

const AssignmentSection: React.FC<AssignmentSectionProps> = ({
    assignments,
    loading,
    isLeader,
    onOpenSubmitModal,
    onOpenSubmissionListModal,
    onOpenAllAssignmentsModal,
    members,
}) => {
    return (
        <div className="content-card large">
            <div className="card-title-row">
                <h3>출제된 과제</h3>
                <button onClick={onOpenAllAssignmentsModal}>전체보기</button>
            </div>

            {/* 스터디원 프로필 및 과제 참석률 영역 */}
            {members && members.length > 0 && (
                <div className="assignment-members-section">
                    <div className="member-profiles-container">
                        <span className="members-label">스터디원:</span>
                        <div className="member-avatar-list">
                            {members.map((member) => (
                                <div key={member.id} className="member-avatar-item" title={member.name}>
                                    <div className="member-avatar">
                                        {member.name ? member.name[0] : "U"}
                                    </div>
                                    <div className="member-avatar-info">
                                        <span className="member-avatar-name">{member.name}</span>
                                        {member.isCreator ? (
                                            <span className="member-avatar-role">스터디장</span>
                                        ) : (
                                            <span className="member-avatar-progress">
                                                {member.progressRate !== null ? `${member.progressRate}%` : "-"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="assignment-list">
                {loading && (
                    <p className="empty-text">과제 목록을 불러오는 중...</p>
                )}

                {!loading && assignments.length === 0 && (
                    <p className="empty-text">아직 표시할 과제가 없습니다.</p>
                )}

                {!loading &&
                    assignments.map((assignment) => (
                        <div className="assignment-item" key={assignment.id}>
                            <div className="assignment-info">
                                <p className="assignment-title">{assignment.title}</p>
                                <span className="assignment-due">
                                    마감일: {assignment.due}
                                </span>
                                <p className="assignment-content-preview">
                                    {assignment.content}
                                </p>
                            </div>

                            <div className="assignment-right">
                                {!(isLeader && assignment.status === "미제출") && (
                                    <span className={`status-badge ${assignment.status === "제출완료"
                                            ? "submitted"
                                            : assignment.status === "마감"
                                                ? "expired"
                                                : "pending"
                                        }`}>
                                        {assignment.status}
                                    </span>
                                )}

                                {isLeader ? (
                                    <button
                                        className="assignment-submit-btn"
                                        onClick={() => onOpenSubmissionListModal(assignment)}
                                    >
                                        제출 확인
                                    </button>
                                ) : (
                                    <button
                                        className="assignment-submit-btn"
                                        onClick={() => onOpenSubmitModal(assignment)}
                                        disabled={assignment.status === "마감"}
                                    >
                                        {assignment.status === "제출완료"
                                            ? "결과 확인"
                                            : assignment.status === "마감"
                                                ? "마감"
                                                : "제출"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default AssignmentSection;