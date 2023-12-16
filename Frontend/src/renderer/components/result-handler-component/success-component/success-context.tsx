import React, { createContext, useContext, useState } from 'react';
import SuccessPopup from './success';

const SuccessContext = createContext({});

export const useSuccess = () => useContext(SuccessContext);

export const SuccessProvider = ({ children }) => {
  const [modalProps, setModalProps] = useState({
    isVisible: false,
    content: null,
  });

  const showSuccess = (content) => {
    setModalProps({ isVisible: true, content });
  };

  const hideSuccess = () => {
    setModalProps({ isVisible: false, content: null });
  };

  return (
    <SuccessContext.Provider value={{ showSuccess, hideSuccess }}>
      {children}
      <SuccessPopup {...modalProps} handleClose={hideSuccess} />
    </SuccessContext.Provider>
  );
};
