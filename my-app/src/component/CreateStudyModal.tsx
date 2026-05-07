import React, { useState } from "react";

type CreateStudyModalProps = {
    onClose: () => void;
    onCreate: (title: string, description: string) => Promise<void>;
};

const CreateStudyModal: React.FC<CreateStudyModalProps> = ({
    onClose,
    onCreate,
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) {
            alert("스터디 제목을 입력하세요.");
            return;
        }

        if (!description.trim()) {
            alert("스터디 설명을 입력하세요.");
            return;
        }

        try {
            setCreating(true);
            await onCreate(title, description);
            onClose();
        } catch (error) {
            console.error(error);
            alert("스터디 생성에 실패했습니다. 로그인 상태를 확인해주세요.");
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
            <div className="study-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-label">New Study</p>
                        <h2>스터디 생성</h2>
                    </div>

                    <button className="modal-close-btn" onClick={handleClose}>
                        ×
                    </button>
                </div>

                <div className="modal-form">
                    <label>
                        스터디 제목
                        <input
                            type="text"
                            placeholder="예: Spring Boot 스터디 모집"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </label>

                    <label>
                        스터디 설명
                        <textarea
                            placeholder="스터디 소개, 목표, 진행 방식 등을 입력하세요."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
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
                        {creating ? "생성 중..." : "생성하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStudyModal;