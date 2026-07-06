import React from "react";
import type { Assignment } from "../types/assignment";

type AssignmentSectionProps = {
    assignments: Assignment[];
    loading: boolean;
    isLeader: boolean;
    onOpenSubmitModal: (assignment: Assignment) => void;
    onOpenSubmissionListModal: (assignment: Assignment) => void;
    onOpenAllAssignmentsModal: () => void;
};

const AssignmentSection: React.FC<AssignmentSectionProps> = ({
    assignments,
    loading,
    isLeader,
    onOpenSubmitModal,
    onOpenSubmissionListModal,
    onOpenAllAssignmentsModal,
}) => {
    return (
        <div className="content-card large">
            <div className="card-title-row">
                <h3>출제된 과제</h3>
                <button onClick={onOpenAllAssignmentsModal}>전체보기</button>
            </div>

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
                                <span className={`status-badge ${assignment.status === "제출완료"
                                        ? "submitted"
                                        : assignment.status === "마감"
                                            ? "expired"
                                            : "pending"
                                    }`}>
                                    {assignment.status}
                                </span>

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