import React from "react";
import type { Study } from "../types/study";

type HeroSectionProps = {
    selectedStudy: Study | null;
    assignmentCount: number;
    progressRate: number;
    onCopyInviteCode: () => void;
    onOpenManageMembers: () => void;
    onDeleteStudy: () => void;
};

const HeroSection: React.FC<HeroSectionProps> = ({
    selectedStudy,
    assignmentCount,
    progressRate,
    onCopyInviteCode,
    onOpenManageMembers,
    onDeleteStudy,
}) => {
    return (
        <section className="hero-card">
            <div className="hero-left">
                <div className="hero-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span className="hero-badge" style={{ marginBottom: 0 }}>
                        {selectedStudy ? `${selectedStudy.role} 모드` : "스터디 없음"}
                    </span>
                    {selectedStudy?.role === "스터디장" && (
                        <button 
                            className="delete-study-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteStudy();
                            }}
                        >
                            ❌ 스터디 삭제
                        </button>
                    )}
                </div>

                <h2>
                    {selectedStudy
                        ? (selectedStudy.description || "등록된 스터디 설명이 없습니다.")
                        : "왼쪽에서 스터디를 생성하거나 참여하세요"}
                </h2>

                {!selectedStudy && (
                    <p>
                        AI 자동 퀴즈, 과제 분석, 팀 프로젝트 진행률 확인까지. 스터디 운영에 필요한 정보를 한 화면에서 빠르게 확인할 수 있습니다.
                    </p>
                )}

                <div className="hero-summary">
                    <div className="summary-box" style={{ position: 'relative' }}>
                        <h3>
                            {selectedStudy ? `${selectedStudy.participants?.length || 0}명` : "0명"}
                        </h3>

                        <p>참여 인원</p>
                        
                        {selectedStudy?.role === "스터디장" && (
                            <button 
                                className="manage-members-badge-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenManageMembers();
                                }}
                                title="스터디원 관리"
                            >
                                ⚙️ 관리
                            </button>
                        )}
                    </div>

                    <div className="summary-box">
                        <h3>
                            {selectedStudy ? `${assignmentCount}개` : "0개"}
                        </h3>

                        <p>진행중 과제</p>
                    </div>

                    <div 
                        className="summary-box"
                        onClick={onCopyInviteCode}
                        style={{ cursor: selectedStudy ? 'pointer' : 'default' }}
                        title={selectedStudy ? "클릭하여 초대코드 복사" : ""}
                    >
                        <h3>
                            {selectedStudy?.inviteCode || "-"}
                        </h3>

                        <p>초대코드 {selectedStudy ? "(클릭하여 복사)" : ""}</p>
                    </div>
                </div>
            </div>

            <div className="hero-right">
                <div className="progress-card">
                    <p className="progress-title">
                        이번 주 과제 진행률
                    </p>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: selectedStudy ? `${progressRate}%` : "0%",
                            }}
                        ></div>
                    </div>

                    <strong>
                        {selectedStudy ? `${progressRate}%` : "0%"}
                    </strong>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;