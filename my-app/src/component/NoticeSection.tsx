import React from "react";

type NoticeSectionProps = {
    notices: string[];
};

const NoticeSection: React.FC<NoticeSectionProps> = ({ notices }) => {
    return (
        <div className="content-card">
            <div className="card-title-row">
                <h3>공지사항</h3>
            </div>

            <ul className="notice-list">
                {notices.map((notice, index) => (
                    <li key={index}>{notice}</li>
                ))}
            </ul>
        </div>
    );
};

export default NoticeSection;