import React from 'react';
import { Modal } from 'antd';
import './error.scss';

const ErrorPopup = ({ isVisible, content, handleClose }) => {
  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      className={'error-popup'}
    >
      {content}
    </Modal>
  );
};

export default ErrorPopup;
