import React from 'react';
import { Modal } from 'antd';
import './error.scss';

const ErrorPopup = ({ isVisible, content, handleClose }) => {
  return (
    <div style={{ position: 'absolute', zIndex: '9999' }}>
      <Modal
        open={isVisible}
        onCancel={handleClose}
        footer={null}
        className={'error-popup'}
        styles={{ zIndex: 9999 }}
      >
        {content}
      </Modal>
    </div>
  );
};

export default ErrorPopup;
