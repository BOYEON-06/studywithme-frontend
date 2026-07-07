import React, { useState, useEffect } from "react";
import {
    generateAIAssignment,
    confirmAIAssignment,
    type GenerateAIAssignmentResponse,
} from "../api/assignmentAPI";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

marked.setOptions({
    breaks: true,
});

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
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");
    const [showModelAnswer, setShowModelAnswer] = useState(false);
    const [dueDate, setDueDate] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleToggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    useEffect(() => {
        const codeBlocks = document.querySelectorAll(".markdown-body pre code");
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, [editedContent, showPreview]);

    const renderMarkdown = (text: string) => {
        try {
            const rawMarkup = marked.parse(text) as string;
            return { __html: rawMarkup };
        } catch (e) {
            console.error(e);
            return { __html: text };
        }
    };

    const handleToolbarClick = (syntax: string, placeholder = "") => {
        const textarea = document.getElementById("ai-assignment-textarea") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        let replacement = "";
        if (syntax === "bold") {
            replacement = `**${selected || placeholder || "굵은 텍스트"}**`;
        } else if (syntax === "italic") {
            replacement = `*${selected || placeholder || "기울임 텍스트"}*`;
        } else if (syntax === "h1") {
            replacement = `\n# ${selected || placeholder || "제목 1"}\n`;
        } else if (syntax === "h2") {
            replacement = `\n## ${selected || placeholder || "제목 2"}\n`;
        } else if (syntax === "code") {
            replacement = `\`${selected || placeholder || "코드"}\``;
        } else if (syntax === "codeblock") {
            replacement = `\n\`\`\`javascript\n${selected || placeholder || "// 코드 입력"}\n\`\`\`\n`;
        } else if (syntax === "link") {
            replacement = `[${selected || placeholder || "링크 텍스트"}](https://example.com)`;
        }

        const newContent = text.substring(0, start) + replacement + text.substring(end);
        setEditedContent(newContent);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + replacement.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handlePublish = async () => {
        if (!result) return;

        if (!editedTitle.trim()) {
            alert("과제 제목을 입력하세요.");
            return;
        }

        if (!editedContent.trim()) {
            alert("과제 내용을 입력하세요.");
            return;
        }

        if (!dueDate.trim()) {
            alert("마감일을 입력하세요.");
            return;
        }

        try {
            setPublishing(true);
            const formattedDueDate = dueDate.replace("T", " ") + ":00";
            const res = await confirmAIAssignment(studyId, {
                title: editedTitle,
                content: editedContent,
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
            setEditedTitle(data.title);
            setEditedContent(data.content);
            setShowModelAnswer(false);
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
            <div className={`study-modal ai-assignment-modal ${isMaximized ? 'maximized' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">AI Assignment</p>
                        <h2>AI 과제 출제</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                            type="button" 
                            className="modal-max-btn" 
                            onClick={handleToggleMaximize}
                            title={isMaximized ? "이전 크기로 복원" : "전체화면"}
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "12px",
                                background: "#f3f4f6",
                                color: "#4b5563",
                                border: "none",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {isMaximized ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/>
                                </svg>
                            ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                </svg>
                            )}
                        </button>
                        <button className="modal-close-btn" onClick={handleClose}>
                            ×
                        </button>
                    </div>
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

                {loading && (
                    <div className="ai-loading-shimmer">
                        <div className="shimmer-title"></div>
                        <div className="shimmer-section">
                            <div className="shimmer-label"></div>
                            <div className="shimmer-line long"></div>
                            <div className="shimmer-line medium"></div>
                            <div className="shimmer-line short"></div>
                        </div>
                        <div className="shimmer-section">
                            <div className="shimmer-label"></div>
                            <div className="shimmer-line long"></div>
                            <div className="shimmer-line short"></div>
                        </div>
                    </div>
                )}

                {result && !loading && (
                    <div className="ai-result-box fade-in">
                        <div className="ai-result-section">
                            <label className="ai-edit-label">
                                <strong>과제 제목</strong>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    placeholder="과제 제목"
                                />
                            </label>
                        </div>

                         <div className="ai-result-section" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <strong>과제 내용</strong>
                            <div className="markdown-editor-split" style={{ height: '400px', marginTop: '8px', marginBottom: '12px' }}>
                                <div className="editor-left-pane">
                                    <div className="pane-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '34px', marginBottom: '8px' }}>
                                        <span className="pane-header">작성하기</span>
                                        <div className="markdown-toolbar" style={{ display: 'flex', alignItems: 'center' }}>
                                            <button type="button" onClick={() => handleToolbarClick("h1", "제목 1")} title="제목 1 (H1)">H1</button>
                                            <button type="button" onClick={() => handleToolbarClick("h2", "제목 2")} title="제목 2 (H2)">H2</button>
                                            <button type="button" onClick={() => handleToolbarClick("bold", "텍스트")} style={{ fontWeight: 'bold' }} title="굵게 (Bold)">B</button>
                                            <button type="button" onClick={() => handleToolbarClick("italic", "텍스트")} style={{ fontStyle: 'italic' }} title="기울임 (Italic)">I</button>
                                            <button type="button" onClick={() => handleToolbarClick("code", "코드")} title="인라인 코드">Code</button>
                                            <button type="button" onClick={() => handleToolbarClick("codeblock", "// 코드 작성")} title="코드 블록">Code Block</button>
                                            <button type="button" onClick={() => handleToolbarClick("link", "링크 텍스트")} title="하이퍼링크">Link</button>

                                            <button 
                                                type="button" 
                                                className={`preview-toggle-btn ${showPreview ? 'active' : ''}`}
                                                onClick={() => setShowPreview(!showPreview)} 
                                                title={showPreview ? "미리보기 숨기기" : "미리보기 보이기"}
                                                style={{
                                                    marginLeft: '8px',
                                                    background: showPreview ? '#eef2ff' : '#ffffff',
                                                    color: showPreview ? '#4f46e5' : '#4b5563',
                                                    borderColor: showPreview ? '#c7d2fe' : '#d1d5db',
                                                    padding: '4px 8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 'bold',
                                                    border: '1px solid',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    {showPreview ? (
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                                    ) : (
                                                        <>
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                                        </>
                                                    )}
                                                </svg>
                                                {showPreview ? "미리보기 켬" : "미리보기 끔"}
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        id="ai-assignment-textarea"
                                        placeholder="과제 내용을 마크다운(Markdown) 문법을 사용해 입력하세요."
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        style={{ height: 'calc(100% - 42px)', resize: 'none' }}
                                    />
                                </div>
                                {showPreview && (
                                    <div className="editor-right-pane">
                                        <div className="pane-header-container" style={{ display: 'flex', alignItems: 'center', height: '34px', marginBottom: '8px' }}>
                                            <span className="pane-header">실시간 미리보기</span>
                                        </div>
                                        <div 
                                            className="markdown-preview markdown-body"
                                            dangerouslySetInnerHTML={renderMarkdown(editedContent || "*입력된 내용이 없습니다.*")}
                                            style={{ height: 'calc(100% - 42px)', overflowY: 'auto' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ai-result-section">
                            <div className="ai-model-answer-header">
                                <strong>모범 답안</strong>
                                <button
                                    type="button"
                                    className="ai-toggle-btn"
                                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                                >
                                    {showModelAnswer ? "접기 ▲" : "보기 ▼"}
                                </button>
                            </div>
                            {showModelAnswer && <p className="ai-model-answer-content">{result.modelAnswer}</p>}
                        </div>

                        <div className="ai-publish-section">
                            <label className="publish-due-label">
                                마감일 설정
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="publish-due-input"
                                />
                            </label>
                            <button
                                className="modal-submit-btn publish-submit-btn"
                                onClick={handlePublish}
                                disabled={publishing}
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