import React from "react";

type Schedule = {
    title: string;
    time: string;
};

type ScheduleSectionProps = {
    schedules: Schedule[];
};

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedules }) => {
    return (
        <div className="content-card">
            <div className="card-title-row">
                <h3>다가오는 일정</h3>
            </div>

            <div className="schedule-list">
                {schedules.map((schedule, index) => (
                    <div className="schedule-item" key={index}>
                        <p>{schedule.title}</p>
                        <span>{schedule.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleSection;