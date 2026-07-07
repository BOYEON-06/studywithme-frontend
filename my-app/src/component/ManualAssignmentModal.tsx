import React, { useState, useEffect } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

marked.setOptions({
    breaks: true,
});

type ManualAssignmentModalProps = {
    onClose: () => void;
    onCreate: (title: string, content: string, dueDate: string) => Promise<void>;
};

const ManualAssignmentModal: React.FC<ManualAssignmentModalProps> = ({
    onClose,
    onCreate,
}) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [creating, setCreating] = useState(false);
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
    }, [content, showPreview]);

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
        const textarea = document.getElementById("manual-assignment-textarea") as HTMLTextAreaElement;
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

    const handleCreate = async () => {
        if (!title.trim()) {
            alert("과제 제목을 입력하세요.");
            return;
        }

        if (!content.trim()) {
            alert("과제 내용을 입력하세요.");
            return;
        }

        if (!dueDate.trim()) {
            alert("마감일을 입력하세요.");
            return;
        }

        try {
            setCreating(true);
            const formattedDueDate = dueDate.replace("T", " ") + ":00";
            await onCreate(title, content, formattedDueDate);
            onClose();
        } catch (error) {
            console.error(error);
            alert("과제 생성에 실패했습니다. 로그인 상태 또는 권한을 확인해주세요.");
        } finally {
            setCreating(false);
        }
    };

    const handleClose = () => {
        if (creating) return;
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className={`study-modal manual-assignment-modal ${isMaximized ? 'maximized' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">Manual Assignment</p>
                        <h2>수동 과제 출제</h2>
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

                <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
                    <label style={{ display: 'block' }}>
                        과제 제목
                        <input
                            type="text"
                            placeholder="예: 첫 번째 과제 테스트"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </label>

                    <label style={{ display: 'block', marginBottom: '8px' }}>
                        마감일
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>
                            과제 내용
                        </label>
                        <div className="markdown-editor-split" style={{ height: '400px', marginTop: '8px' }}>
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
                                    id="manual-assignment-textarea"
                                    placeholder="과제 내용을 마크다운(Markdown) 문법을 사용해 입력하세요."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
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
                                        dangerouslySetInnerHTML={renderMarkdown(content || "*입력된 내용이 없습니다.*")}
                                        style={{ height: 'calc(100% - 42px)', overflowY: 'auto' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={handleClose}>
                        취소
                    </button>

                    <button
                        className="modal-submit-btn"
                        onClick={handleCreate}
                        disabled={creating}
                    >
                        {creating ? "등록 중..." : "과제 등록"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualAssignmentModal;