import React, { useEffect } from "react";

type ToastProps = {
    message: string;
    onClose: () => void;
    duration?: number;
};

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="custom-toast">
            <span className="toast-icon">✨</span>
            <span className="toast-message">{message}</span>
        </div>
    );
};

export default Toast;
