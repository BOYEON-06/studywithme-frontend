import React, { useState } from "react";
import type { Assignment } from "../types/assignment";
import type { Submission } from "../types/submission";

type SubmissionListModalProps = {
    assignment: Assignment;
    submissions: Submission[];
    loading: boolean;
    onClose: () => void;
    onGrade: (submissionId: number, score: number, feedback: string) => Promise<void>;
};

const SubmissionListModal: React.FC<SubmissionListModalProps> = ({
    assignment,
    submissions,
    loading,
    onClose,
    onGrade,
}) => {
    const [gradingId, setGradingId] = useState<number | null>(null);
    const [scoreInput, setScoreInput] = useState<string>("");
    const [feedbackInput, setFeedbackInput] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showAIAnswer, setShowAIAnswer] = useState<boolean>(false);

    const handleStartGrade = (submission: Submission) => {
        setGradingId(submission.submissionId);
        setScoreInput(submission.score !== undefined ? String(submission.score) : "");
        setFeedbackInput(submission.feedback || "");
    };

    const handleCancelGrade = () => {
        setGradingId(null);
        setScoreInput("");
        setFeedbackInput("");
    };

    const handleSubmitGrade = async (submissionId: number) => {
        const score = parseInt(scoreInput, 10);
        if (isNaN(score) || score < 0 || score > 100) {
            alert("점수는 0점에서 100점 사이로 입력해주세요.");
            return;
        }
        if (!feedbackInput.trim()) {
            alert("피드백을 입력해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);
            await onGrade(submissionId, score, feedbackInput);
            setGradingId(null);
            setScoreInput("");
            setFeedbackInput("");
        } catch (error) {
            // 에러는 부모 컴포넌트가 핸들링
        } finally {
            setIsSubmitting(false);
        }
    };

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

                    {assignment.modelAnswer && (
                        <div className="model-answer-section">
                            <button
                                onClick={() => setShowAIAnswer(!showAIAnswer)}
                                className={`model-answer-toggle-btn ${showAIAnswer ? "active" : ""}`}
                            >
                                💡 {showAIAnswer ? "AI 모범 답안 접기" : "AI 모범 답안 확인하기"}
                            </button>
                            
                            {showAIAnswer && (
                                <div className="model-answer-box">
                                    <strong className="model-answer-title">[AI 추천 답변]</strong>
                                    <p className="model-answer-text">{assignment.modelAnswer}</p>
                                </div>
                            )}
                        </div>
                    )}
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
                                <div className="submission-row">
                                    <div className="submission-header-info">
                                        <strong>{submission.memberName}</strong>
                                        <span className="submission-date">{submission.submittedAt}</span>
                                    </div>
                                    
                                    {gradingId !== submission.submissionId && (
                                        <div className="submission-actions">
                                            {submission.score !== undefined && submission.score !== null ? (
                                                <>
                                                    <span className="submission-score-badge">
                                                        {submission.score}점
                                                    </span>
                                                    <button 
                                                        onClick={() => handleStartGrade(submission)}
                                                        className="submission-edit-btn"
                                                    >
                                                        수정
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStartGrade(submission)}
                                                    className="submission-grade-btn"
                                                >
                                                    채점하기
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <p className="submission-content">{submission.content}</p>

                                {gradingId !== submission.submissionId && submission.feedback && (
                                    <div className="submission-feedback-box">
                                        <strong className="feedback-title">피드백</strong>
                                        <p className="feedback-text">{submission.feedback}</p>
                                    </div>
                                )}

                                {gradingId === submission.submissionId && (
                                    <div className="submission-grading-form">
                                        <div className="grading-score-row">
                                            <label className="grading-label">점수:</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="100" 
                                                value={scoreInput} 
                                                onChange={(e) => setScoreInput(e.target.value)}
                                                placeholder="0-100"
                                                className="grading-input"
                                            />
                                            <span className="grading-max-score">점 / 100점</span>
                                        </div>
                                        <div className="grading-feedback-row">
                                            <label className="grading-label">피드백:</label>
                                            <textarea 
                                                value={feedbackInput} 
                                                onChange={(e) => setFeedbackInput(e.target.value)}
                                                placeholder="스터디원에게 전달할 피드백을 입력하세요."
                                                rows={3}
                                                className="grading-textarea"
                                            />
                                        </div>
                                        <div className="grading-actions">
                                            <button 
                                                onClick={handleCancelGrade}
                                                disabled={isSubmitting}
                                                className="grading-cancel-btn"
                                            >
                                                취소
                                            </button>
                                            <button 
                                                onClick={() => handleSubmitGrade(submission.submissionId)}
                                                disabled={isSubmitting}
                                                className="grading-save-btn"
                                            >
                                                {isSubmitting ? "저장 중..." : "저장"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default SubmissionListModal;