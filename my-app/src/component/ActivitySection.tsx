import React from "react";

const ActivitySection: React.FC = () => {
    return (
        <div className="content-card wide">
            <div className="card-title-row">
                <h3>스터디 활동 요약</h3>
            </div>

            <div className="activity-grid">
                <div className="activity-box">
                    <strong>24</strong>
                    <span>이번 주 생성된 AI 퀴즈</span>
                </div>

                <div className="activity-box">
                    <strong>18</strong>
                    <span>제출된 과제 수</span>
                </div>

                <div className="activity-box">
                    <strong>9</strong>
                    <span>실시간 채팅 참여자</span>
                </div>

                <div className="activity-box">
                    <strong>4</strong>
                    <span>예정된 일정</span>
                </div>
            </div>
        </div>
    );
};

export default ActivitySection;