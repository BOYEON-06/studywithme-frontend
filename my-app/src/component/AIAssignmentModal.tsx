import React, { useState } from "react";
import {
    generateAIAssignment,
    confirmAIAssignment,
    type GenerateAIAssignmentResponse,
} from "../api/assignmentAPI";

type AIAssignmentModalProps = {
    studyId: number;
    onClose: () => void;
    onAssignmentCreated: () => void;
};

const AIAssignmentModal: React.FC<AIAssignmentModalProps> = ({
    studyId,
    onClose,
    onAssignmentCreated,
}) => {
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("중");
    const [additionalRequest, setAdditionalRequest] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GenerateAIAssignmentResponse | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [publishing, setPublishing] = useState(false);

    const handlePublish = async () => {
        if (!result) return;

        if (!dueDate.trim()) {
            alert("마감일을 입력하세요.");
            return;
        }

        try {
            setPublishing(true);
            const formattedDueDate = dueDate.replace("T", " ") + ":00";
            const res = await confirmAIAssignment(studyId, {
                title: result.title,
                content: result.content,
                modelAnswer: result.modelAnswer,
                dueDate: formattedDueDate,
            });
            alert(`${res.message}\n마감일: ${res.dueDate}`);
            onAssignmentCreated();
            onClose();
        } catch (error) {
            console.error(error);
            alert("AI 과제 출제에 실패했습니다.");
        } finally {
            setPublishing(false);
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            alert("과제 주제를 입력하세요.");
            return;
        }

        if (!difficulty.trim()) {
            alert("난이도를 입력하세요.");
            return;
        }

        try {
            setLoading(true);

            const data = await generateAIAssignment({
                topic,
                difficulty,
                additionalRequest,
            });

            setResult(data);
        } catch (error) {
            console.error(error);
            alert("AI 과제 생성에 실패했습니다. 로그인 상태 또는 권한을 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="study-modal ai-assignment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">AI Assignment</p>
                        <h2>AI 과제 출제</h2>
                    </div>

                    <button className="modal-close-btn" onClick={handleClose}>
                        ×
                    </button>
                </div>

                <div className="modal-form">
                    <label>
                        과제 주제
                        <input
                            type="text"
                            placeholder="예: 자바 인터페이스와 추상클래스"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </label>

                    <label>
                        난이도
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="하">하</option>
                            <option value="중">중</option>
                            <option value="상">상</option>
                        </select>
                    </label>

                    <label>
                        추가 요청사항
                        <textarea
                            placeholder="예: 학생들이 예시를 들어서 풀 수 있게 해줘"
                            value={additionalRequest}
                            onChange={(e) => setAdditionalRequest(e.target.value)}
                        />
                    </label>
                </div>

                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={handleClose}>
                        닫기
                    </button>

                    <button
                        className="modal-submit-btn"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? "생성 중..." : "AI 과제 생성"}
                    </button>
                </div>

                {result && (
                    <div className="ai-result-box">
                        <h3>{result.title}</h3>

                        <div className="ai-result-section">
                            <strong>과제 내용</strong>
                            <p>{result.content}</p>
                        </div>

                        <div className="ai-result-section">
                            <strong>모범 답안</strong>
                            <p>{result.modelAnswer}</p>
                        </div>

                        <div className="ai-publish-section" style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                            <label style={{ display: "block", marginBottom: "15px", fontWeight: "bold" }}>
                                마감일 설정
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        marginTop: "8px",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </label>
                            <button
                                className="modal-submit-btn"
                                onClick={handlePublish}
                                disabled={publishing}
                                style={{ width: "100%", padding: "12px", fontSize: "15px", fontWeight: "bold" }}
                            >
                                {publishing ? "출제 중..." : "이 문제로 과제 출제하기"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssignmentModal;