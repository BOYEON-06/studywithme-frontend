import React, { useState } from "react";
import type { Study, StudyParticipant } from "../types/study";
import ConfirmModal from "./ConfirmModal";

type ManageMembersModalProps = {
    study: Study;
    onClose: () => void;
    onRemoveMember: (memberId: number) => void;
};

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
    study,
    onClose,
    onRemoveMember,
}) => {
    const [confirmingMember, setConfirmingMember] = useState<StudyParticipant | null>(null);

    const handleRemoveClick = (member: StudyParticipant) => {
        setConfirmingMember(member);
    };

    const handleConfirmRemove = () => {
        if (confirmingMember) {
            onRemoveMember(confirmingMember.id);
            setConfirmingMember(null);
        }
    };

    const handleCancelRemove = () => {
        setConfirmingMember(null);
    };

    const participants = study.participants || [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="study-modal manage-members-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">Members</p>
                        <h2>스터디원 관리</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="manage-members-content">
                    <p className="manage-members-desc">
                        현재 스터디에 참여 중인 멤버 목록입니다. 스터디장 권한으로 관리할 수 있습니다.
                    </p>
                    
                    {participants.length === 0 ? (
                        <p className="empty-text">참여 중인 스터디원이 없습니다.</p>
                    ) : (
                        <div className="member-list">
                            {participants.map((member) => (
                                <div className="member-card" key={member.id}>
                                    <div className="member-info-row">
                                        <div className="member-avatar-mini">
                                            {member.name[0] || "U"}
                                        </div>
                                        <div className="member-name-details">
                                            <span className="member-list-name">{member.name}</span>
                                            <span className="member-list-role">
                                                {member.name === study.creatorName ? "스터디장" : "스터디원"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {member.name !== study.creatorName && (
                                        <button
                                            className="member-remove-btn"
                                            onClick={() => handleRemoveClick(member)}
                                            title="스터디에서 제외"
                                        >
                                            제외
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {confirmingMember && (
                <ConfirmModal
                    message={`정말 '${confirmingMember.name}' 스터디원을 스터디에서 제외하시겠습니까?`}
                    onConfirm={handleConfirmRemove}
                    onCancel={handleCancelRemove}
                />
            )}
        </div>
    );
};

export default ManageMembersModal;
