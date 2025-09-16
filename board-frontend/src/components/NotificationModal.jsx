import React from 'react';
import '../styles/NotificationModal.css';

function NotificationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소"
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          {/* onConfirm 함수가 있을 때만 확인 버튼을 보여줍니다 (Confirm 모달) */}
          {onConfirm && (
            <button onClick={onConfirm} className="button-confirm">
              {confirmText}
            </button>
          )}
          {/* onClose 함수는 항상 존재합니다 (Alert/Confirm 모달의 닫기/취소 버튼) */}
          <button onClick={onClose} className="button-cancel">
            {onConfirm ? cancelText : '닫기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
