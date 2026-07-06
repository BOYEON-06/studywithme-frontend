import React, { useState, useRef, useEffect } from "react";
import type { Assignment } from "../types/assignment";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

marked.setOptions({
    breaks: true,
});

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
    const [showPreview, setShowPreview] = useState(false);

    const [isMaximized, setIsMaximized] = useState(false);
    const prevSizeAndPos = useRef<{ width: number, height: number, x: number | null, y: number | null }>({
        width: 1000,
        height: 820,
        x: null,
        y: null
    });

    const handleToggleMaximize = () => {
        if (!isMaximized) {
            prevSizeAndPos.current = {
                width: size.width,
                height: size.height,
                x: position.x,
                y: position.y
            };
            setSize({ width: window.innerWidth, height: window.innerHeight });
            setPosition({ x: 0, y: 0 });
        } else {
            const backup = prevSizeAndPos.current;
            setSize({ width: backup.width, height: backup.height });
            setPosition({ x: backup.x, y: backup.y });
        }
        setIsMaximized(!isMaximized);
    };

    const modalRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 1000, height: 820 });
    const [position, setPosition] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
    const dragInfo = useRef<{
        direction: string;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
        startLeft: number;
        startTop: number;
    } | null>(null);

    useEffect(() => {
        if (modalRef.current && position.x === null) {
            const rect = modalRef.current.getBoundingClientRect();
            setPosition({ x: rect.left, y: rect.top });
        }
    }, [position.x]);

    useEffect(() => {
        const codeBlocks = document.querySelectorAll(".markdown-body pre code");
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, [content, isMaximized]);

    const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
        if (isMaximized) return;
        e.preventDefault();
        e.stopPropagation();
        if (!modalRef.current) return;

        const rect = modalRef.current.getBoundingClientRect();
        dragInfo.current = {
            direction,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: rect.width,
            startHeight: rect.height,
            startLeft: rect.left,
            startTop: rect.top,
        };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!dragInfo.current || !modalRef.current) return;
            const info = dragInfo.current;
            const deltaX = moveEvent.clientX - info.startX;
            const deltaY = moveEvent.clientY - info.startY;

            let newWidth = info.startWidth;
            let newHeight = info.startHeight;
            let newLeft = info.startLeft;
            let newTop = info.startTop;

            const minWidth = 100;
            const minHeight = 100;

            if (info.direction.includes("right")) {
                newWidth = Math.max(minWidth, info.startWidth + deltaX);
            }
            if (info.direction.includes("left")) {
                const computedWidth = info.startWidth - deltaX;
                if (computedWidth >= minWidth) {
                    newWidth = computedWidth;
                    newLeft = info.startLeft + deltaX;
                }
            }
            if (info.direction.includes("bottom")) {
                newHeight = Math.max(minHeight, info.startHeight + deltaY);
            }
            if (info.direction.includes("top")) {
                const computedHeight = info.startHeight - deltaY;
                if (computedHeight >= minHeight) {
                    newHeight = computedHeight;
                    newTop = info.startTop + deltaY;
                }
            }

            setSize({ width: newWidth, height: newHeight });
            setPosition({ x: newLeft, y: newTop });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            dragInfo.current = null;
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        if ((e.target as HTMLElement).closest('button')) return;
        
        e.preventDefault();
        if (!modalRef.current) return;

        const rect = modalRef.current.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = rect.left;
        const startTop = rect.top;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            setPosition({
                x: startLeft + deltaX,
                y: startTop + deltaY
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

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
        const textarea = document.getElementById("assignment-textarea") as HTMLTextAreaElement;
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
        setContent(newContent);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + replacement.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

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
        <div 
            className="modal-overlay" 
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div 
                ref={modalRef}
                className={`study-modal submit-assignment-modal resizable-modal ${isMaximized ? 'maximized' : ''}`}
                style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    position: position.x !== null ? 'fixed' : 'relative',
                    left: position.x !== null ? `${position.x}px` : 'auto',
                    top: position.y !== null ? `${position.y}px` : 'auto',
                    margin: position.x !== null ? 0 : 'auto',
                    borderRadius: isMaximized ? '0' : '24px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 4꼭짓점 리사이즈 핸들러 */}
                {!isSubmitted && !isMaximized && (
                    <>
                        <div className="resize-handle top-left" onMouseDown={(e) => handleResizeMouseDown(e, "top-left")} />
                        <div className="resize-handle top-right" onMouseDown={(e) => handleResizeMouseDown(e, "top-right")} />
                        <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")} />
                        <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")} />
                    </>
                )}

                <div 
                    className="modal-header" 
                    onMouseDown={handleHeaderMouseDown} 
                    style={{ 
                        cursor: isMaximized ? 'default' : 'move', 
                        userSelect: 'none' 
                    }}
                >
                    <div>
                        <p className="modal-label">
                            {isSubmitted ? "Assignment Result" : "Submit Assignment"}
                        </p>
                        <h2>{isSubmitted ? "과제 결과 확인" : "과제 제출"}</h2>
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

                <div className="assignment-detail-box">
                    <h3>{assignment.title}</h3>
                    <p>{assignment.content}</p>
                    <span>마감일: {assignment.due}</span>
                </div>

                <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>
                        {isSubmitted ? "제출한 내용" : "제출 내용"}
                    </label>
                    {isSubmitted ? (
                        <div 
                            className="markdown-preview markdown-body"
                            style={{ maxHeight: '400px', backgroundColor: '#f8f9fa' }}
                            dangerouslySetInnerHTML={renderMarkdown(content || "*제출된 내용이 없습니다.*")}
                        />
                    ) : (
                        <div className="markdown-editor-split">
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
                                    id="assignment-textarea"
                                    placeholder="과제 답안을 마크다운(Markdown) 문법을 사용해 입력하세요."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                            {showPreview && (
                                <div className="editor-right-pane">
                                    <div className="pane-header-container" style={{ display: 'flex', alignItems: 'center', height: '34px', marginBottom: '8px' }}>
                                        <span className="pane-header">실시간 미리보기</span>
                                    </div>
                                    <div 
                                        className="markdown-preview markdown-body"
                                        dangerouslySetInnerHTML={renderMarkdown(content || "*입력된 내용이 없습니다.*")}
                                    />
                                </div>
                            )}
                        </div>
                    )}
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