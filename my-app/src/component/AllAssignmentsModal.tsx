import React from "react";
import type { Assignment } from "../types/assignment";

type AllAssignmentsModalProps = {
    assignments: Assignment[];
    isLeader: boolean;
    onClose: () => void;
    onOpenSubmitModal: (assignment: Assignment) => void;
    onOpenSubmissionListModal: (assignment: Assignment) => void;
};

const AllAssignmentsModal: React.FC<AllAssignmentsModalProps> = ({
    assignments,
    isLeader,
    onClose,
    onOpenSubmitModal,
    onOpenSubmissionListModal,
}) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="study-modal all-assignments-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">Assignments</p>
                        <h2>과제 전체보기</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="all-assignments-content">
                    {assignments.length === 0 ? (
                        <p className="empty-text">출제된 과제가 아직 없습니다.</p>
                    ) : (
                        <div className="assignments-table-container">
                            <table className="assignments-table">
                                <thead>
                                    <tr>
                                        <th>상태</th>
                                        <th>과제명</th>
                                        <th>마감일</th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id}>
                                            <td>
                                                <span className={`status-badge ${
                                                    assignment.status === "제출완료"
                                                        ? "submitted"
                                                        : assignment.status === "마감"
                                                            ? "expired"
                                                            : "pending"
                                                }`}>
                                                    {assignment.status}
                                                </span>
                                            </td>
                                            <td className="assignment-title-cell">
                                                <div className="assignment-cell-title">{assignment.title}</div>
                                                <div className="assignment-cell-desc">{assignment.content}</div>
                                            </td>
                                            <td className="assignment-due-cell">{assignment.due}</td>
                                            <td>
                                                {isLeader ? (
                                                    <button
                                                        className="assignment-action-btn primary"
                                                        onClick={() => {
                                                            onClose();
                                                            onOpenSubmissionListModal(assignment);
                                                        }}
                                                    >
                                                        제출 확인
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="assignment-action-btn primary"
                                                        onClick={() => {
                                                            onClose();
                                                            onOpenSubmitModal(assignment);
                                                        }}
                                                        disabled={assignment.status === "마감"}
                                                    >
                                                        {assignment.status === "제출완료" ? "결과 확인" : "제출하기"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllAssignmentsModal;
