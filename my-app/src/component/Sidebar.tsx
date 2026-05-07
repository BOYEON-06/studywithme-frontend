import React, { useState } from "react";
import type { Study } from "../types/study";

type SidebarProps = {
    studies: Study[];
    selectedStudy: Study | null;
    loading: boolean;
    onSelectStudy: (study: Study) => void;
    onOpenCreateModal: () => void;
    onOpenJoinModal: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
    studies,
    selectedStudy,
    loading,
    onSelectStudy,
    onOpenCreateModal,
    onOpenJoinModal,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    const handleLogout = () => {
        const confirmLogout = window.confirm("로그아웃 하시겠습니까?");

        if (!confirmLogout) return;

        localStorage.removeItem("user");

        window.location.href = "/";
    };

    return (
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <div>
                <div className="sidebar-top">
                    <div className="sidebar-header">
                        {sidebarOpen && (
                            <h2 className="workspace-title">
                                StudySpace
                            </h2>
                        )}

                        <button
                            className="toggle-btn"
                            onClick={() =>
                                setSidebarOpen(!sidebarOpen)
                            }
                        >
                            {sidebarOpen ? "◀" : "▶"}
                        </button>
                    </div>

                    {sidebarOpen && (
                        <div className="sidebar-user-card">
                            <div className="user-avatar">
                                {user?.name
                                    ? user.name[0]
                                    : "U"}
                            </div>

                            <div>
                                <p className="user-name">
                                    {user?.name || "사용자"}
                                </p>

                                <span className="user-role">
                                    AI Study Member
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sidebar-section">
                    {sidebarOpen && (
                        <p className="section-label">
                            내 스터디
                        </p>
                    )}

                    <div className="study-list">
                        {loading && sidebarOpen && (
                            <p className="study-empty-text">
                                스터디 목록 불러오는 중...
                            </p>
                        )}

                        {!loading &&
                            studies.length === 0 &&
                            sidebarOpen && (
                                <p className="study-empty-text">
                                    아직 참여 중인 스터디가 없습니다.
                                </p>
                            )}

                        {!loading &&
                            studies.map((study) => (
                                <button
                                    key={study.id}
                                    className={`study-item ${selectedStudy?.id ===
                                            study.id
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        onSelectStudy(study)
                                    }
                                >
                                    <span className="study-icon">
                                        📘
                                    </span>

                                    {sidebarOpen && (
                                        <span className="study-meta">
                                            <span className="study-name">
                                                {study.name}
                                            </span>

                                            <span className="study-role">
                                                {study.role}
                                            </span>
                                        </span>
                                    )}
                                </button>
                            ))}
                    </div>
                </div>

                <div className="sidebar-section sidebar-actions">
                    <button
                        className="action-btn primary"
                        onClick={onOpenCreateModal}
                    >
                        <span>＋</span>

                        {sidebarOpen && (
                            <span>스터디 생성</span>
                        )}
                    </button>

                    <button
                        className="action-btn secondary"
                        onClick={onOpenJoinModal}
                    >
                        <span>↗</span>

                        {sidebarOpen && (
                            <span>스터디 참여</span>
                        )}
                    </button>
                </div>
            </div>

            <div className="sidebar-bottom">
                <button
                    className="bottom-link"
                    onClick={handleLogout}
                >
                    <span>🚪</span>

                    {sidebarOpen && <span>로그아웃</span>}
                </button>

                <button className="bottom-link">
                    <span>⚙</span>

                    {sidebarOpen && <span>설정</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;