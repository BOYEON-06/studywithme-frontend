import React from "react";

type ConfirmModalProps = {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="study-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-modal-content">
                    <span className="confirm-icon">⚠️</span>
                    <p className="confirm-message">{message}</p>
                </div>
                <div className="modal-actions confirm-actions">
                    <button className="modal-cancel-btn confirm-btn-cancel" onClick={onCancel}>
                        취소
                    </button>
                    <button className="modal-submit-btn confirm-btn-confirm" onClick={onConfirm}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
