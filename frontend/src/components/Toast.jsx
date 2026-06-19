import React from 'react';

const Toast = ({ message, type, show, onClose }) => {
  return (
    <div
      className={`toast-custom ${type} ${show ? 'show' : ''}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="d-flex align-items-center gap-2">
        {type === 'success' ? (
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
        ) : (
          <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
        )}
        <span className="fw-medium">{message}</span>
      </div>
      <button
        type="button"
        className="btn-close btn-close-white ms-3"
        onClick={onClose}
        aria-label="Close"
      ></button>
    </div>
  );
};

export default Toast;
