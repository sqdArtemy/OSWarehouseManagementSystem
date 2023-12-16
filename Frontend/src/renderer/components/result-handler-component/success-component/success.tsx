import React from 'react';
import { Modal } from 'antd';
import './success.scss';

const SuccessPopup = ({ isVisible, content, handleClose }) => {
  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      className={'success-popup'}
      zIndex={9999}
    >
      {content}
    </Modal>
  );
};

export default SuccessPopup;
