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
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '12px' }}>
                            <button
                                onClick={() => setShowAIAnswer(!showAIAnswer)}
                                style={{
                                    backgroundColor: showAIAnswer ? '#f1f3f4' : '#e8f0fe',
                                    color: showAIAnswer ? '#5f6368' : '#1a73e8',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                💡 {showAIAnswer ? "AI 모범 답안 접기" : "AI 모범 답안 확인하기"}
                            </button>
                            
                            {showAIAnswer && (
                                <div style={{
                                    marginTop: '10px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #dadce0',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    fontSize: '13px',
                                    color: '#333'
                                }}>
                                    <strong style={{ display: 'block', marginBottom: '6px', color: '#1a73e8' }}>[AI 추천 답변]</strong>
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{assignment.modelAnswer}</p>
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
                            <div className="submission-item" key={submission.submissionId} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="submission-header" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <strong>{submission.memberName}</strong>
                                        <span style={{ fontSize: '12px', color: '#888' }}>{submission.submittedAt}</span>
                                    </div>
                                    
                                    {gradingId !== submission.submissionId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {submission.score !== undefined && submission.score !== null ? (
                                                <>
                                                    <span style={{ 
                                                        backgroundColor: '#e6f4ea', 
                                                        color: '#137333', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '13px', 
                                                        fontWeight: 'bold' 
                                                    }}>
                                                        {submission.score}점
                                                    </span>
                                                    <button 
                                                        onClick={() => handleStartGrade(submission)}
                                                        style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f1f3f4', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        수정
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStartGrade(submission)}
                                                    style={{ 
                                                        padding: '6px 12px', 
                                                        fontSize: '12px', 
                                                        backgroundColor: '#1a73e8', 
                                                        border: 'none', 
                                                        borderRadius: '4px', 
                                                        cursor: 'pointer',
                                                        color: '#fff',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    채점하기
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <p style={{ margin: '4px 0 8px 0', fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>{submission.content}</p>

                                {gradingId !== submission.submissionId && submission.feedback && (
                                    <div style={{ backgroundColor: '#f8f9fa', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', borderLeft: '3px solid #1a73e8' }}>
                                        <strong style={{ color: '#1a73e8', display: 'block', marginBottom: '4px' }}>피드백</strong>
                                        <p style={{ margin: 0, color: '#5f6368' }}>{submission.feedback}</p>
                                    </div>
                                )}

                                {gradingId === submission.submissionId && (
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '10px', 
                                        backgroundColor: '#f8f9fa', 
                                        padding: '14px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #dadce0',
                                        marginTop: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>점수:</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="100" 
                                                value={scoreInput} 
                                                onChange={(e) => setScoreInput(e.target.value)}
                                                placeholder="0-100"
                                                style={{ width: '80px', padding: '6px', border: '1px solid #dadce0', borderRadius: '4px' }}
                                            />
                                            <span style={{ fontSize: '12px', color: '#666' }}>점 / 100점</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>피드백:</label>
                                            <textarea 
                                                value={feedbackInput} 
                                                onChange={(e) => setFeedbackInput(e.target.value)}
                                                placeholder="스터디원에게 전달할 피드백을 입력하세요."
                                                rows={3}
                                                style={{ padding: '8px', border: '1px solid #dadce0', borderRadius: '4px', resize: 'vertical', fontSize: '13px', fontFamily: 'inherit' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                                            <button 
                                                onClick={handleCancelGrade}
                                                disabled={isSubmitting}
                                                style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#fff', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                취소
                                            </button>
                                            <button 
                                                onClick={() => handleSubmitGrade(submission.submissionId)}
                                                disabled={isSubmitting}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '12px', 
                                                    backgroundColor: '#1a73e8', 
                                                    border: 'none', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer',
                                                    color: '#fff',
                                                    fontWeight: 'bold'
                                                }}
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