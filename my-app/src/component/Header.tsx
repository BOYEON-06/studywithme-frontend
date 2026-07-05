import React from "react";
import type { Study } from "../types/study";

type HeaderProps = {
    selectedStudy: Study | null;
    onOpenAIAssignmentModal: () => void;
    onOpenManualAssignmentModal: () => void;
};

const Header: React.FC<HeaderProps> = ({
    selectedStudy,
    onOpenAIAssignmentModal,
    onOpenManualAssignmentModal,
}) => {
    const isLeader = selectedStudy?.role === "스터디장";

    return (
        <header className="topbar">
            <div>
                <p className="topbar-path">
                    내 스터디 / {selectedStudy ? selectedStudy.name : "선택된 스터디 없음"}
                </p>

                <h1>{selectedStudy ? selectedStudy.name : "스터디를 선택하세요"}</h1>
            </div>

            <div className="topbar-actions">
                <button
                    className={`top-btn primary ${!isLeader ? "disabled-btn" : ""}`}
                    onClick={onOpenManualAssignmentModal}
                    disabled={!isLeader}
                >
                    {isLeader ? "수동 과제 출제" : "스터디장 전용"}
                </button>

                <button
                    className={`top-btn primary ${!isLeader ? "disabled-btn" : ""}`}
                    onClick={onOpenAIAssignmentModal}
                    disabled={!isLeader}
                >
                    {isLeader ? "AI 과제 출제" : "스터디장 전용"}
                </button>
            </div>
        </header>
    );
};

export default Header;