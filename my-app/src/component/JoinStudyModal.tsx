import React, { useState } from "react";

type JoinStudyModalProps = {
    onClose: () => void;
    onJoin: (inviteCode: string) => Promise<void>;
};

const JoinStudyModal: React.FC<JoinStudyModalProps> = ({
    onClose,
    onJoin,
}) => {
    const [inviteCode, setInviteCode] = useState("");
    const [joining, setJoining] = useState(false);

    const handleJoin = async () => {
        if (!inviteCode.trim()) {
            alert("초대코드를 입력하세요.");
            return;
        }

        try {
            setJoining(true);
            await onJoin(inviteCode);
            onClose();
        } catch (error) {
            console.error(error);
            alert("스터디 참여에 실패했습니다. 초대코드 또는 로그인 상태를 확인해주세요.");
        } finally {
            setJoining(false);
        }
    };

    const handleClose = () => {
        if (joining) return;
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="study-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">Join Study</p>
                        <h2>스터디 참여</h2>
                    </div>

                    <button className="modal-close-btn" onClick={handleClose}>
                        ×
                    </button>
                </div>

                <div className="modal-form">
                    <label>
                        초대코드
                        <input
                            type="text"
                            placeholder="예: A1BF1D89"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                    </label>
                </div>

                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={handleClose}>
                        취소
                    </button>

                    <button
                        className="modal-submit-btn"
                        onClick={handleJoin}
                        disabled={joining}
                    >
                        {joining ? "참여 중..." : "참여하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinStudyModal;