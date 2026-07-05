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
    const isSubmitted = assignment.status === "제출완료";
    const [content, setContent] = useState(assignment.submittedContent || "");
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
                        <p className="modal-label">
                            {isSubmitted ? "Assignment Result" : "Submit Assignment"}
                        </p>
                        <h2>{isSubmitted ? "과제 결과 확인" : "과제 제출"}</h2>
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
                        {isSubmitted ? "제출한 내용" : "제출 내용"}
                        <textarea
                            placeholder={isSubmitted ? "" : "과제 답안을 입력하세요."}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            readOnly={isSubmitted}
                            style={isSubmitted ? { backgroundColor: '#f1f3f4', color: '#5f6368', cursor: 'not-allowed' } : {}}
                        />
                    </label>
                </div>

                {isSubmitted && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {assignment.score !== null && assignment.score !== undefined ? (
                            <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #137333', padding: '12px', borderRadius: '6px' }}>
                                <span style={{ fontWeight: 'bold', color: '#137333', display: 'block', fontSize: '13px', marginBottom: '4px' }}>채점 점수</span>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#137333' }}>{assignment.score}점 / 100점</span>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: '#f1f3f4', border: '1px solid #dadce0', padding: '12px', borderRadius: '6px' }}>
                                <span style={{ fontWeight: 'bold', color: '#5f6368', fontSize: '13px' }}>아직 채점되지 않았습니다.</span>
                            </div>
                        )}

                        {assignment.feedback && (
                            <div style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #1a73e8', padding: '12px', borderRadius: '6px' }}>
                                <span style={{ fontWeight: 'bold', color: '#1a73e8', display: 'block', fontSize: '13px', marginBottom: '4px' }}>스터디장 피드백</span>
                                <p style={{ margin: 0, color: '#5f6368', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{assignment.feedback}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    {isSubmitted ? (
                        <button className="modal-submit-btn" onClick={handleClose}>
                            확인
                        </button>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitAssignmentModal;