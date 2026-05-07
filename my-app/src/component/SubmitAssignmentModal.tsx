import React, { useState } from "react";
import type { Assignment } from "../types/assignment";

type SubmitAssignmentModalProps = {
    assignment: Assignment;
    onClose: () => void;
    onSubmit: (content: string) => Promise<void>;
};

const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({
    assignment,
    onClose,
    onSubmit,
}) => {
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert("제출 내용을 입력하세요.");
            return;
        }

        try {
            setSubmitting(true);
            await onSubmit(content);
            onClose();
        } catch (error) {
            console.error(error);
            alert("과제 제출에 실패했습니다. 로그인 상태를 확인해주세요.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="study-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">Submit Assignment</p>
                        <h2>과제 제출</h2>
                    </div>

                    <button className="modal-close-btn" onClick={handleClose}>
                        ×
                    </button>
                </div>

                <div className="assignment-detail-box">
                    <h3>{assignment.title}</h3>
                    <p>{assignment.content}</p>
                    <span>마감일: {assignment.due}</span>
                </div>

                <div className="modal-form">
                    <label>
                        제출 내용
                        <textarea
                            placeholder="과제 답안을 입력하세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </label>
                </div>

                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={handleClose}>
                        취소
                    </button>

                    <button
                        className="modal-submit-btn"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "제출 중..." : "제출하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmitAssignmentModal;