import React from "react";
import type { Assignment } from "../types/assignment";
import type { Submission } from "../types/submission";

type SubmissionListModalProps = {
    assignment: Assignment;
    submissions: Submission[];
    loading: boolean;
    onClose: () => void;
};

const SubmissionListModal: React.FC<SubmissionListModalProps> = ({
    assignment,
    submissions,
    loading,
    onClose,
}) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="study-modal submission-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">Submissions</p>
                        <h2>과제 제출 확인</h2>
                    </div>

                    <button className="modal-close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="assignment-detail-box">
                    <h3>{assignment.title}</h3>
                    <p>{assignment.content}</p>
                    <span>마감일: {assignment.due}</span>
                </div>

                <div className="submission-list">
                    {loading && (
                        <p className="empty-text">제출 목록을 불러오는 중...</p>
                    )}

                    {!loading && submissions.length === 0 && (
                        <p className="empty-text">아직 제출한 스터디원이 없습니다.</p>
                    )}

                    {!loading &&
                        submissions.map((submission) => (
                            <div className="submission-item" key={submission.submissionId}>
                                <div className="submission-header">
                                    <strong>{submission.memberName}</strong>
                                    <span>{submission.submittedAt}</span>
                                </div>

                                <p>{submission.content}</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default SubmissionListModal;